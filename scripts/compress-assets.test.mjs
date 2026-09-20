import { mkdir, mkdtemp, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { brotliDecompressSync, gunzipSync } from 'node:zlib';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { compressAssets } from './compress-assets.mjs';

const text = (marker, repeats) => `${marker}\n`.repeat(repeats);

describe('build-time asset precompression', () => {
  let distDir;
  let logger;

  beforeEach(async () => {
    distDir = await mkdtemp(join(tmpdir(), 'horizon-compress-'));
    await mkdir(join(distDir, 'assets'));
    logger = { info: vi.fn(), error: vi.fn() };
  });

  it('writes brotli and gzip siblings for compressible assets above the threshold', async () => {
    const script = text('console.log("horizon");', 200);
    await writeFile(join(distDir, 'assets', 'horizon-ABC123.js'), script);
    await writeFile(join(distDir, 'index.html'), text('<p>horizon</p>', 200));

    const summary = await compressAssets({ distDir, logger });

    expect(summary.files).toBe(2);
    const brotli = await readFile(join(distDir, 'assets', 'horizon-ABC123.js.br'));
    const gzip = await readFile(join(distDir, 'assets', 'horizon-ABC123.js.gz'));
    expect(brotliDecompressSync(brotli).toString()).toBe(script);
    expect(gunzipSync(gzip).toString()).toBe(script);
    // The whole point of the pass: far fewer bytes cross the origin's slow
    // uplink than the raw chunk would.
    expect(brotli.byteLength).toBeLessThan(Buffer.byteLength(script) / 2);
    expect(summary.brotliBytes).toBeLessThan(summary.rawBytes);
    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(logger.info.mock.calls[0][0]).toContain('compress-assets: 2 files');
  });

  it('skips small files, binary assets, and already encoded siblings', async () => {
    await writeFile(join(distDir, 'assets', 'tiny-ABC123.css'), '.a{color:red}');
    await writeFile(join(distDir, 'assets', 'photo-ABC123.png'), Buffer.alloc(4096, 7));
    await writeFile(join(distDir, 'assets', 'font-ABC123.woff2'), Buffer.alloc(4096, 9));
    await writeFile(join(distDir, 'assets', 'stale-ABC123.js.br'), Buffer.alloc(4096, 1));

    const summary = await compressAssets({ distDir, logger });

    expect(summary.files).toBe(0);
    expect(summary.skipped).toBe(1);
    const entries = await readdir(join(distDir, 'assets'));
    expect(entries.filter((name) => name.endsWith('.br') || name.endsWith('.gz'))).toEqual([
      'stale-ABC123.js.br',
    ]);
  });

  it('honours a custom threshold', async () => {
    await writeFile(join(distDir, 'assets', 'small-ABC123.css'), text('.a{color:red}', 4));

    expect((await compressAssets({ distDir, logger })).files).toBe(0);
    expect((await compressAssets({ distDir, minBytes: 16, logger })).files).toBe(1);
  });

  it('is idempotent and leaves up-to-date output untouched', async () => {
    const assetPath = join(distDir, 'assets', 'horizon-ABC123.js');
    await writeFile(assetPath, text('console.log("horizon");', 200));

    const first = await compressAssets({ distDir, logger });
    const brotliStat = await stat(`${assetPath}.br`);
    const second = await compressAssets({ distDir, logger });

    expect(second).toEqual(first);
    expect((await stat(`${assetPath}.br`)).mtimeMs).toBe(brotliStat.mtimeMs);
  });

  it('recompresses when the source asset changes', async () => {
    const assetPath = join(distDir, 'assets', 'horizon-ABC123.js');
    await writeFile(assetPath, text('console.log("horizon");', 200));
    await compressAssets({ distDir, logger });

    const updated = text('console.log("horizon rebuilt");', 200);
    await writeFile(assetPath, updated);
    await compressAssets({ distDir, logger });

    expect(brotliDecompressSync(await readFile(`${assetPath}.br`)).toString()).toBe(updated);
    expect(gunzipSync(await readFile(`${assetPath}.gz`)).toString()).toBe(updated);
  });

  it('reports an empty summary when the dist directory is missing', async () => {
    const summary = await compressAssets({ distDir: join(distDir, 'nope'), logger });

    expect(summary).toEqual({
      files: 0,
      skipped: 0,
      rawBytes: 0,
      brotliBytes: 0,
      gzipBytes: 0,
    });
  });
});

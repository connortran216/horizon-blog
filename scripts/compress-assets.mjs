import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, constants, gzipSync } from 'node:zlib';

const moduleDir = fileURLToPath(new URL('.', import.meta.url));
const defaultDistDir = resolve(moduleDir, '../dist');

// Only text formats Vite actually emits. Everything else in `dist/` - images,
// fonts, `.woff2` - is already compressed, so a second pass would cost build
// time and usually produce a *larger* file.
export const COMPRESSIBLE_EXTENSIONS = new Set([
  '.css',
  '.html',
  '.js',
  '.json',
  '.map',
  '.mjs',
  '.svg',
  '.txt',
  '.webmanifest',
  '.xml',
]);

// Below roughly one packet there is nothing to win, and the framing overhead
// can make the compressed copy bigger than the original.
export const DEFAULT_MIN_BYTES = 1024;

const ENCODED_EXTENSIONS = new Set(['.br', '.gz']);

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const collectFiles = async (dir) => {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const files = [];
  for (const entry of entries) {
    const entryPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(entryPath)));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }
  return files;
};

// Rewriting an up-to-date sibling costs seconds of brotli quality 11 for no
// gain, so a second run over an unchanged `dist/` is a no-op.
const isUpToDate = async (targetPath, sourceMtimeMs) => {
  try {
    const targetStat = await stat(targetPath);
    return targetStat.isFile() && targetStat.mtimeMs >= sourceMtimeMs;
  } catch {
    return false;
  }
};

const writeIfStale = async (targetPath, sourceMtimeMs, compress) => {
  if (await isUpToDate(targetPath, sourceMtimeMs)) {
    return (await stat(targetPath)).size;
  }
  const payload = compress();
  await writeFile(targetPath, payload);
  return payload.byteLength;
};

export const compressAssets = async ({
  distDir = defaultDistDir,
  minBytes = DEFAULT_MIN_BYTES,
  logger = console,
} = {}) => {
  const root = resolve(distDir);
  const candidates = (await collectFiles(root)).filter((filePath) => {
    const extension = extname(filePath).toLowerCase();
    return !ENCODED_EXTENSIONS.has(extension) && COMPRESSIBLE_EXTENSIONS.has(extension);
  });

  const summary = { files: 0, skipped: 0, rawBytes: 0, brotliBytes: 0, gzipBytes: 0 };

  for (const filePath of candidates.sort()) {
    const fileStat = await stat(filePath);
    if (fileStat.size < minBytes) {
      summary.skipped += 1;
      continue;
    }

    const source = await readFile(filePath);
    const brotliBytes = await writeIfStale(`${filePath}.br`, fileStat.mtimeMs, () =>
      brotliCompressSync(source, {
        params: {
          [constants.BROTLI_PARAM_QUALITY]: constants.BROTLI_MAX_QUALITY,
          [constants.BROTLI_PARAM_SIZE_HINT]: source.byteLength,
        },
      }),
    );
    const gzipBytes = await writeIfStale(`${filePath}.gz`, fileStat.mtimeMs, () =>
      gzipSync(source, { level: 9 }),
    );

    summary.files += 1;
    summary.rawBytes += source.byteLength;
    summary.brotliBytes += brotliBytes;
    summary.gzipBytes += gzipBytes;
  }

  const ratio = summary.rawBytes
    ? `${((1 - summary.brotliBytes / summary.rawBytes) * 100).toFixed(1)}% smaller`
    : 'nothing to compress';
  logger.info(
    `compress-assets: ${summary.files} files, ${formatBytes(summary.rawBytes)} -> ${formatBytes(summary.brotliBytes)} br / ${formatBytes(summary.gzipBytes)} gz (${ratio}), ${summary.skipped} below ${minBytes} B`,
  );

  return summary;
};

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : undefined;
if (invokedPath === resolve(fileURLToPath(import.meta.url))) {
  await compressAssets();
}

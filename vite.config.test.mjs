import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import config from './vite.config.ts';

describe('production entry performance', () => {
  it('does not force optional editor dependencies into static entry chunks', () => {
    const output = Array.isArray(config.build?.rollupOptions?.output)
      ? config.build?.rollupOptions?.output
      : [config.build?.rollupOptions?.output];

    expect(output.some((item) => typeof item?.manualChunks === 'function')).toBe(false);
  });

  it('keeps CV-only web fonts off public entry routes', async () => {
    const [html, css, cvCss, cvPage] = await Promise.all([
      readFile(new URL('./index.html', import.meta.url), 'utf8'),
      readFile(new URL('./src/index.css', import.meta.url), 'utf8'),
      readFile(new URL('./src/features/cv/cv-fonts.css', import.meta.url), 'utf8'),
      readFile(new URL('./src/features/cv/pages/CvPage.tsx', import.meta.url), 'utf8'),
    ]);

    expect(html).toContain('<link rel="preconnect" href="https://images.unsplash.com" />');
    expect(html).not.toContain('fonts.googleapis.com');
    expect(css).not.toContain('@import url(\'https://fonts.googleapis.com');
    // Public Sans used to be a render-blocking `@import` from Google's CSS2
    // endpoint, fetched on every visit to `/cv` alone. It is now self-hosted -
    // see `src/features/cv/cv-fonts.css` - the same way `src/theme/bitter.css`
    // already self-hosts Bitter, so no route loads a third-party font host.
    expect(cvCss).not.toContain('fonts.googleapis.com');
    expect(cvCss).not.toContain('fonts.gstatic.com');
    expect(cvCss).toContain('font-family: \'Public Sans\'');
    expect(cvCss).toContain('/fonts/public-sans/');
    // Still isolated to the CV route: the vendored font file is only pulled
    // in through `cv-fonts.css`, which only `CvPage` imports.
    expect(css).not.toContain('/fonts/public-sans/');
    expect(html).not.toContain('/fonts/public-sans/');
    expect(cvPage).toContain('import \'../cv-fonts.css\'');
  });
});

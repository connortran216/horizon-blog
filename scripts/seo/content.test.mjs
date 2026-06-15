import { describe, expect, it } from 'vitest';
import {
  buildExcerpt,
  extractFirstImageUrl,
  getReadingTime,
  renderMarkdown,
  stripMarkdown,
} from './content.mjs';

describe('SEO content rendering', () => {
  it('renders useful semantic Markdown structures', () => {
    const html = renderMarkdown(`# API Safety

Measure *first* and **optimize second**.

> Evidence before changes.

1. Observe
2. Measure

| Signal | Meaning |
| --- | --- |
| p95 | Tail latency |

\`\`\`go
func main() {}
\`\`\`

[Read more](/blog/75)
`);

    expect(html).toContain('<h1 id="api-safety">API Safety</h1>');
    expect(html).toContain('<em>first</em>');
    expect(html).toContain('<strong>optimize second</strong>');
    expect(html).toContain('<blockquote>');
    expect(html).toContain('<ol>');
    expect(html).toContain('<table>');
    expect(html).toContain('<code class="language-go">');
    expect(html).toContain('<a href="/blog/75">Read more</a>');
  });

  it('escapes raw HTML and rejects executable links and images', () => {
    const html = renderMarkdown(`<script>alert("x")</script>

<img src=x onerror=alert(1)>

[unsafe](javascript:alert(1))

![tracker](data:image/svg+xml;base64,abc)

[safe](https://example.com)
`);

    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img src=x');
    expect(html).not.toContain('href="javascript:');
    expect(html).not.toContain('src="data:');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(html).toContain('<span>unsafe</span>');
    expect(html).toContain('<span role="img" aria-label="tracker">tracker</span>');
    expect(html).toContain(
      '<a href="https://example.com" rel="noopener noreferrer">safe</a>',
    );
  });

  it('creates stable unique heading ids and safe image markup', () => {
    const html = renderMarkdown(`# Same

## Same

![Cover](https://blog.connortran.io.vn/cover.png "Title")

![Protected](media://37)
`);

    expect(html).toContain('<h1 id="same">Same</h1>');
    expect(html).toContain('<h2 id="same-2">Same</h2>');
    expect(html).toContain(
      '<img src="https://blog.connortran.io.vn/cover.png" alt="Cover" title="Title" loading="lazy" />',
    );
    expect(html).toContain('<span role="img" aria-label="Protected">Protected</span>');
  });

  it('derives plain text, excerpts, reading time, and first images from Markdown', () => {
    const markdown = `# A title

![alt](media://37)

[Performance work](https://example.com) starts with evidence, not guesses.
`;

    expect(stripMarkdown(markdown)).toBe(
      'A title Performance work starts with evidence, not guesses.',
    );
    expect(buildExcerpt(markdown, 34)).toBe('A title Performance work starts...');
    expect(getReadingTime('word '.repeat(201))).toBe(2);
    expect(extractFirstImageUrl(markdown)).toBe('media://37');
    expect(extractFirstImageUrl('<img src="/cover.png" alt="cover">')).toBe('/cover.png');
  });
});

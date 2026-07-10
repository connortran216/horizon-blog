import { describe, expect, it } from 'vitest'

import { extractMarkdownHeadings } from './heading.utils'

describe('heading utilities', () => {
  it('extracts h2 and h3 markdown headings with stable ids', () => {
    const headings = extractMarkdownHeadings(`
# Title

## Why services matter
### Repository boundary
## Why services matter
#### Too deep
`)

    expect(headings).toEqual([
      { id: 'why-services-matter', text: 'Why services matter', depth: 2 },
      { id: 'repository-boundary', text: 'Repository boundary', depth: 3 },
      { id: 'why-services-matter-2', text: 'Why services matter', depth: 2 },
    ])
  })

  it('ignores headings inside fenced code blocks', () => {
    const headings = extractMarkdownHeadings(`
## Real heading

\`\`\`md
## Code heading
\`\`\`

### After code
`)

    expect(headings).toEqual([
      { id: 'real-heading', text: 'Real heading', depth: 2 },
      { id: 'after-code', text: 'After code', depth: 3 },
    ])
  })
})

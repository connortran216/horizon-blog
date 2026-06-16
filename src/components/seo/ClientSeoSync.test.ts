import { describe, expect, it, vi } from 'vitest'
import { extractManagedSeoHead, replaceManagedSeoHead } from './ClientSeoSync'

describe('client SEO head synchronization', () => {
  it('extracts the server-managed head block from a rendered document', () => {
    const html = `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <!--app-meta:start-->
    <title data-horizon-seo="true">Article | Horizon</title>
    <link data-horizon-seo="true" rel="canonical" href="https://example.com/blog/76" />
    <!--app-meta:end-->
  </head>
</html>`

    expect(extractManagedSeoHead(html)).toContain('Article | Horizon')
    expect(extractManagedSeoHead(html)).toContain('rel="canonical"')
    expect(extractManagedSeoHead(html)).not.toContain('charset')
  })

  it('replaces only managed head elements', () => {
    const removeFirst = vi.fn()
    const removeSecond = vi.fn()
    const append = vi.fn()
    const template = {
      innerHTML: '',
      content: { nodeType: 11 },
    }
    const documentLike = {
      head: {
        querySelectorAll: vi
          .fn()
          .mockReturnValue([{ remove: removeFirst }, { remove: removeSecond }]),
        append,
      },
      createElement: vi.fn().mockReturnValue(template),
    }

    replaceManagedSeoHead(
      documentLike as unknown as Pick<Document, 'head' | 'createElement'>,
      '<title data-horizon-seo="true">Blog | Horizon</title>',
    )

    expect(documentLike.head.querySelectorAll).toHaveBeenCalledWith('[data-horizon-seo="true"]')
    expect(removeFirst).toHaveBeenCalledOnce()
    expect(removeSecond).toHaveBeenCalledOnce()
    expect(template.innerHTML).toContain('Blog | Horizon')
    expect(append).toHaveBeenCalledWith(template.content)
  })
})

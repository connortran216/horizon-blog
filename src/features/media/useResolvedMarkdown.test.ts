import { describe, expect, it } from 'vitest'
import { buildResolvedMarkdownMedia } from './useResolvedMarkdown'

describe('resolved markdown media', () => {
  it('keeps durable tokens in source input while returning fallback content and manifests', () => {
    const markdown = 'Before ![diagram](media://101) after'
    const source = {
      id: '101',
      url: 'https://media.test/original.png',
      width: 1200,
      height: 800,
      variants: [
        {
          url: 'https://media.test/w640.webp',
          mimeType: 'image/webp',
          sizeBytes: 100,
          width: 640,
          height: 427,
        },
      ],
    }

    const result = buildResolvedMarkdownMedia(markdown, { '101': source })

    expect(markdown).toContain('media://101')
    expect(result.content).toContain('https://media.test/original.png')
    expect(result.sources['101']).toBe(source)
  })

  it('leaves unresolved tokens intact', () => {
    expect(buildResolvedMarkdownMedia('![missing](media://999)', {}).content).toBe(
      '![missing](media://999)',
    )
  })
})

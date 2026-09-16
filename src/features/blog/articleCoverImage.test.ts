import { describe, expect, it } from 'vitest'

import { extractArticleCoverImage } from './articleCoverImage.logic'

describe('extractArticleCoverImage', () => {
  it('promotes a standalone image at the very start of the article', () => {
    const result = extractArticleCoverImage(
      '![A wide mountain view](https://example.com/cover.jpg)\n\n# Heading\n\nBody text.',
    )

    expect(result).not.toBeNull()
    expect(result?.cover).toEqual({
      src: 'https://example.com/cover.jpg',
      alt: 'A wide mountain view',
    })
    expect(result?.content).toBe('# Heading\n\nBody text.')
  })

  it('does not render the promoted image a second time', () => {
    const markdown = '![Cover](https://example.com/cover.jpg)\n\nBody text.'
    const result = extractArticleCoverImage(markdown)

    expect(result?.content).not.toContain('cover.jpg')
  })

  it('leaves an empty alt as empty, for the caller to fall back on', () => {
    const result = extractArticleCoverImage('![](https://example.com/cover.jpg)\n\nBody text.')

    expect(result?.cover.alt).toBe('')
  })

  it('reads the URL out of angle brackets', () => {
    const result = extractArticleCoverImage('![Cover](<https://example.com/my cover.jpg>)\n\nBody.')

    expect(result?.cover.src).toBe('https://example.com/my cover.jpg')
  })

  it('discards a title rather than leaving it in the src', () => {
    const result = extractArticleCoverImage(
      '![Cover](https://example.com/cover.jpg "A caption")\n\nBody.',
    )

    expect(result?.cover.src).toBe('https://example.com/cover.jpg')
  })

  it('promotes a bare HTML img tag standing alone', () => {
    const result = extractArticleCoverImage(
      '<img src="https://example.com/cover.jpg" alt="Cover" />\n\nBody text.',
    )

    expect(result?.cover).toEqual({ src: 'https://example.com/cover.jpg', alt: 'Cover' })
    expect(result?.content).toBe('Body text.')
  })

  it('tolerates leading blank lines before the image', () => {
    const result = extractArticleCoverImage(
      '\n\n   \n\n![Cover](https://example.com/cover.jpg)\n\nBody text.',
    )

    expect(result?.cover.src).toBe('https://example.com/cover.jpg')
    expect(result?.content).toBe('Body text.')
  })

  it('preserves every later block unchanged, in order', () => {
    const result = extractArticleCoverImage(
      '![Cover](https://example.com/cover.jpg)\n\n# Heading\n\nFirst paragraph.\n\nSecond paragraph.',
    )

    expect(result?.content).toBe('# Heading\n\nFirst paragraph.\n\nSecond paragraph.')
  })

  it('does not promote an image sitting inline inside a sentence', () => {
    const markdown = 'As shown here ![diagram](https://example.com/diagram.png) in the figure.'

    expect(extractArticleCoverImage(markdown)).toBeNull()
  })

  it('does not promote an image nested inside a blockquote', () => {
    const markdown = '> ![Cover](https://example.com/cover.jpg)\n\nBody text.'

    expect(extractArticleCoverImage(markdown)).toBeNull()
  })

  it('does not promote an image nested inside a list item', () => {
    const markdown = '- ![Cover](https://example.com/cover.jpg)\n\nBody text.'

    expect(extractArticleCoverImage(markdown)).toBeNull()
  })

  it('does not promote an image that shares its block with a caption line', () => {
    // A single newline (no blank line) keeps this one block in the
    // CommonMark-ish sense this module uses; the whole-block match then
    // fails because the block is not *only* the image.
    const markdown = '![Cover](https://example.com/cover.jpg)\n*Photo credit: someone*\n\nBody.'

    expect(extractArticleCoverImage(markdown)).toBeNull()
  })

  it('does not promote anything when a heading comes first', () => {
    const markdown = '# Title\n\n![Cover](https://example.com/cover.jpg)\n\nBody text.'

    expect(extractArticleCoverImage(markdown)).toBeNull()
  })

  it('returns null for an article with no image at all', () => {
    expect(extractArticleCoverImage('# Heading\n\nJust text, no pictures.')).toBeNull()
  })

  it('returns null for empty markdown', () => {
    expect(extractArticleCoverImage('')).toBeNull()
    expect(extractArticleCoverImage('   \n\n  ')).toBeNull()
  })

  describe('caption', () => {
    it('lifts a whole-block italic line directly under the cover out as its caption', () => {
      const result = extractArticleCoverImage(
        '![Cover](https://example.com/cover.jpg)\n\n*Photo credit: someone*\n\nBody text.',
      )

      expect(result?.caption).toBe('Photo credit: someone')
      expect(result?.content).toBe('Body text.')
    })

    it('also reads an underscore-emphasis caption', () => {
      const result = extractArticleCoverImage(
        '![Cover](https://example.com/cover.jpg)\n\n_Photo credit: someone_\n\nBody text.',
      )

      expect(result?.caption).toBe('Photo credit: someone')
      expect(result?.content).toBe('Body text.')
    })

    it('leaves caption undefined - not an empty string - when there is none', () => {
      const result = extractArticleCoverImage(
        '![Cover](https://example.com/cover.jpg)\n\nBody text.',
      )

      expect(result?.caption).toBeUndefined()
      expect('caption' in (result ?? {})).toBe(false)
    })

    it('does not treat the article opening with an ordinary paragraph as a caption', () => {
      const result = extractArticleCoverImage(
        '![Cover](https://example.com/cover.jpg)\n\nThis is the real opening paragraph.\n\nMore.',
      )

      expect(result?.caption).toBeUndefined()
      expect(result?.content).toBe('This is the real opening paragraph.\n\nMore.')
    })

    it('does not treat a heading right after the cover as a caption', () => {
      const result = extractArticleCoverImage(
        '![Cover](https://example.com/cover.jpg)\n\n# Heading\n\nBody.',
      )

      expect(result?.caption).toBeUndefined()
      expect(result?.content).toBe('# Heading\n\nBody.')
    })

    it('does not treat a block only partly in emphasis as a caption', () => {
      const result = extractArticleCoverImage(
        '![Cover](https://example.com/cover.jpg)\n\n*Photo credit:* someone, cropped.\n\nBody.',
      )

      expect(result?.caption).toBeUndefined()
      expect(result?.content).toBe('*Photo credit:* someone, cropped.\n\nBody.')
    })

    it('does not treat an italic line nested inside a blockquote as a caption', () => {
      const result = extractArticleCoverImage(
        '![Cover](https://example.com/cover.jpg)\n\n> *Photo credit: someone*\n\nBody.',
      )

      expect(result?.caption).toBeUndefined()
      expect(result?.content).toBe('> *Photo credit: someone*\n\nBody.')
    })

    it('only claims the block right after the cover, never a later one', () => {
      const result = extractArticleCoverImage(
        '![Cover](https://example.com/cover.jpg)\n\nOpening paragraph.\n\n*Not a caption, just emphasis further down.*',
      )

      expect(result?.caption).toBeUndefined()
      expect(result?.content).toBe(
        'Opening paragraph.\n\n*Not a caption, just emphasis further down.*',
      )
    })
  })
})

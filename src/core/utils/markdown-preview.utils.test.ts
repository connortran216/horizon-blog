import { describe, expect, it } from 'vitest'

import { buildExcerptFromMarkdown, extractPreviewText } from './markdown-preview.utils'

describe('extractPreviewText', () => {
  it('turns emphasis into plain text rather than deleting the words', () => {
    expect(extractPreviewText('**đậm** và _in nghiêng_ và ***cả hai***')).toBe(
      'đậm và in nghiêng và cả hai',
    )
    expect(extractPreviewText('__đậm kiểu gạch__ và ~~gạch ngang~~')).toBe(
      'đậm kiểu gạch và gạch ngang',
    )
  })

  it('keeps Vietnamese diacritics untouched', () => {
    const input = 'Chuẩn hoá dữ liệu tiếng Việt: ệ ữ ạ Đ ương ăn'
    expect(extractPreviewText(input)).toBe(input)
  })

  it('reduces a link to its visible text and drops the URL', () => {
    expect(extractPreviewText('Đọc thêm tại [chữ](https://example.com/path)')).toBe(
      'Đọc thêm tại chữ',
    )
  })

  it('reduces a reference-style link to its visible text', () => {
    expect(extractPreviewText('Xem [tài liệu][ref] để biết thêm.')).toBe(
      'Xem tài liệu để biết thêm.',
    )
  })

  it('drops inline and reference-style images entirely', () => {
    expect(extractPreviewText('trước ![alt](cover.png) sau')).toBe('trước sau')
    expect(extractPreviewText('trước ![alt][cover] sau')).toBe('trước sau')
  })

  it('unwraps inline code and drops fenced code blocks', () => {
    expect(extractPreviewText('dùng `useEffect` ở đây')).toBe('dùng useEffect ở đây')
    expect(extractPreviewText('trước\n```js\nconst x = 1\n```\nsau')).toBe('trước sau')
  })

  it('strips heading markers, including a repeated closing hash', () => {
    expect(extractPreviewText('# Tiêu đề chính')).toBe('Tiêu đề chính')
    expect(extractPreviewText('## Tiêu đề ##')).toBe('Tiêu đề')
  })

  it('drops a horizontal rule line without touching a hyphenated word', () => {
    expect(extractPreviewText('trước\n---\nsau')).toBe('trước sau')
    expect(extractPreviewText('trước\n***\nsau')).toBe('trước sau')
    expect(extractPreviewText('trước\n___\nsau')).toBe('trước sau')
    expect(extractPreviewText('một từ well-known vẫn còn nguyên')).toBe(
      'một từ well-known vẫn còn nguyên',
    )
  })

  it('drops a Setext heading underline', () => {
    expect(extractPreviewText('Tiêu đề\n=====\nsau')).toBe('Tiêu đề sau')
  })

  it('removes a markdown table, separator row included', () => {
    const table = '| Cột 1 | Cột 2 |\n| --- | --- |\n| a | b |'
    expect(extractPreviewText(table)).toBe('Cột 1 Cột 2 a b')
  })

  it('drops a task-list checkbox along with its bullet', () => {
    expect(extractPreviewText('- [ ] việc chưa xong\n- [x] việc đã xong')).toBe(
      'việc chưa xong việc đã xong',
    )
  })

  it('strips plain bullet and numbered list markers', () => {
    expect(extractPreviewText('- một\n- hai')).toBe('một hai')
    expect(extractPreviewText('1. một\n2. hai')).toBe('một hai')
  })

  it('strips a blockquote marker', () => {
    expect(extractPreviewText('> trích dẫn hay')).toBe('trích dẫn hay')
  })

  it('drops a footnote reference glued to the preceding word', () => {
    expect(extractPreviewText('một khẳng định[^1] cần kiểm chứng')).toBe(
      'một khẳng định cần kiểm chứng',
    )
  })

  it('drops a reference-link definition line', () => {
    expect(extractPreviewText('trước\n[ref]: https://example.com "tiêu đề"\nsau')).toBe('trước sau')
  })

  it('decodes common HTML entities', () => {
    // Escaped entities are literal text the author wrote (e.g. a code sample
    // showing a tag), not real markup - they decode to the characters shown,
    // rather than being parsed and stripped as if they were live HTML.
    expect(extractPreviewText('Cà phê &amp; trà, &lt;b&gt;đậm&lt;/b&gt;')).toBe(
      'Cà phê & trà, <b>đậm</b>',
    )
  })

  it('strips raw HTML tags and autolinks', () => {
    expect(extractPreviewText('<p>đoạn văn</p> và <https://example.com>')).toBe(
      'đoạn văn và https://example.com',
    )
  })

  it('collapses blank lines and internal whitespace', () => {
    expect(extractPreviewText('dòng một\n\n\ndòng   hai')).toBe('dòng một dòng hai')
  })

  it('returns an empty string for empty input', () => {
    expect(extractPreviewText('')).toBe('')
  })
})

describe('buildExcerptFromMarkdown', () => {
  it('truncates plain text with an ellipsis past the max length', () => {
    const longText = 'từ '.repeat(100).trim()
    const result = buildExcerptFromMarkdown(longText, 20)

    expect(result.endsWith('...')).toBe(true)
    expect(result.length).toBeLessThanOrEqual(23)
  })

  it('falls back to the caller-provided message when there is no content', () => {
    expect(buildExcerptFromMarkdown('', 150, 'Không có nội dung')).toBe('Không có nội dung')
  })
})

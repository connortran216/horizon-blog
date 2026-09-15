import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import theme from '../../../theme/horizon'
import SeriesPartList from './SeriesPartList'

describe('SeriesPartList', () => {
  it('renders the approved public order without progress state', () => {
    const markup = renderToStaticMarkup(
      <ChakraProvider theme={theme}>
        <MemoryRouter>
          <SeriesPartList
            parts={[
              {
                postId: 42,
                title: 'Indexes first',
                excerpt: 'Start with the read path.',
                readingTime: 6,
                tags: ['database'],
                position: 1,
                publishedAt: null,
              },
              {
                postId: 43,
                title: 'Query plans',
                excerpt: 'Read what the planner sees.',
                readingTime: 8,
                tags: ['postgresql'],
                position: 2,
                publishedAt: null,
              },
            ]}
          />
        </MemoryRouter>
      </ChakraProvider>,
    )

    expect(markup).toContain('aria-label="Series blogs"')
    expect(markup).toContain('Indexes first')
    expect(markup).toContain('Query plans')
    expect(markup.indexOf('Indexes first')).toBeLessThan(markup.indexOf('Query plans'))
    /*
     * The position wording used to be "Start here" for the opener and "Part 02"
     * for the rest. `DESIGN.md` fixes one phrasing for Series position across
     * the whole system - the same one a post's metadata line already used - so
     * the list now says "Part 1 of 2". The ordinal marker still carries the
     * padded "01" that keeps the left edge of the list straight.
     */
    expect(markup).toContain('Part 1 of 2')
    expect(markup).toContain('Part 2 of 2')
    expect(markup).toContain('01')
    expect(markup).toContain('02')
    expect(markup).toContain('6 min read')
    expect(markup).not.toContain('Opened')
    expect(markup).not.toContain('Progress')
  })

  /*
   * A part's title sits beside its ordinal marker in a CSS grid column that
   * the marker's fixed width and the arrow icon's column both eat into. A
   * long Vietnamese title - real content on this blog, not a placeholder -
   * is the case that column actually has to hold.
   */
  it('renders a long Vietnamese part title in full', () => {
    const longTitle =
      'Thiết kế chỉ mục cho hệ cơ sở dữ liệu quan hệ ở quy mô hàng trăm triệu bản ghi'

    const markup = renderToStaticMarkup(
      <ChakraProvider theme={theme}>
        <MemoryRouter>
          <SeriesPartList
            parts={[
              {
                postId: 42,
                title: longTitle,
                excerpt: 'Start with the read path.',
                readingTime: 6,
                tags: ['database'],
                position: 1,
                publishedAt: null,
              },
            ]}
          />
        </MemoryRouter>
      </ChakraProvider>,
    )

    expect(markup).toContain(longTitle)
  })
})

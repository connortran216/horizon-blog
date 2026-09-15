import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import theme from '../../../theme/horizon'
import SeriesCard from './SeriesCard'

describe('SeriesCard', () => {
  it('renders a full-card link with public Series metadata', () => {
    const markup = renderToStaticMarkup(
      <ChakraProvider theme={theme}>
        <MemoryRouter>
          <SeriesCard
            series={{
              id: 9,
              slug: 'database-engineering',
              title: 'Database Engineering',
              description: 'Connected blogs about practical database design.',
              author: { id: 1, name: 'Connor Tran' },
              partCount: 4,
              updatedAt: '2026-08-16T00:00:00Z',
            }}
          />
        </MemoryRouter>
      </ChakraProvider>,
    )

    expect(markup).toContain('href="/series/database-engineering"')
    expect(markup).toContain('Database Engineering')
    expect(markup).toContain('Series · 4 blogs')
    expect(markup).toContain('Connor Tran')
  })

  /*
   * Vietnamese is real content on this blog, and a long Vietnamese title has
   * no short words to break on the way a hyphenated English one does. The
   * card must still render the whole title - and the wrap safety the link
   * itself carries - rather than silently depending on a short one.
   */
  it('renders a long Vietnamese title in full, with wrap safety intact', () => {
    const longTitle =
      'Kiến trúc hệ thống phân tán: từ nguyên lý điều phối dữ liệu đến vận hành thực tế trong môi trường sản xuất quy mô lớn'

    const markup = renderToStaticMarkup(
      <ChakraProvider theme={theme}>
        <MemoryRouter>
          <SeriesCard
            series={{
              id: 9,
              slug: 'database-engineering',
              title: longTitle,
              description: 'Connected blogs about practical database design.',
              author: { id: 1, name: 'Connor Tran' },
              partCount: 4,
              updatedAt: '2026-08-16T00:00:00Z',
            }}
          />
        </MemoryRouter>
      </ChakraProvider>,
    )

    expect(markup).toContain(longTitle)
    // `ActionLink` always carries this regardless of caller, but the Series
    // card title is exactly the case it protects: a long, unbroken run of
    // text with no latin short-word fallback to wrap on.
    expect(markup).toMatch(/overflow-wrap:anywhere/)
  })
})

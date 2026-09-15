import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import theme from '../../../theme/horizon'

const state = vi.hoisted(() => ({
  series: {
    id: 9,
    slug: 'database-engineering',
    title: 'Database Engineering',
    description: 'Connected blogs about practical database design.',
    author: { id: 1, name: 'Connor Tran' },
    updatedAt: '2026-08-16T00:00:00Z',
    parts: [
      {
        postId: 42,
        title: 'Indexes first',
        excerpt: 'Start with the read path.',
        readingTime: 6,
        tags: ['database'],
        position: 1,
        publishedAt: null,
      },
    ],
  } as unknown,
}))

vi.mock('../usePublicSeries', () => ({
  usePublicSeries: () => ({
    series: state.series,
    loading: false,
    error: null,
    retry: vi.fn(),
  }),
}))

import SeriesPage from './SeriesPage'

const render = () =>
  renderToStaticMarkup(
    <ChakraProvider theme={theme}>
      <MemoryRouter initialEntries={['/series/database-engineering']}>
        <Routes>
          <Route path="/series/:slug" element={<SeriesPage />} />
        </Routes>
      </MemoryRouter>
    </ChakraProvider>,
  )

describe('SeriesPage', () => {
  it('renders approved metadata and ordered blogs without progress language', () => {
    const markup = render()

    expect(markup).toContain('Database Engineering')
    expect(markup).toContain('6 min total')
    // "Start here" became the system's one phrasing for Series position; see
    // SeriesPartList.test.tsx.
    expect(markup).toContain('Part 1 of 1')
    expect(markup).toContain('In this series')
    expect(markup).not.toContain('Opened')
    expect(markup).not.toContain('Progress')
  })

  /*
   * The header title is a plain `Heading`, not an `ActionLink` - it has no
   * `overflow-wrap` of its own to fall back on. A long Vietnamese title, real
   * content on this blog, is the header's actual worst case, and it must
   * still come through in full.
   */
  it('renders a long Vietnamese Series title in full on the detail header', () => {
    const longTitle =
      'Kiến trúc hệ thống phân tán: từ nguyên lý điều phối dữ liệu đến vận hành thực tế trong môi trường sản xuất quy mô lớn'
    state.series = { ...(state.series as Record<string, unknown>), title: longTitle }

    expect(render()).toContain(longTitle)
  })
})

import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import theme from '../../../theme/horizon'

const loaded = {
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
}

const state = vi.hoisted(() => ({
  result: null as unknown,
}))

vi.mock('../usePublicSeries', () => ({
  usePublicSeries: () => state.result,
}))

import SeriesPage from './SeriesPage'

const retry = vi.fn()

const loadedState = (series: unknown) => ({
  series,
  loading: false,
  error: null,
  notFound: false,
  retry,
})

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
    state.result = loadedState(loaded)
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
   * The topic group is named for assistive technology, and a name only reaches
   * assistive technology from an element that may carry one. On a bare `div`
   * the role is generic and the name is dropped.
   */
  it('names the topic group on a real list rather than on a generic element', () => {
    state.result = loadedState(loaded)
    const markup = render()

    expect(markup).toContain('<ul aria-label="Series topics"')
    expect(markup).toContain('database')
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
    state.result = loadedState({ ...loaded, title: longTitle })

    expect(render()).toContain(longTitle)
  })

  /*
   * ui-ux Screen 4: header and ordered-list skeletons while loading, so the
   * page keeps its shape when the Series arrives. It used to render the
   * generic page spinner here.
   */
  it('renders content-shaped skeletons while the Series loads', () => {
    state.result = { series: null, loading: true, error: null, notFound: false, retry }
    const markup = render()

    expect(markup).toContain('aria-busy="true"')
    expect(markup).toContain('aria-label="this Series"')
    expect(markup).toContain('<ol')
    expect(markup).not.toContain('We could not')
  })

  it('offers links rather than a retry when the Series is not there', () => {
    state.result = { series: null, loading: false, error: null, notFound: true, retry }
    const markup = render()

    expect(markup).toContain('We could not find this Series.')
    expect(markup).toContain('href="/series"')
    expect(markup).toContain('href="/blog"')
    expect(markup).not.toContain('Try to load this Series again')
  })

  /*
   * A Series whose published blogs have all been withdrawn is as absent as a
   * deleted one. It used to render a header claiming "0 blogs" over an empty
   * ordered list.
   */
  it('treats a Series with no published blogs as absent', () => {
    state.result = { ...loadedState({ ...loaded, parts: [] }), notFound: true }
    const markup = render()

    expect(markup).toContain('We could not find this Series.')
    expect(markup).not.toContain('0 blogs')
  })

  it('keeps the retry for a transient failure', () => {
    state.result = {
      series: null,
      loading: false,
      error: 'This series could not load right now.',
      notFound: false,
      retry,
    }
    const markup = render()

    expect(markup).toContain('We could not load this Series.')
    expect(markup).toContain('This series could not load right now.')
    expect(markup).toContain('Try to load this Series again')
    expect(markup).toContain('href="/series"')
  })
})

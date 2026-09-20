/**
 * The public Series index: one featured Series, the rest in a grid, and the
 * three async states the approved UI names for it.
 *
 * The index shipped without a page-level test of its own, so nothing held the
 * rule that matters most here: the featured slot is lifted out of the results,
 * and an index with no results must not draw an empty one.
 */

import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import theme from '../../../theme/horizon'
import type { PublicSeriesSummary } from '../series.types'

const idle = {
  data: null as unknown,
  items: [] as PublicSeriesSummary[],
  loading: false,
  error: null as string | null,
  retry: vi.fn(),
}

const state = { current: idle }

vi.mock('../usePublicSeriesList', () => ({
  usePublicSeriesList: () => state.current,
}))

const SeriesIndexPage = (await import('./SeriesIndexPage')).default

const series = (id: number, slug: string, title: string): PublicSeriesSummary => ({
  id,
  slug,
  title,
  description: `What ${title} covers.`,
  author: { id: 1, name: 'Connor Tran' },
  partCount: 4,
  updatedAt: '2026-08-16T00:00:00Z',
})

const render = (entry = '/series') =>
  renderToStaticMarkup(
    <ChakraProvider theme={theme}>
      <MemoryRouter initialEntries={[entry]}>
        <SeriesIndexPage />
      </MemoryRouter>
    </ChakraProvider>,
  )

describe('SeriesIndexPage', () => {
  it('lifts the first Series into the featured slot and grids the rest', () => {
    state.current = {
      ...idle,
      items: [series(1, 'alpha', 'Alpha'), series(2, 'beta', 'Beta'), series(3, 'gamma', 'Gamma')],
      data: { items: [], page: 1, limit: 9, total: 3, totalPages: 1 },
    }

    const markup = render()

    expect(markup).toContain('Featured Series')
    expect(markup).toContain('All series')
    // The featured Series is not repeated in the grid below it.
    expect(markup.match(/href="\/series\/alpha"/g)).toHaveLength(1)
    expect(markup).toContain('href="/series/beta"')
    expect(markup).toContain('href="/series/gamma"')
    // Every card names the object before its title.
    expect(markup).toContain('Series · 4 blogs')
  })

  /*
   * "Featured" on page four is the fourth page's first row wearing a label, so
   * later pages are a plain grid.
   */
  it('drops the featured slot on later pages and keeps every result in the grid', () => {
    state.current = {
      ...idle,
      items: [series(4, 'delta', 'Delta'), series(5, 'epsilon', 'Epsilon')],
      data: { items: [], page: 2, limit: 9, total: 11, totalPages: 2 },
    }

    const markup = render('/series?page=2')

    expect(markup).not.toContain('Featured Series')
    expect(markup).toContain('href="/series/delta"')
    expect(markup).toContain('href="/series/epsilon"')
  })

  it('pages the results through a named navigation landmark', () => {
    state.current = {
      ...idle,
      items: [series(1, 'alpha', 'Alpha')],
      data: { items: [], page: 1, limit: 9, total: 20, totalPages: 3 },
    }

    const markup = render()

    expect(markup).toContain('aria-label="Series pagination"')
    expect(markup).toContain('aria-current="page"')
    expect(markup).toContain('Page 1 of 3')
  })

  it('reserves the shape of the results while they load', () => {
    state.current = { ...idle, loading: true }

    const markup = render()

    expect(markup).toContain('aria-label="the Series list"')
    expect(markup).toContain('aria-busy="true"')
    expect(markup).not.toContain('Featured Series')
  })

  it('says the index is empty without drawing an empty featured slot', () => {
    state.current = { ...idle }

    const markup = render()

    expect(markup).toContain('No Series yet.')
    expect(markup).toContain('href="/blog"')
    expect(markup).not.toContain('Featured Series')
    expect(markup).not.toContain('All series')
  })

  it('offers a retry and a way onward when the list fails', () => {
    state.current = { ...idle, error: 'Series could not load right now.' }

    const markup = render()

    expect(markup).toContain('We could not load the Series list.')
    expect(markup).toContain('Series could not load right now.')
    expect(markup).toContain('Try to load the Series list again')
    expect(markup).toContain('href="/blog"')
    expect(markup).not.toContain('Featured Series')
  })

  it('keeps one page heading above the results', () => {
    state.current = {
      ...idle,
      items: [series(1, 'alpha', 'Alpha')],
      data: { items: [], page: 1, limit: 9, total: 1, totalPages: 1 },
    }

    const markup = render()

    expect(markup.match(/<h1/g)).toHaveLength(1)
    expect(markup).toContain('Connected blogs, arranged to be read in order.')
  })
})

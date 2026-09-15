import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import theme from '../../../theme/horizon'
import type { PublicSeriesSummary } from '../series.types'

const list = {
  data: null,
  items: [] as PublicSeriesSummary[],
  loading: false,
  error: null as string | null,
  retry: vi.fn(),
}

const state = { current: list }

vi.mock('../usePublicSeriesList', () => ({
  usePublicSeriesList: () => state.current,
}))

const SeriesShelf = (await import('./SeriesShelf')).default

const render = () =>
  renderToStaticMarkup(
    <ChakraProvider theme={theme}>
      <MemoryRouter>
        <SeriesShelf />
      </MemoryRouter>
    </ChakraProvider>,
  )

const series: PublicSeriesSummary = {
  id: 9,
  slug: 'database-engineering',
  title: 'Database Engineering',
  description: 'Connected blogs about practical database design.',
  author: { id: 1, name: 'Connor Tran' },
  partCount: 4,
  updatedAt: '2026-08-16T00:00:00Z',
}

describe('SeriesShelf async states', () => {
  it('says so when the shelf failed, instead of disappearing like an empty one', () => {
    state.current = { ...list, error: 'Series could not load right now.' }

    const markup = render()

    expect(markup).toContain('We could not load the Series shelf.')
    expect(markup).toContain('Series could not load right now.')
    expect(markup).toContain('Try to load the Series shelf again')
  })

  it('renders nothing at all when there is no Series to show', () => {
    state.current = { ...list }

    const markup = render()

    // The provider still emits its global stylesheet; the shelf itself
    // contributes no section, no heading and no discovery link.
    expect(markup).not.toContain('<section')
    expect(markup).not.toContain('Ideas that unfold across more than one blog')
    expect(markup).not.toContain('View all series')
  })

  it('puts the Series in a labelled rail a keyboard can reach', () => {
    state.current = { ...list, items: [series] }

    const markup = render()

    expect(markup).toContain('Ideas that unfold across more than one blog')
    expect(markup).toContain('View all series')
    expect(markup).toContain('aria-label="Series on the home page"')
    expect(markup).toContain('tabindex="0"')
    expect(markup).toContain('href="/series/database-engineering"')
    expect(markup).toContain('Series · 4 blogs')
  })
})

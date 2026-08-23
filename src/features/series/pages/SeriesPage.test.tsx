import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import theme from '../../../theme'

vi.mock('../usePublicSeries', () => ({
  usePublicSeries: () => ({
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
    },
    loading: false,
    error: null,
    retry: vi.fn(),
  }),
}))

import SeriesPage from './SeriesPage'

describe('SeriesPage', () => {
  it('renders approved metadata and ordered blogs without progress language', () => {
    const markup = renderToStaticMarkup(
      <ChakraProvider theme={theme}>
        <MemoryRouter initialEntries={['/series/database-engineering']}>
          <Routes>
            <Route path="/series/:slug" element={<SeriesPage />} />
          </Routes>
        </MemoryRouter>
      </ChakraProvider>,
    )

    expect(markup).toContain('Database Engineering')
    expect(markup).toContain('6 min total')
    expect(markup).toContain('Start here')
    expect(markup).toContain('In this series')
    expect(markup).not.toContain('Opened')
    expect(markup).not.toContain('Progress')
  })
})

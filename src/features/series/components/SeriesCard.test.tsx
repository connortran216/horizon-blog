import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import theme from '../../../theme'
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
})

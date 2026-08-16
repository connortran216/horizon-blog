import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import theme from '../../../theme'
import SeriesContextCard from './SeriesContextCard'

describe('SeriesContextCard', () => {
  it('links the learning path and adjacent public blogs', () => {
    const markup = renderToStaticMarkup(
      <ChakraProvider theme={theme}>
        <MemoryRouter>
          <SeriesContextCard
            context={{
              series: { id: 7, slug: 'database-engineering', title: 'Database Engineering' },
              position: 2,
              total: 3,
              previous: { postId: 42, title: 'Indexes first', position: 1, publishedAt: null },
              next: { postId: 44, title: 'Replication', position: 3, publishedAt: null },
            }}
          />
        </MemoryRouter>
      </ChakraProvider>,
    )

    expect(markup).toContain('SERIES · PART 2 OF 3')
    expect(markup).toContain('href="/series/database-engineering"')
    expect(markup).toContain('Indexes first')
    expect(markup).toContain('Replication')
  })
})

import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import theme from '../../../theme/horizon'
import SeriesContextCard from './SeriesContextCard'

describe('SeriesContextCard', () => {
  it('links the Series and adjacent public blogs', () => {
    const markup = renderToStaticMarkup(
      <ChakraProvider theme={theme}>
        <MemoryRouter>
          <SeriesContextCard
            context={{
              series: { id: 7, slug: 'database-engineering', title: 'Database Engineering' },
              position: 2,
              total: 3,
              previous: {
                postId: 42,
                title: 'Indexes first',
                excerpt: '',
                readingTime: 6,
                tags: [],
                position: 1,
                publishedAt: null,
              },
              next: {
                postId: 44,
                title: 'Replication',
                excerpt: '',
                readingTime: 7,
                tags: [],
                position: 3,
                publishedAt: null,
              },
            }}
          />
        </MemoryRouter>
      </ChakraProvider>,
    )

    /*
     * The position used to be typed in capitals. It is now the system's one
     * phrasing, and the capitals come from the eyebrow's own text transform
     * rather than from the content - so a screen reader hears "Part 2 of 3"
     * instead of spelling out an acronym.
     */
    expect(markup).toContain('Part 2 of 3')
    expect(markup).toContain('href="/series/database-engineering"')
    expect(markup).toContain('Indexes first')
    expect(markup).toContain('Replication')
    // Each direction names its destination, so "Next" is never a bare word.
    expect(markup).toContain('aria-label="Previous part: Indexes first"')
    expect(markup).toContain('aria-label="Next part: Replication"')
  })
})

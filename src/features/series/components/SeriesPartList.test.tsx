import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import theme from '../../../theme'
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
    expect(markup).toContain('signal-series-parts')
    expect(markup).toContain('signal-series-part-marker')
    expect(markup).toContain('Indexes first')
    expect(markup).toContain('Query plans')
    expect(markup.indexOf('Indexes first')).toBeLessThan(markup.indexOf('Query plans'))
    expect(markup).toContain('Start here')
    expect(markup).toContain('Part 02')
    expect(markup).toContain('6 min read')
    expect(markup).not.toContain('Opened')
  })
})

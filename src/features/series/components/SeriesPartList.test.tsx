import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import theme from '../../../theme'
import SeriesPartList from './SeriesPartList'

describe('SeriesPartList', () => {
  it('renders the public order and browser-local opened state', () => {
    const markup = renderToStaticMarkup(
      <ChakraProvider theme={theme}>
        <MemoryRouter>
          <SeriesPartList
            parts={[
              { postId: 42, title: 'Indexes first', position: 1, publishedAt: null },
              { postId: 43, title: 'Query plans', position: 2, publishedAt: null },
            ]}
            visitedPostIds={[42]}
          />
        </MemoryRouter>
      </ChakraProvider>,
    )

    expect(markup).toContain('aria-label="Series blogs"')
    expect(markup).toContain('Indexes first')
    expect(markup).toContain('Query plans')
    expect(markup.indexOf('Indexes first')).toBeLessThan(markup.indexOf('Query plans'))
    expect(markup).toContain('Opened on this browser')
  })
})

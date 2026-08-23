import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import theme from '../../../theme'
import SeriesShelf from './SeriesShelf'

describe('SeriesShelf', () => {
  it('keeps the discovery action visible while Series cards load', () => {
    const markup = renderToStaticMarkup(
      <ChakraProvider theme={theme}>
        <MemoryRouter>
          <SeriesShelf />
        </MemoryRouter>
      </ChakraProvider>,
    )

    expect(markup).toContain('Series')
    expect(markup).toContain('View all series')
    expect(markup).toContain('href="/series"')
    expect(markup).toContain('Ideas that unfold across more than one blog')
  })
})

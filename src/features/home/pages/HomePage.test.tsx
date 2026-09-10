import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AuthProvider } from '../../../context/AuthContext'
import theme from '../../../theme'
import HomePage from './HomePage'

describe('HomePage Series placement', () => {
  it('places Series discovery after the unchanged hero', () => {
    const markup = renderToStaticMarkup(
      <ChakraProvider theme={theme}>
        <AuthProvider>
          <MemoryRouter>
            <HomePage />
          </MemoryRouter>
        </AuthProvider>
      </ChakraProvider>,
    )

    const hero = markup.indexOf('Human stories, blogs, and thoughtful writing for curious readers.')
    const series = markup.indexOf('View all series')
    expect(hero).toBeGreaterThanOrEqual(0)
    expect(series).toBeGreaterThan(hero)
  })
})

import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AuthProvider } from '../../../context/AuthContext'
import theme from '../../../theme'
import HomePage from './HomePage'

describe('HomePage initial loading', () => {
  it('shows branded loading before Series discovery', () => {
    const markup = renderToStaticMarkup(
      <ChakraProvider theme={theme}>
        <AuthProvider>
          <MemoryRouter>
            <HomePage />
          </MemoryRouter>
        </AuthProvider>
      </ChakraProvider>,
    )

    expect(markup).toContain('horizon-loading')
    expect(markup).toContain('Đang mở những trang viết…')
    expect(markup).not.toContain('All Series')
  })
})

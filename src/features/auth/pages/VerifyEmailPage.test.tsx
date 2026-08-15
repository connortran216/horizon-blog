import { ChakraProvider } from '@chakra-ui/react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import VerifyEmailPage from './VerifyEmailPage'

const renderPage = (entry: string | { pathname: string; search?: string; state?: unknown }) =>
  renderToString(
    <ChakraProvider>
      <MemoryRouter initialEntries={[entry]}>
        <Routes>
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Routes>
      </MemoryRouter>
    </ChakraProvider>,
  )

describe('VerifyEmailPage', () => {
  it('renders the pending resend state with the registration email', () => {
    const html = renderPage({
      pathname: '/verify-email',
      state: { email: 'reader@example.com' },
    })

    expect(html).toContain('Check your email')
    expect(html).toContain('reader@example.com')
    expect(html).toContain('Send a new link')
  })

  it('renders a neutral verification-in-progress state for token links', () => {
    const html = renderPage('/verify-email?token=selector.secret')

    expect(html).toContain('Verifying your email')
    expect(html).toContain('Checking your link')
    expect(html).not.toContain('selector.secret')
  })
})

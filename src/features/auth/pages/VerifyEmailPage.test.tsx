/**
 * The two states a reader can land on without the page having talked to the
 * service yet: no token (ask for a fresh link) and a token in the URL (check it).
 *
 * The assertions were rewritten for release M5. The page used to own its own
 * headings - "Check your email", "Verifying your email", "Checking your link" -
 * and now composes `VerificationFeedback`, so those exact strings no longer
 * exist. What the test is really protecting is unchanged and is asserted below:
 * the resend form appears when there is no token, the registration address is
 * prefilled into it, and the token itself is never rendered.
 */

import { ChakraProvider } from '@chakra-ui/react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import horizonTheme from '../../../theme/horizon'
import VerifyEmailPage from './VerifyEmailPage'

const renderPage = (entry: string | { pathname: string; search?: string; state?: unknown }) =>
  renderToString(
    <ChakraProvider theme={horizonTheme}>
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

    expect(html).toContain('Check your email for the verification link')
    expect(html).toContain('reader@example.com')
    expect(html).toContain('Send a new link')
  })

  it('renders a neutral verification-in-progress state for token links', () => {
    const html = renderPage('/verify-email?token=selector.secret')

    expect(html).toContain('Checking your verification link')
    // No resend form while a link is being checked - there is nothing to resend
    // yet, and offering one would invite a second request over the first.
    expect(html).not.toContain('Send a new link')
    expect(html).not.toContain('selector.secret')
  })
})

/**
 * What the migrated account screens actually emit.
 *
 * Release M5 recomposed these pages onto the design system, and the claims worth
 * protecting are the ones a pure function cannot make: that every credential
 * input still carries its own autocomplete hint and its real `type`, that each
 * one is named by a `label for` pointing at it, that the required state reaches
 * the accessibility tree rather than stopping at an asterisk, and that the reset
 * screens never render the token they were opened with.
 *
 * See the Testing section of `src/design-system/CONVENTIONS.md`: static markup
 * proves what was emitted, not how it behaves. Focus movement, real screen
 * reader output, the responsive pass and the states that only exist after an
 * effect has run - the unusable reset link, the failed MCP bridge - stay manual.
 *
 * The autocomplete matches are case-insensitive on purpose: the server renderer
 * emits the React prop spelling, which the HTML parser folds to `autocomplete`.
 */

import type { ReactElement } from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import horizonTheme from '../../../theme/horizon'
import ForgotPasswordPage from './ForgotPasswordPage'
import ResetPasswordPage from './ResetPasswordPage'
import VerifyEmailPage from './VerifyEmailPage'

type Entry = string | { pathname: string; search?: string; state?: unknown }

function renderRoute(path: string, element: ReactElement, entry: Entry): string {
  return renderToStaticMarkup(
    <ChakraProvider theme={horizonTheme}>
      <MemoryRouter initialEntries={[entry]}>
        <Routes>
          <Route path={path} element={element} />
        </Routes>
      </MemoryRouter>
    </ChakraProvider>,
  )
}

describe('the password reset request screen', () => {
  const markup = renderRoute('/forgot-password', <ForgotPasswordPage />, '/forgot-password')

  it('names its one field with a label pointing at that field', () => {
    expect(markup).toContain('for="email"')
    expect(markup).toContain('id="email"')
  })

  it('keeps the email autocomplete hint a password manager needs', () => {
    expect(markup).toMatch(/autocomplete="email"/i)
    expect(markup).toContain('type="email"')
  })

  it('marks the field required in the accessibility tree, not only with an asterisk', () => {
    expect(markup).toContain('aria-required="true"')
    expect(markup).toContain('(required)')
  })
})

describe('the password reset screen', () => {
  const markup = renderRoute('/reset-password', <ResetPasswordPage />, {
    pathname: '/reset-password',
    search: '?token=selector.secret',
  })

  it('keeps both new-password fields a real password type with their autocomplete hints', () => {
    expect([...markup.matchAll(/type="password"/g)]).toHaveLength(2)
    expect([...markup.matchAll(/autocomplete="new-password"/gi)]).toHaveLength(2)
    expect(markup).toContain('for="newPassword"')
    expect(markup).toContain('for="confirmPassword"')
  })

  it('never renders the reset token it was opened with', () => {
    expect(markup).not.toContain('selector.secret')
  })
})

describe('the verification screen', () => {
  const markup = renderRoute('/verify-email', <VerifyEmailPage />, '/verify-email')

  it('announces the outcome through a live region rather than colour alone', () => {
    expect(markup).toContain('aria-live="polite"')
    expect(markup).toContain('Check your email for the verification link')
  })

  it('keeps the resend field labelled and autocompleted', () => {
    expect(markup).toContain('for="verification-email"')
    expect(markup).toMatch(/autocomplete="email"/i)
  })
})

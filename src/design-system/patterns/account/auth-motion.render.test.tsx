import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import horizonTheme from '../../../theme/horizon'
import { AuthPanel } from './AuthPanel'
import { AuthCallbackFeedback, VerificationFeedback } from './VerificationFeedback'

function render(element: React.ReactElement) {
  return renderToStaticMarkup(<ChakraProvider theme={horizonTheme}>{element}</ChakraProvider>)
}

describe('auth state handoff', () => {
  it('keys the stable panel content to the real panel state', () => {
    const markup = render(
      <AuthPanel title="Sign in" isSubmitting>
        <form>Credential form</form>
      </AuthPanel>,
    )

    expect(markup).toContain('data-state-handoff="submitting"')
    expect(markup).toContain('Credential form')
    expect(markup).toContain('aria-busy="true"')
  })

  it('keys verification and callback content to their explicit outcomes', () => {
    expect(render(<VerificationFeedback status="verified" />)).toContain(
      'data-state-handoff="verified"',
    )
    expect(render(<AuthCallbackFeedback status="failed" provider="Google" />)).toContain(
      'data-state-handoff="failed"',
    )
  })

  it('does not keep denied form content mounted', () => {
    const markup = render(
      <AuthPanel title="Sign in" deniedAction="sign in with this account">
        <form>Stale credential form</form>
      </AuthPanel>,
    )

    expect(markup).toContain('data-state-handoff="denied"')
    expect(markup).not.toContain('Stale credential form')
    expect(markup).toContain('You do not have permission')
  })
})

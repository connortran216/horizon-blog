/**
 * The MCP bridge's success and consent states.
 *
 * The success-state claims are kept exactly - the reader is told the login
 * finished and given a way back to the client, and no credential is put on
 * screen for anyone to copy. Release M5 recomposed the surface from
 * `AuthAlert` and the design system's `Button` and moved it onto
 * `horizonTheme`, so the render wrapper changed; the assertions did not.
 *
 * The consent state is new: it is what closed `horizon-blog-y2e.sec.1` - the
 * page used to call `completeMcpAuthorization` from an effect the instant a
 * session was valid, with no screen in between. `McpAuthorizationConsent` is
 * that screen, and `renderToStaticMarkup` is as far as these tests can take
 * it without jsdom - it proves the copy an actual click would see, not the
 * click itself. The claim this file cannot check - that pressing "Allow
 * access" is the only path to the API call - is `canStartAuthorization`'s
 * job in `mcpAuthorize.logic.test.ts`, plus the live network capture recorded
 * for this bead's report.
 */

import type { ReactElement } from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import horizonTheme from '../../../theme/horizon'
import { McpAuthorizationConsent, McpAuthorizationSuccess } from './McpAuthorizePage'

const renderMarkup = (node: ReactElement) =>
  renderToStaticMarkup(<ChakraProvider theme={horizonTheme}>{node}</ChakraProvider>)

describe('McpAuthorizationSuccess', () => {
  it('shows a successful authentication message without exposing a bearer token', () => {
    const markup = renderMarkup(<McpAuthorizationSuccess onReturnToClient={() => undefined} />)

    expect(markup).toContain('Authentication successful')
    expect(markup).toContain('Return to MCP client')
    expect(markup).not.toContain('Bearer fallback-jwt')
    expect(markup).not.toContain('Copy token')
  })

  it('names no client, no scope and no permission the server never sent', () => {
    const markup = renderMarkup(<McpAuthorizationSuccess onReturnToClient={() => undefined} />)

    // `/oauth/authorize/complete` returns a redirect URI and nothing else, so a
    // consent vocabulary on this screen could only have been invented here.
    for (const invented of ['scope', 'Scope', 'permission', 'Permission', 'Allow', 'Deny']) {
      expect(markup).not.toContain(invented)
    }
  })
})

describe('McpAuthorizationConsent', () => {
  const render = (overrides: Partial<Parameters<typeof McpAuthorizationConsent>[0]> = {}) =>
    renderMarkup(
      <McpAuthorizationConsent
        isSubmitting={false}
        onAllow={() => undefined}
        onDecline={() => undefined}
        {...overrides}
      />,
    )

  it('states that the requesting application has not been verified', () => {
    const markup = render()

    expect(markup).toContain('has not verified')
  })

  it('offers both an affirmative control and an explicit refusal', () => {
    const markup = render()

    expect(markup).toContain('Allow access')
    expect(markup).toContain('Don&#x27;t allow')
  })

  it('names no client, no scope and no permission the server never sent', () => {
    const markup = render()

    for (const invented of ['Scope:', 'Permissions:', 'requested by', 'wants to:']) {
      expect(markup).not.toContain(invented)
    }
  })

  it('marks the alert region as interrupting, the way an error does', () => {
    // `tone="permission"` on `AuthAlert` renders `role="alert"` - this is a
    // warning the reader should not be able to miss, not a passive status line.
    const markup = render()

    expect(markup).toContain('role="alert"')
  })

  it('shows the failed-attempt alert only when an error is passed in', () => {
    const clean = render()
    const withError = render({ errorMessage: 'We could not complete this authorization.' })

    expect(clean).not.toContain('Authorization failed')
    expect(withError).toContain('Authorization failed')
    expect(withError).toContain('We could not complete this authorization.')
  })
})

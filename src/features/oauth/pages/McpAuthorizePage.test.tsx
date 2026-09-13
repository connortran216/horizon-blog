/**
 * The MCP bridge's success state.
 *
 * The original claims are kept exactly - the reader is told the login finished
 * and given a way back to the client, and no credential is put on screen for
 * anyone to copy. Release M5 recomposed the surface from `AuthAlert` and the
 * design system's `Button` and moved it onto `horizonTheme`, so the render
 * wrapper changed; the assertions did not.
 */

import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import horizonTheme from '../../../theme/horizon'
import { McpAuthorizationSuccess } from './McpAuthorizePage'

describe('McpAuthorizationSuccess', () => {
  it('shows a successful authentication message without exposing a bearer token', () => {
    const markup = renderToStaticMarkup(
      <ChakraProvider theme={horizonTheme}>
        <McpAuthorizationSuccess onReturnToClient={() => undefined} />
      </ChakraProvider>,
    )

    expect(markup).toContain('Authentication successful')
    expect(markup).toContain('Return to MCP client')
    expect(markup).not.toContain('Bearer fallback-jwt')
    expect(markup).not.toContain('Copy token')
  })

  it('names no client, no scope and no permission the server never sent', () => {
    const markup = renderToStaticMarkup(
      <ChakraProvider theme={horizonTheme}>
        <McpAuthorizationSuccess onReturnToClient={() => undefined} />
      </ChakraProvider>,
    )

    // `/oauth/authorize/complete` returns a redirect URI and nothing else, so a
    // consent vocabulary on this screen could only have been invented here.
    for (const invented of ['scope', 'Scope', 'permission', 'Permission', 'Allow', 'Deny']) {
      expect(markup).not.toContain(invented)
    }
  })
})

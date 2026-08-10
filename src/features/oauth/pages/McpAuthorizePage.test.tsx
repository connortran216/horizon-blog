import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import theme from '../../../theme'
import { McpAuthorizationSuccess } from './McpAuthorizePage'

describe('McpAuthorizationSuccess', () => {
  it('shows a successful authentication message without exposing a bearer token', () => {
    const markup = renderToStaticMarkup(
      <ChakraProvider theme={theme}>
        <McpAuthorizationSuccess onReturnToClient={() => undefined} />
      </ChakraProvider>,
    )

    expect(markup).toContain('Authentication successful')
    expect(markup).toContain('Return to MCP client')
    expect(markup).not.toContain('Bearer fallback-jwt')
    expect(markup).not.toContain('Copy token')
  })
})

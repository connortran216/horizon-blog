import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import theme from '../../../theme'
import { McpAuthorizationSuccess } from './McpAuthorizePage'

describe('McpAuthorizationSuccess', () => {
  it('shows a successful authentication message and copyable bearer token', () => {
    const markup = renderToStaticMarkup(
      <ChakraProvider theme={theme}>
        <McpAuthorizationSuccess
          bearerToken="Bearer fallback-jwt"
          copied={false}
          onCopy={() => undefined}
          onReturnToClient={() => undefined}
        />
      </ChakraProvider>,
    )

    expect(markup).toContain('Authentication successful')
    expect(markup).toContain('Bearer fallback-jwt')
    expect(markup).toContain('Copy token')
    expect(markup).toContain('Return to MCP client')
  })
})

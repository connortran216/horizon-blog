import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import theme from '../../../theme'
import CommentComposer from './CommentComposer'

describe('CommentComposer', () => {
  it('renders a labeled plain-text composer with its limit', () => {
    const markup = renderToStaticMarkup(
      <ChakraProvider theme={theme}>
        <CommentComposer
          label="Join the discussion"
          submitLabel="Post comment"
          onSubmit={vi.fn()}
        />
      </ChakraProvider>,
    )

    expect(markup).toContain('Join the discussion')
    expect(markup).toContain('maxLength="2000"')
    expect(markup).toContain('0/2000')
    expect(markup).toContain('Post comment')
  })
})

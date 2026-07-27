import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import theme from '../../../theme'
import { Comment } from '../comments.types'
import CommentActions from './CommentActions'

const baseComment: Comment = {
  id: 1,
  parentId: null,
  depth: 0,
  content: 'Content',
  author: { name: 'Reader' },
  createdAt: '2026-07-27T10:00:00Z',
  editedAt: null,
  isRemoved: false,
  replyCount: 0,
  canEdit: false,
  canRemove: false,
  canReply: false,
}

describe('CommentActions', () => {
  it('renders only capabilities supplied by the API', () => {
    const markup = renderToStaticMarkup(
      <ChakraProvider theme={theme}>
        <CommentActions
          comment={{ ...baseComment, canEdit: true, canRemove: true }}
          isLoading={false}
          onReply={vi.fn()}
          onEdit={vi.fn()}
          onRemove={vi.fn()}
        />
      </ChakraProvider>,
    )

    expect(markup).toContain('Edit')
    expect(markup).toContain('Remove')
    expect(markup).not.toContain('>Reply<')
  })
})

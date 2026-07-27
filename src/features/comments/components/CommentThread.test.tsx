import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import theme from '../../../theme'
import { Comment } from '../comments.types'
import CommentThread from './CommentThread'

const comment = (overrides: Partial<Comment> = {}): Comment => ({
  id: 1,
  parentId: null,
  depth: 0,
  content: '<script>alert("unsafe")</script>',
  author: { name: 'Reader' },
  createdAt: '2026-07-27T10:00:00Z',
  editedAt: null,
  isRemoved: false,
  replyCount: 0,
  canEdit: false,
  canRemove: false,
  canReply: true,
  ...overrides,
})

describe('CommentThread', () => {
  it('renders comment content as escaped text', () => {
    const markup = renderToStaticMarkup(
      <ChakraProvider theme={theme}>
        <CommentThread
          comments={[comment()]}
          replies={{}}
          mutatingCommentId={null}
          onLoadReplies={vi.fn()}
          onLoadMoreReplies={vi.fn()}
          onReply={vi.fn()}
          onEdit={vi.fn()}
          onRemove={vi.fn()}
        />
      </ChakraProvider>,
    )

    expect(markup).toContain('&lt;script&gt;')
    expect(markup).not.toContain('<script>alert')
    expect(markup).toContain('Reply')
  })

  it('shows a content-free tombstone with no actions', () => {
    const markup = renderToStaticMarkup(
      <ChakraProvider theme={theme}>
        <CommentThread
          comments={[
            comment({
              depth: 2,
              content: null,
              author: null,
              isRemoved: true,
              canReply: false,
            }),
          ]}
          replies={{}}
          mutatingCommentId={null}
          onLoadReplies={vi.fn()}
          onLoadMoreReplies={vi.fn()}
          onReply={vi.fn()}
          onEdit={vi.fn()}
          onRemove={vi.fn()}
        />
      </ChakraProvider>,
    )

    expect(markup).toContain('Comment removed')
    expect(markup).not.toContain('>Reply<')
    expect(markup).not.toContain('unsafe')
  })
})

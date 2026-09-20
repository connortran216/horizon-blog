import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
/**
 * Rewritten for release M4. The thread keeps its cursor-paged lifecycle and its
 * inline composers, but the copy is now the design system's: a removed comment
 * says "This comment was removed." through `commentBody`, which is the same
 * sentence the gallery shows.
 */

import theme from '../../../theme/horizon'
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

  it('refuses a third reply level even when the API still says canReply', () => {
    const markup = renderToStaticMarkup(
      <ChakraProvider theme={theme}>
        <CommentThread
          comments={[comment({ depth: 2, content: 'Deepest reply', canReply: true })]}
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

    expect(markup).toContain('Deepest reply')
    expect(markup).not.toContain('>Reply<')
  })

  it('offers a reply control one level above the cap', () => {
    const markup = renderToStaticMarkup(
      <ChakraProvider theme={theme}>
        <CommentThread
          comments={[comment({ depth: 1, content: 'Middle reply', canReply: true })]}
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

    expect(markup).toContain('>Reply<')
  })

  it('keeps unloaded older replies reachable beside a freshly posted one', () => {
    const markup = renderToStaticMarkup(
      <ChakraProvider theme={theme}>
        <CommentThread
          comments={[comment({ id: 1, content: 'Parent', replyCount: 4 })]}
          replies={{
            1: {
              items: [comment({ id: 2, parentId: 1, depth: 1, content: 'Just posted' })],
              nextCursor: null,
              hasMore: true,
              loading: false,
              error: null,
            },
          }}
          mutatingCommentId={null}
          onLoadReplies={vi.fn()}
          onLoadMoreReplies={vi.fn()}
          onReply={vi.fn()}
          onEdit={vi.fn()}
          onRemove={vi.fn()}
        />
      </ChakraProvider>,
    )

    expect(markup).toContain('Just posted')
    expect(markup).toContain('Load more replies')
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

    expect(markup).toContain('This comment was removed.')
    expect(markup).toContain('Deleted reader')
    expect(markup).not.toContain('>Reply<')
    expect(markup).not.toContain('unsafe')
  })
})

/**
 * Horizon Design System v2 - the conversation under an article.
 *
 * Threading is the whole problem. A flat list of comments is trivial; a nested
 * one has to decide how deep replies may go, what happens to a reply whose
 * parent has been removed, and how a thread that arrived out of order is put
 * back together. All three are here, because all three are cheap to get wrong
 * and expensive to notice.
 *
 * The depth limit is not a style choice. The API models depth as `0 | 1 | 2`,
 * and a fourth level would be a thread the backend cannot store - so the reply
 * control disappears at the limit rather than offering an action that fails.
 */

import { space } from '../../../theme/tokens'
import { formatPostDate, pluralise } from '../posts/content.logic'

/** The deepest reply the API models. A reply to a depth-2 comment has nowhere to go. */
export const MAX_COMMENT_DEPTH = 2

export interface CommentAuthor {
  readonly name: string
  readonly avatarUrl?: string | null
}

export interface ReaderComment {
  readonly id: string
  readonly parentId: string | null
  /** As the API reports it. Clamped before it is used for indentation. */
  readonly depth: number
  /** `null` for a removed comment. */
  readonly content: string | null
  /** `null` when the account is gone. */
  readonly author: CommentAuthor | null
  readonly createdAt: string
  readonly editedAt?: string | null
  readonly isRemoved: boolean
  readonly replyCount: number
  readonly canReply: boolean
  readonly canEdit: boolean
  readonly canRemove: boolean
}

export interface CommentNode {
  readonly comment: ReaderComment
  readonly depth: number
  readonly replies: readonly CommentNode[]
}

/** Shown in place of a name the API cannot supply any more. */
export const REMOVED_AUTHOR_NAME = 'Deleted reader'

export function clampDepth(depth: number): number {
  if (!Number.isFinite(depth)) {
    return 0
  }

  return Math.min(MAX_COMMENT_DEPTH, Math.max(0, Math.floor(depth)))
}

/**
 * Whether a reply control belongs on this comment.
 *
 * Both conditions matter and they mean different things: the API's `canReply`
 * is about permission, the depth is about structure. Offering a control that
 * the server will refuse is the failure this guards against.
 */
export function canReplyTo(comment: ReaderComment): boolean {
  return comment.canReply && clampDepth(comment.depth) < MAX_COMMENT_DEPTH
}

/**
 * Build the tree from a flat page of comments.
 *
 * Three cases that a naive grouping gets wrong, and all three happen in
 * production:
 *
 * - a reply whose parent is not in this page - the parent was removed, or the
 *   page boundary fell between them. It is attached at the root rather than
 *   dropped, because a comment that exists must be readable.
 * - a cycle, from a corrupt `parentId`. The visited set breaks it instead of
 *   recursing until the stack goes.
 * - a duplicate id, from an overlapping cursor page. The first one wins, so
 *   React never sees two children with the same key.
 *
 * Sibling order is the order the API gave, which is the order the server sorted
 * them in. Re-sorting here would fight the cursor.
 */
export function buildCommentTree(comments: readonly ReaderComment[]): CommentNode[] {
  const byId = new Map<string, ReaderComment>()

  for (const comment of comments) {
    if (!byId.has(comment.id)) {
      byId.set(comment.id, comment)
    }
  }

  const childrenOf = new Map<string, ReaderComment[]>()
  const roots: ReaderComment[] = []

  for (const comment of byId.values()) {
    const parentId = comment.parentId

    if (parentId != null && byId.has(parentId) && parentId !== comment.id) {
      const siblings = childrenOf.get(parentId) ?? []
      siblings.push(comment)
      childrenOf.set(parentId, siblings)
    } else {
      roots.push(comment)
    }
  }

  const visited = new Set<string>()

  const toNode = (comment: ReaderComment, depth: number): CommentNode => {
    visited.add(comment.id)

    const replies = (childrenOf.get(comment.id) ?? [])
      .filter((child) => !visited.has(child.id))
      .map((child) => toNode(child, Math.min(depth + 1, MAX_COMMENT_DEPTH)))

    return { comment, depth, replies }
  }

  return roots.map((comment) => toNode(comment, clampDepth(comment.depth)))
}

/** How many comments a tree holds, replies included. */
export function countCommentNodes(nodes: readonly CommentNode[]): number {
  return nodes.reduce((total, node) => total + 1 + countCommentNodes(node.replies), 0)
}

/**
 * The indent for one level of nesting.
 *
 * It stops growing at the depth limit, so the deepest reply is still readable
 * on a 375px screen instead of being a column two words wide.
 */
export function threadIndent(depth: number): string {
  // `'0'` is the absence of an indent rather than a spacing value, which is why
  // it is a literal here and the other two steps are tokens - the same
  // distinction `surfaceStyle` draws between `boxShadow: 'none'` and a shadow.
  const steps = ['0', space[4], space[6]] as const

  return steps[clampDepth(depth)]
}

/* -------------------------------------------------------------------------- */
/* Copy                                                                       */
/* -------------------------------------------------------------------------- */

export function commentAuthorName(author: CommentAuthor | null | undefined): string {
  const name = author?.name?.trim() ?? ''

  return name.length > 0 ? name : REMOVED_AUTHOR_NAME
}

export type CommentBody =
  | { readonly kind: 'removed'; readonly text: string }
  | { readonly kind: 'text'; readonly text: string }

/**
 * A removed comment keeps its place in the thread.
 *
 * Deleting the node instead would re-parent its replies and change what the
 * people below it appear to be answering, which is worse than a tombstone.
 */
export function commentBody(comment: ReaderComment): CommentBody {
  if (comment.isRemoved || comment.content == null) {
    return { kind: 'removed', text: 'This comment was removed.' }
  }

  return { kind: 'text', text: comment.content }
}

export interface CommentTimestamp {
  readonly label: string
  readonly machine: string | null
  readonly edited: boolean
}

export function commentTimestamp(comment: ReaderComment): CommentTimestamp {
  const created = formatPostDate(comment.createdAt)
  const edited = Boolean(comment.editedAt)

  return {
    label: created ? `${created.label}${edited ? ' · edited' : ''}` : edited ? 'edited' : '',
    machine: created?.machine ?? null,
    edited,
  }
}

/** `View 3 replies` / `Hide replies`. Pluralised, and never "1 replies". */
export function replyToggleLabel(replyCount: number, isOpen: boolean): string {
  if (isOpen) {
    return 'Hide replies'
  }

  return `View ${pluralise(Math.max(0, Math.floor(replyCount)), 'reply', 'replies')}`
}

export function commentCountLabel(count: number): string {
  return pluralise(Math.max(0, Math.floor(count)), 'comment')
}

/* -------------------------------------------------------------------------- */
/* State of the whole conversation                                            */
/* -------------------------------------------------------------------------- */

export type ConversationStatus = 'unavailable' | 'loading' | 'error' | 'closed' | 'empty' | 'ready'

export interface ConversationStatusInput {
  /** The API does not offer comments on this deployment at all. */
  readonly available?: boolean
  readonly commentsOpen?: boolean
  readonly isLoading?: boolean
  readonly error?: string | null
  readonly commentCount?: number
}

/**
 * The order matters and it is not obvious.
 *
 * `unavailable` first: if the feature is not deployed there is nothing to load,
 * and a spinner for a discussion that will never arrive is a lie. Loading beats
 * error so a retry replaces the failure rather than sitting beside it. `closed`
 * beats `empty` because a closed discussion with no comments should say it is
 * closed, not invite a comment nobody can leave.
 */
export function conversationStatus({
  available = true,
  commentsOpen = true,
  isLoading = false,
  error = null,
  commentCount = 0,
}: ConversationStatusInput): ConversationStatus {
  if (!available) {
    return 'unavailable'
  }

  if (isLoading) {
    return 'loading'
  }

  if (error) {
    return 'error'
  }

  if (!commentsOpen) {
    return 'closed'
  }

  return commentCount > 0 ? 'ready' : 'empty'
}

export interface ComposerAvailability {
  readonly allowed: boolean
  /** Why not, when the composer is not offered. `null` when it is. */
  readonly notice: string | null
}

/**
 * Whether the reader may write, and what to tell them when they may not.
 *
 * A signed-out reader is told how to join; a signed-in reader on a closed
 * discussion is told it is closed. Rendering a disabled textarea in either case
 * would put a control in the tab order that can never be used.
 */
export function composerAvailability({
  canCreate = false,
  commentsOpen = true,
  isAuthenticated = false,
}: {
  readonly canCreate?: boolean
  readonly commentsOpen?: boolean
  readonly isAuthenticated?: boolean
}): ComposerAvailability {
  if (!commentsOpen) {
    return { allowed: false, notice: 'This discussion is closed.' }
  }

  if (!isAuthenticated) {
    return { allowed: false, notice: 'Sign in to join the discussion.' }
  }

  if (!canCreate) {
    return { allowed: false, notice: 'You do not have permission to comment on this blog.' }
  }

  return { allowed: true, notice: null }
}

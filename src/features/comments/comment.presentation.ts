/**
 * The feature layer's map from a comment record to the design system's
 * conversation contract.
 *
 * `conversation.logic.ts` in the design system owns every decision about a
 * comment - what a removed one says, what a missing author is called, whether a
 * reply control belongs on it, how far it indents. Those functions take a
 * `ReaderComment`, whose ids are strings because a design system may not assume
 * this API's numeric keys. This module is the one place that difference is
 * reconciled.
 *
 * It is pure on purpose: the whole mapping is testable without a DOM.
 */

import type { ReaderComment } from '../../design-system'
import { Comment } from './comments.types'

export function toReaderComment(comment: Comment): ReaderComment {
  return {
    id: String(comment.id),
    parentId: comment.parentId === null ? null : String(comment.parentId),
    depth: comment.depth,
    content: comment.content,
    author: comment.author
      ? { name: comment.author.name, avatarUrl: comment.author.avatarUrl }
      : null,
    createdAt: comment.createdAt,
    editedAt: comment.editedAt,
    isRemoved: comment.isRemoved,
    replyCount: comment.replyCount,
    canReply: comment.canReply,
    canEdit: comment.canEdit,
    canRemove: comment.canRemove,
  }
}

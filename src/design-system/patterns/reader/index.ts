/**
 * Horizon Design System v2 - reader barrel.
 *
 * Long-form reading: the frame, the prose measure, the three wide-content
 * frames, navigation, progress, feedback and the conversation.
 *
 * None of this replaces a renderer. Milkdown, Crepe, Prism and mermaid keep
 * producing the markup; `Prose`, `CodeBlock` and `DiagramFrame` take already
 * rendered content as children and own the container behaviour - measure,
 * overflow, contrast, the copy affordance and the render-failure state.
 */

export { ReaderFrame } from './ReaderFrame'
export type { ReaderFrameProps } from './ReaderFrame'

export { Prose } from './Prose'
export type { ProseProps } from './Prose'

export { CodeBlock } from './CodeBlock'
export type { CodeBlockProps } from './CodeBlock'

export { DiagramFrame } from './DiagramFrame'
export type { DiagramFrameProps } from './DiagramFrame'

export { TOC } from './TOC'
export type { TOCProps, TocVariant } from './TOC'

export { ReadingProgress } from './ReadingProgress'
export type { ReadingProgressProps } from './ReadingProgress'

export { ReactionBar } from './ReactionBar'
export type { ReactionBarProps } from './ReactionBar'

export { ShareAction } from './ShareAction'
export type { ShareActionProps } from './ShareAction'

export { CommentThread } from './CommentThread'
export type { CommentThreadProps } from './CommentThread'

export {
  ACTIVE_HEADING_THRESHOLD,
  activeHeadingId,
  isAfterProse,
  readerRegionIndex,
  readerRegions,
  readerSlotFor,
  readingProgress,
  readingProgressAria,
  readingProgressScale,
  readingProgressTransition,
  resolveHeadingDeepLink,
  tocDisclosureLabel,
  tocIndent,
  tocItems,
  tocLinkAria,
} from './reader.logic'
export type {
  HeadingOffset,
  ProgressAria,
  ReaderElement,
  ReaderHeading,
  ReaderRegion,
  ReadingProgressInput,
  TocItem,
} from './reader.logic'

export {
  codeLanguageLabel,
  copyAnnouncement,
  copyIsBusy,
  copyLabel,
  copyLiveRegion,
  copyReducer,
  diagramFailureMessage,
  diagramSourceToggleAvailable,
  diagramView,
  idleCopyState,
  localScrollStyle,
  proseRenderState,
  widensDocument,
} from './code.logic'
export type {
  CopyEvent,
  CopyState,
  CopyStatus,
  DiagramView,
  DiagramViewInput,
  LocalScrollStyle,
  ProseRenderInput,
  ProseRenderState,
} from './code.logic'

export {
  MAX_COMMENT_DEPTH,
  REMOVED_AUTHOR_NAME,
  buildCommentTree,
  canReplyTo,
  clampDepth,
  commentAuthorName,
  commentBody,
  commentCountLabel,
  commentTimestamp,
  composerAvailability,
  conversationStatus,
  countCommentNodes,
  replyToggleLabel,
  threadIndent,
} from './conversation.logic'
export type {
  CommentAuthor,
  CommentBody,
  CommentNode,
  CommentTimestamp,
  ComposerAvailability,
  ConversationStatus,
  ConversationStatusInput,
  ReaderComment,
} from './conversation.logic'

export {
  idleShareState,
  nextReactionCount,
  reactionButtonState,
  reactionUnavailableNotice,
  shareAnnouncement,
  shareHref,
  shareLiveRegion,
  shareReducer,
  shareTargets,
} from './reaction.logic'
export type {
  ReactionButtonState,
  ReactionInput,
  ShareEvent,
  ShareMethod,
  ShareState,
  ShareStatus,
  ShareTarget,
} from './reaction.logic'

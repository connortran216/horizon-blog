/**
 * Horizon Design System v2 - no connection.
 *
 * Distinct from `ErrorState` because the cause and the remedy are different:
 * nothing on the server failed, and retrying now will fail the same way. The
 * copy still names the task, so the reader knows what is waiting on the
 * connection coming back.
 */

import type { ReactNode } from 'react'

import { offlineMessage } from './feedback.logic'
import { FeedbackSurface, type FeedbackSurfaceProps } from './FeedbackSurface'

export interface OfflineStateProps extends Omit<
  FeedbackSurfaceProps,
  'tone' | 'headline' | 'children'
> {
  /** A verb phrase: "load the article", "save your draft". */
  task: string
  detail?: string
  /** A retry, for when the reader knows they are back. */
  children?: ReactNode
}

export function OfflineState({ task, detail, children, ...rest }: OfflineStateProps) {
  return (
    <FeedbackSurface tone="offline" headline={offlineMessage(task)} detail={detail} {...rest}>
      {children}
    </FeedbackSurface>
  )
}

/**
 * Horizon Design System v2 - nothing here yet.
 *
 * Absence is not failure. This wears the neutral tone, and it requires
 * `nextAction`: an empty state that explains the absence without saying what to
 * do next leaves the reader exactly where they were.
 */

import type { ReactNode } from 'react'

import { emptyMessage, namedSubject } from './feedback.logic'
import { FeedbackSurface, type FeedbackSurfaceProps } from './FeedbackSurface'

export interface EmptyStateProps extends Omit<
  FeedbackSurfaceProps,
  'tone' | 'headline' | 'detail' | 'children'
> {
  /** A plural noun phrase: "published posts", "comments on this article". */
  subject: string
  /** One sentence naming the next valid action. */
  nextAction: string
  /** Controls that perform that action. */
  children?: ReactNode
}

export function EmptyState({ subject, nextAction, children, ...rest }: EmptyStateProps) {
  return (
    <FeedbackSurface
      tone="empty"
      headline={emptyMessage(subject)}
      detail={namedSubject(nextAction, 'next action')}
      {...rest}
    >
      {children}
    </FeedbackSurface>
  )
}

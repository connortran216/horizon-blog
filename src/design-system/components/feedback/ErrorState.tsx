/**
 * Horizon Design System v2 - the action failed.
 *
 * `failedAction` is a verb phrase and it is required, so the headline is always
 * "We could not load the article." and never "Something went wrong". The retry
 * control is passed in as `children` rather than assumed - some failures are
 * not retryable, and the caller knows which.
 */

import type { ReactNode } from 'react'

import { failureMessage } from './feedback.logic'
import { FeedbackSurface, type FeedbackSurfaceProps } from './FeedbackSurface'

export interface ErrorStateProps extends Omit<
  FeedbackSurfaceProps,
  'tone' | 'headline' | 'children'
> {
  /** A verb phrase: "load the article", "publish this draft". */
  failedAction: string
  /** Optional context. Never the raw exception text. */
  detail?: string
  /** Typically a `RetryAction`. */
  children?: ReactNode
}

export function ErrorState({ failedAction, detail, children, ...rest }: ErrorStateProps) {
  return (
    <FeedbackSurface tone="error" headline={failureMessage(failedAction)} detail={detail} {...rest}>
      {children}
    </FeedbackSurface>
  )
}

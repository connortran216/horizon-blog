/**
 * Horizon Design System v2 - the thing is not there.
 *
 * A deleted article, an unpublished Series part, a stale link. Neutral tone,
 * because it is absence rather than failure, and the reader needs a way onward
 * rather than a retry - a second request will not find it either.
 */

import type { ReactNode } from 'react'

import { missingMessage } from './feedback.logic'
import { FeedbackSurface, type FeedbackSurfaceProps } from './FeedbackSurface'

export interface MissingStateProps extends Omit<
  FeedbackSurfaceProps,
  'tone' | 'headline' | 'children'
> {
  /** What was looked for: "that article", "the Series you asked for". */
  subject: string
  detail?: string
  /** A way onward - not a retry. */
  children?: ReactNode
}

export function MissingState({ subject, detail, children, ...rest }: MissingStateProps) {
  return (
    <FeedbackSurface tone="missing" headline={missingMessage(subject)} detail={detail} {...rest}>
      {children}
    </FeedbackSurface>
  )
}

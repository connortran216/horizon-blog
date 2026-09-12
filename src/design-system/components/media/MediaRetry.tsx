/**
 * Horizon Design System v2 - retry an image.
 *
 * The same control as `RetryAction`, sized for a frame overlay. It is a real
 * button inside the media surface, so it is in the tab order and reachable
 * without a pointer, which is the part a hover-revealed overlay usually loses.
 *
 * What it retries is the caller's business: `ResponsiveImage` wires this to the
 * state machine, and the machine asks the injected resolver for a fresh source.
 */

import { RetryAction, type RetryActionProps } from '../feedback'

export interface MediaRetryProps extends Omit<RetryActionProps, 'failedAction'> {
  /** A verb phrase: "load the cover image". */
  failedAction?: string
}

export function MediaRetry({ failedAction = 'load this image', ...rest }: MediaRetryProps) {
  return <RetryAction failedAction={failedAction} size="sm" {...rest} />
}

/**
 * Horizon Design System v2 - retry.
 *
 * A native button, so it is in the tab order and responds to Enter and Space
 * without any help. The label names the action being retried; the attempt
 * counter is separate text rather than part of the label, so the accessible
 * name does not change under the reader every time they press it.
 *
 * When the attempts are spent the button disappears rather than sitting there
 * disabled: a control that can never succeed is not a control.
 */

import { Button, Text, VStack, type ButtonProps } from '@chakra-ui/react'

import { componentTokens, space } from '../../../theme/tokens'
import { retryAvailable, retryHint, retryLabel, retryingMessage } from './feedback.logic'

export interface RetryActionProps extends Omit<ButtonProps, 'onClick' | 'children' | 'type'> {
  /** The verb phrase that failed: "load the article". */
  failedAction: string
  onRetry: () => void
  /** Retries already spent. */
  attempt?: number
  /** Zero means unlimited. */
  maxAttempts?: number
  /** A retry is in flight. */
  retrying?: boolean
  /**
   * Visible button text, for a caller whose `failedAction` makes the full
   * "Try to <action> again" phrase too long for the control - a task
   * description meant for prose, not a button label. The full phrase is
   * still the accessible name: it becomes the button's `aria-label`, so a
   * screen reader hears what is being retried even though the sighted label
   * just says "Try again". Omit it and nothing changes from before.
   */
  label?: string
}

export function RetryAction({
  failedAction,
  onRetry,
  attempt = 0,
  maxAttempts = 0,
  retrying = false,
  label,
  ...rest
}: RetryActionProps) {
  if (!retryAvailable({ attempt, maxAttempts })) {
    return null
  }

  const hint = retryHint({ attempt, maxAttempts })
  const fullLabel = retryLabel(failedAction)

  return (
    <VStack spacing={space[1]} align="center">
      <Button
        type="button"
        variant="outline"
        minHeight={componentTokens.control.minTouchTarget}
        minWidth={componentTokens.control.minTouchTarget}
        onClick={onRetry}
        isLoading={retrying}
        loadingText={retryingMessage(failedAction)}
        aria-label={label ? fullLabel : undefined}
        {...rest}
      >
        {label ?? fullLabel}
      </Button>
      {hint ? (
        <Text textStyle="meta" color="text.muted">
          {hint}
        </Text>
      ) : null}
    </VStack>
  )
}

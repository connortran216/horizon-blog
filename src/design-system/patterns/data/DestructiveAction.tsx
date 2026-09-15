/**
 * Horizon Design System v2 - the destructive confirmation.
 *
 * Delete a post, remove a Series, revoke access. It is a confirmation, not an
 * authorisation: the server decides whether the action is allowed, this decides
 * whether the human has said yes clearly enough.
 *
 * `horizon-blog-dsv2.6.3` acceptance 3 shows up here as what the component does
 * *not* do. It never marks the thing as removed, never hides the row it is
 * about, and never reports success. `onConfirm` hands the decision back to the
 * caller, the caller talks to the server, and the caller re-renders whatever
 * the server then says. An optimistic removal on this surface would show an
 * administrator that access is gone when the request may have been refused.
 *
 * The confirm button repeats the verb - "Delete this post", not "Confirm" -
 * because a button labelled "OK" reads identically whether the dialogue was
 * read or dismissed, and because it is what a screen-reader user hears when
 * they land on it having skipped the body.
 */

import { useId, useState } from 'react'
import { Box, Flex, VisuallyHidden } from '@chakra-ui/react'
import { FiAlertTriangle } from 'react-icons/fi'

import { space } from '../../../theme/tokens'
import { Button } from '../../components/actions'
import { Checkbox, Field, Input } from '../../components/forms'
import { Stack } from '../../components/layout'
import { Surface } from '../../components/surface'
import { Heading, Text } from '../../components/typography'
import { feedbackToneTokens } from '../../components/feedback'
import { destructiveCopy, destructiveGate, type DestructiveCopyInput } from './permission.logic'

export interface DestructiveActionProps extends DestructiveCopyInput {
  onConfirm: () => void
  onCancel: () => void
  /**
   * Ask the reader to type this before confirming. Reserve it for the truly
   * unrecoverable - a confirmation nobody can fail is not a confirmation, and
   * one everybody has to fight is one they learn to route around.
   */
  requiredConfirmation?: string
  /** Ask for an explicit acknowledgement tick as well. */
  requiresAcknowledgement?: boolean
  isSubmitting?: boolean
  /** A verb phrase from the server: "delete this post". Blocks the action. */
  deniedAction?: string
  /** A failure the request came back with. */
  error?: string
}

export function DestructiveAction({
  action,
  subject,
  consequence,
  isReversible,
  onConfirm,
  onCancel,
  requiredConfirmation,
  requiresAcknowledgement = false,
  isSubmitting = false,
  deniedAction,
  error,
}: DestructiveActionProps) {
  const fieldId = useId()
  const [typed, setTyped] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)

  const copy = destructiveCopy({ action, subject, consequence, isReversible })
  const gate = destructiveGate({
    typedConfirmation: typed,
    requiredConfirmation,
    isSubmitting,
    deniedAction,
    hasAcknowledged: acknowledged,
    requiresAcknowledgement,
  })
  const danger = feedbackToneTokens('error')

  return (
    <Surface as="section" depth="raised" aria-labelledby={`${fieldId}-title`}>
      <Stack gap={4}>
        <Flex gap={space[3]} align="flex-start">
          <Box
            as={FiAlertTriangle}
            aria-hidden="true"
            color={danger.fg}
            flexShrink={0}
            mt={space[1]}
          />
          <Stack gap={2} flex="1" minW="0">
            <Heading recipe="cardTitle" as="h2" id={`${fieldId}-title`}>
              {copy.title}
            </Heading>
            <Text recipe="body">{copy.body}</Text>
            {copy.permanence === null ? null : (
              <Text recipe="body" color={danger.fg} fontWeight="semibold">
                {copy.permanence}
              </Text>
            )}
          </Stack>
        </Flex>

        {requiresAcknowledgement ? (
          <Checkbox
            isChecked={acknowledged}
            onChange={(event) => setAcknowledged(event.target.checked)}
          >
            I understand what this removes.
          </Checkbox>
        ) : null}

        {requiredConfirmation === undefined ? null : (
          <Field
            label={`Type ${requiredConfirmation} to confirm`}
            id={`${fieldId}-confirmation`}
            hint="Case does not matter."
          >
            <Input
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              autoComplete="off"
            />
          </Field>
        )}

        {error === undefined ? null : (
          <Text recipe="metadata" role="alert" aria-live="assertive" color={danger.fg}>
            {error}
          </Text>
        )}

        <Flex gap={space[2]} flexWrap="wrap" justify="flex-end">
          {/*
           * Cancel comes first in the DOM and is the safer target. "Keep it"
           * rather than "Cancel": next to a destructive verb, "Cancel" can be
           * read as cancelling the thing itself.
           */}
          <Button tone="secondary" onClick={onCancel} isDisabled={isSubmitting}>
            {copy.cancelLabel}
          </Button>
          <Button
            tone="danger"
            isDisabled={!gate.canConfirm && !isSubmitting}
            isLoading={isSubmitting}
            loadingLabel={`${action}, in progress`}
            onClick={onConfirm}
          >
            {copy.confirmLabel}
          </Button>
        </Flex>

        {gate.blockedReason === null ? null : (
          // Says why the button will not act. A disabled control with no
          // explanation is a dead end the reader cannot debug.
          <Text recipe="metadata" role="status" aria-live="polite">
            {gate.blockedReason}
          </Text>
        )}

        <VisuallyHidden>Nothing is removed until the server confirms it.</VisuallyHidden>
      </Stack>
    </Surface>
  )
}

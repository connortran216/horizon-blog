/**
 * Horizon Design System v2 - the account panel.
 *
 * One centred card that every credential surface uses: sign in, register,
 * forgot password, reset password, and the provider callback. It replaces the
 * legacy `AuthShell` (`src/features/auth/components/AuthShell.tsx`) as the
 * arrangement, and it deliberately replaces nothing below that - the form, its
 * fields and its submit handler are `children`, supplied by the feature that
 * owns the auth contract.
 *
 * What this adds over a `Surface` with padding: one state machine for the ways
 * an account surface can fail, and a live region that announces the outcome of
 * a submission the reader cannot otherwise perceive.
 */

import type { ReactNode } from 'react'
import { Box, VisuallyHidden } from '@chakra-ui/react'

import { space } from '../../../theme/tokens'
import { ContentContainer, Stack } from '../../components/layout'
import { Surface } from '../../components/surface'
import { Eyebrow, Heading, Text } from '../../components/typography'
import { PermissionState } from '../../components/feedback'
import { authPanelState, type AuthPanelStateInput } from './auth.logic'

export interface AuthPanelProps extends AuthPanelStateInput {
  /** The small kicker above the title. "Account" on every production screen. */
  eyebrow?: string
  /** The task, in the reader's words: "Log in to your account". */
  title: string
  /** One sentence, plus the link to the opposite task. */
  description?: ReactNode
  /** The credential form. This component never renders inputs of its own. */
  children: ReactNode
  /** Feedback above the form: a validation alert, a reset confirmation. */
  feedback?: ReactNode
  /** The alternate route out - "New here? Create an account". */
  footer?: ReactNode
  /** Shown instead of the form when the account is refused. */
  deniedDetail?: string
}

/**
 * The panel never disables its own children. Busy-ness is reported through
 * `aria-busy` on the card and through whatever the caller passes to its own
 * controls, because a `fieldset[disabled]` thrown around a submitting form
 * takes focus off the control the reader just pressed.
 */
export function AuthPanel({
  eyebrow = 'Account',
  title,
  description,
  children,
  feedback,
  footer,
  deniedDetail,
  isSubmitting,
  validationError,
  deniedAction,
  isUnavailable,
}: AuthPanelProps) {
  const state = authPanelState({ isSubmitting, validationError, deniedAction, isUnavailable })

  return (
    <ContentContainer as="section" width="prose" py={space[12]}>
      <Stack gap={8}>
        <Stack gap={3} alignItems="center" textAlign="center">
          <Eyebrow as="p">{eyebrow}</Eyebrow>
          <Heading recipe="pageTitle" as="h1">
            {title}
          </Heading>
          {description === undefined ? null : <Text recipe="body">{description}</Text>}
        </Stack>

        <Surface
          depth="raised"
          p={{ base: space[6], sm: space[8] }}
          {...state.liveRegion}
          aria-busy={state['aria-busy']}
        >
          <Stack gap={6}>
            {feedback}

            {state.showsForm ? (
              children
            ) : (
              <PermissionState
                deniedAction={deniedAction ?? 'use this account'}
                detail={deniedDetail}
                align="start"
              />
            )}

            {/*
             * The visible spinner lives on the caller's submit button. This is
             * the same fact for a screen reader, which cannot see the button
             * change and would otherwise hear nothing between press and result.
             */}
            {state.status === 'submitting' ? (
              <VisuallyHidden>Working on your request</VisuallyHidden>
            ) : null}
          </Stack>
        </Surface>

        {footer === undefined ? null : (
          <Box textAlign="center">
            <Text recipe="metadata">{footer}</Text>
          </Box>
        )}
      </Stack>
    </ContentContainer>
  )
}

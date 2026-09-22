/**
 * Horizon Design System v2 - verification and callback feedback.
 *
 * Two surfaces that look the same and mean different things: the email
 * verification result, and the provider callback while the feature finishes the
 * exchange. Both are a status with an icon, a headline, one sentence and
 * whatever the caller offers as a way onward.
 *
 * State is never carried by colour alone here. Every branch renders an icon and
 * a sentence, and the icon differs per state - so "verified" and "link expired"
 * are distinguishable in greyscale, at 200% zoom, and read aloud.
 */

import type { ReactNode } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import { FiAlertCircle, FiCheckCircle, FiInfo, FiMail } from 'react-icons/fi'
import type { IconType } from 'react-icons'

import { componentTokens, radii, space } from '../../../theme/tokens'
import { Stack } from '../../components/layout'
import { Heading, Text } from '../../components/typography'
import {
  InlineLoading,
  feedbackToneTokens,
  type FeedbackTone,
  type LiveRegionAttributes,
} from '../../components/feedback'
import { StateHandoff } from '../../motion'
import {
  authAlertPresentation,
  authCallbackCopy,
  verificationCopy,
  type AuthAlertPresentation,
  type AuthAlertTone,
  type AuthCallbackStatus,
  type VerificationStatus,
} from './auth.logic'

const icons: Record<Exclude<FeedbackTone, 'loading'>, IconType> = {
  success: FiCheckCircle,
  error: FiAlertCircle,
  empty: FiMail,
  permission: FiAlertCircle,
  missing: FiAlertCircle,
  offline: FiAlertCircle,
}

interface FeedbackBodyProps {
  stateKey: string
  tone: FeedbackTone
  headline: string
  detail: string
  loadingTask: string
  liveRegion: LiveRegionAttributes
  children?: ReactNode
}

function FeedbackBody({
  stateKey,
  tone,
  headline,
  detail,
  loadingTask,
  liveRegion,
  children,
}: FeedbackBodyProps) {
  const { bg, fg } = feedbackToneTokens(tone)
  const Icon = tone === 'loading' ? undefined : icons[tone]

  return (
    <StateHandoff stateKey={stateKey}>
      <Stack gap={4} alignItems="center" textAlign="center" {...liveRegion}>
        <Flex
          align="center"
          justify="center"
          boxSize={space[12]}
          borderRadius={radii.tag}
          bg={bg}
          color={fg}
        >
          {Icon === undefined ? (
            // The spinner is the icon for the pending state, and it carries the
            // same announcement the other states carry as an icon plus a word.
            <InlineLoading task={loadingTask} hideLabel />
          ) : (
            <Box as={Icon} aria-hidden="true" boxSize={space[6]} />
          )}
        </Flex>

        <Heading recipe="cardTitle" as="h2">
          {headline}
        </Heading>
        <Text recipe="body">{detail}</Text>
        {children}
      </Stack>
    </StateHandoff>
  )
}

export interface VerificationFeedbackProps {
  status: VerificationStatus
  /** The resend form or the sign-in link, depending on the status. */
  children?: ReactNode
}

/**
 * Email verification: waiting for the link, checking it, verified, or the link
 * cannot be used.
 *
 * `offersResend` on the copy is what a caller should branch on when deciding
 * whether to pass a resend form as `children`; this component does not build
 * one, because the resend request belongs to the auth service.
 */
export function VerificationFeedback({ status, children }: VerificationFeedbackProps) {
  const copy = verificationCopy(status)

  return (
    <FeedbackBody
      stateKey={status}
      tone={copy.tone}
      headline={copy.headline}
      detail={copy.detail}
      loadingTask="your verification link"
      liveRegion={copy.liveRegion}
    >
      {children}
    </FeedbackBody>
  )
}

export interface AuthCallbackFeedbackProps {
  status: AuthCallbackStatus
  /** The provider, as the reader knows it: "Google". */
  provider: string
  /** A way onward when the callback failed - usually back to the panel. */
  children?: ReactNode
}

/**
 * The provider callback, while the feature resolves it.
 *
 * This surface reports; it does not decide. `status` comes from the feature's
 * own resolution of the callback, and there is no prop through which this
 * component could be told to treat an unresolved callback as a success.
 */
export function AuthCallbackFeedback({ status, provider, children }: AuthCallbackFeedbackProps) {
  const copy = authCallbackCopy(status, provider)

  return (
    <FeedbackBody
      stateKey={status}
      tone={copy.tone}
      headline={copy.headline}
      detail={copy.detail}
      loadingTask={`your ${provider} sign in`}
      liveRegion={copy.liveRegion}
    >
      {children}
    </FeedbackBody>
  )
}

export interface AuthAlertProps {
  tone: AuthAlertTone
  /** The headline. Names the outcome: "Password updated". */
  title: string
  detail?: string
}

/** Three marks for four tones. The tick belongs to `success` alone. */
const alertIcons: Record<AuthAlertPresentation['icon'], IconType> = {
  failure: FiAlertCircle,
  confirmation: FiCheckCircle,
  neutral: FiInfo,
}

/**
 * The compact banner above a credential form - a reset confirmation, a rejected
 * provider handoff, a deliberately non-committal acknowledgement.
 *
 * Every visual it carries comes from `authAlertPresentation`, so the colour, the
 * mark and the live region are one decision rather than three that can be set
 * against each other - a neutral surface with a tick on it would still read as a
 * confirmation.
 */
export function AuthAlert({ tone, title, detail }: AuthAlertProps) {
  const presentation = authAlertPresentation(tone)
  const { bg, fg } = presentation.tokens
  const Icon = alertIcons[presentation.icon]

  return (
    <Flex
      role={presentation.role}
      aria-live={presentation['aria-live']}
      gap={space[3]}
      align="flex-start"
      bg={bg}
      color={fg}
      borderRadius={componentTokens.feedback.radius}
      padding={space[4]}
    >
      <Box as={Icon} aria-hidden="true" flexShrink={0} mt={space[1]} />
      <Box>
        <Text recipe="body" as="strong" color={fg} fontWeight="semibold">
          {title}
        </Text>
        {detail === undefined ? null : <Text recipe="metadata">{detail}</Text>}
      </Box>
    </Flex>
  )
}

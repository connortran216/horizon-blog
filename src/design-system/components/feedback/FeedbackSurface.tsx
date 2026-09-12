/**
 * Horizon Design System v2 - the shared feedback surface.
 *
 * Empty, error, permission, missing and offline are the same object wearing
 * different tones. They share one layout, one live region and one action slot
 * so that a reader learns the shape once.
 *
 * The action slot is `children` and takes whatever the caller passes. This
 * primitive does not import a button: a feedback state knows it needs an
 * action, not which control the page will use for it.
 */

import { Box, Text, VStack, type BoxProps } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { componentTokens, space, transitionFor } from '../../../theme/tokens'
import { feedbackToneTokens, liveRegionFor, type FeedbackTone } from './feedback.logic'

export interface FeedbackSurfaceProps extends Omit<BoxProps, 'title' | 'children'> {
  tone: FeedbackTone
  /** The headline. Names the subject or the failed action - never "Error". */
  headline: string
  /** One sentence of context, or the next valid action. */
  detail?: string
  /** Actions. Keyboard-reachable controls supplied by the caller. */
  children?: ReactNode
  /** Centre for a region-sized state, left for an inline one. */
  align?: 'center' | 'start'
}

export function FeedbackSurface({
  tone,
  headline,
  detail,
  children,
  align = 'center',
  ...rest
}: FeedbackSurfaceProps) {
  const { bg, fg } = feedbackToneTokens(tone)

  return (
    <Box
      {...liveRegionFor(tone)}
      bg={bg}
      color={fg}
      borderRadius={componentTokens.feedback.radius}
      padding={space[6]}
      transition={`${transitionFor('background-color')}, ${transitionFor('color')}`}
      {...rest}
    >
      <VStack spacing={space[3]} align={align} textAlign={align === 'center' ? 'center' : 'start'}>
        <Text textStyle="cardTitle" color={fg}>
          {headline}
        </Text>
        {detail ? (
          <Text textStyle="body" color="text.secondary">
            {detail}
          </Text>
        ) : null}
        {children}
      </VStack>
    </Box>
  )
}

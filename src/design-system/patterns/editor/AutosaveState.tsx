/**
 * Horizon Design System v2 - the save indicator.
 *
 * The smallest component on the workspace and the one that matters most: it is
 * the author's only evidence that what they typed still exists.
 *
 * `horizon-blog-dsv2.6.2` acceptance 3 - critical state is never communicated
 * by motion or colour alone - is satisfied here in three channels at once:
 *
 * - text, from `autosaveState().label`, which is never blank;
 * - an icon, which differs per state, so the states are distinguishable in
 *   greyscale and with a colour-vision deficiency;
 * - colour, from the workspace tokens, as the third channel and never the only
 *   one.
 *
 * The spinner is not one of the channels. Under reduced motion it does not
 * turn, and the word "Saving your draft" is what carries the state instead.
 */

import { Box, Flex, VisuallyHidden } from '@chakra-ui/react'
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiLoader,
  FiWifiOff,
} from 'react-icons/fi'
import type { IconType } from 'react-icons'

import { space } from '../../../theme/tokens'
import { Text } from '../../components/typography'
import { loadingPulseAnimation, useMotionPolicy } from '../../motion'
import { autosaveState, type AutosaveIcon, type AutosaveStateInput } from './workspace.logic'

const icons: Record<AutosaveIcon, IconType> = {
  saving: FiLoader,
  saved: FiCheckCircle,
  warning: FiAlertTriangle,
  error: FiAlertCircle,
  offline: FiWifiOff,
  pending: FiClock,
}

export interface AutosaveStateProps extends AutosaveStateInput {
  /** Hide the detail sentence when the indicator sits in a tight toolbar. */
  compact?: boolean
}

export function AutosaveState({ compact = false, ...input }: AutosaveStateProps) {
  const policy = useMotionPolicy()
  const state = autosaveState(input)
  const Icon = icons[state.icon]

  return (
    <Box
      /*
       * Work at risk interrupts; ordinary progress waits for a pause. An
       * author who has just lost their connection needs to be told before they
       * type another paragraph, and an author whose draft saved does not.
       */
      role={state.interrupts ? 'alert' : 'status'}
      aria-live={state.interrupts ? 'assertive' : 'polite'}
      aria-atomic
    >
      <Flex align="center" gap={space[2]} color={state.color}>
        <Box
          as={Icon}
          aria-hidden="true"
          flexShrink={0}
          // Opacity only, and only while a save is actually in flight. This is
          // the one continuous animation the workspace is allowed, and it is
          // loading, which is what the motion contract reserves it for.
          animation={state.status === 'saving' ? loadingPulseAnimation(policy) : undefined}
        />
        <Text recipe="metadata" as="span" color={state.color} fontWeight="medium">
          {state.label}
        </Text>
      </Flex>

      {state.detail === undefined ? null : compact ? (
        // Still announced, just not taking two lines out of a dense toolbar.
        <VisuallyHidden>{state.detail}</VisuallyHidden>
      ) : (
        <Text recipe="metadata" marginBlockStart={space[1]}>
          {state.detail}
        </Text>
      )}
    </Box>
  )
}

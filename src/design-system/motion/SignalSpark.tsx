/**
 * Horizon Design System v2 - the signal itself.
 *
 * A dot in the synapse field's own ink with a bloom of its theme's glow: a
 * shade-deeper cobalt on the light canvas, lime on the dark one - the same
 * reading of "light" `fieldInk` makes for the canvas. It sits on the end of
 * whatever carries it (`SignalLine`'s tip, `NavTrack`'s leading end) and owns
 * nothing else. Internal to the design system: callers use the carriers.
 */

import { Box } from '@chakra-ui/react'

import { componentTokens } from '../../theme/tokens'
import type { SignalOrientation } from './signalRoute.logic'

const tokens = componentTokens.signal

const colourVar = (token: string) => `var(--chakra-colors-${token.replace('.', '-')})`
const bloom = (token: string) => `0 0 ${tokens.haloBlur} ${tokens.sparkSize} ${colourVar(token)}`

export interface SignalSparkProps {
  /** Which end of its carrier it rides: the far end along this axis. */
  readonly orientation: SignalOrientation
}

export function SignalSpark({ orientation }: SignalSparkProps) {
  const horizontal = orientation === 'horizontal'

  return (
    <Box
      position="absolute"
      boxSize={tokens.sparkSize}
      borderRadius="full"
      bg={tokens.spark}
      boxShadow={bloom(tokens.halo)}
      {...(horizontal
        ? { right: 0, top: '50%', transform: 'translate(50%, -50%)' }
        : { bottom: 0, left: '50%', transform: 'translate(-50%, 50%)' })}
      _dark={{ bg: tokens.sparkDark, boxShadow: bloom(tokens.haloDark) }}
    />
  )
}

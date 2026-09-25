/**
 * Horizon Design System v2 - a piece of copy the field writes.
 *
 * Wrap any block or run of text inside a `SynapseField` and it stays hidden
 * until a signal lands on it, then rises into place and glows for one pulse
 * in the action colour. Later signals light it again. Outside a field it is
 * simply visible. It paints nothing but that glow and owns no surface.
 */

import { useRef, type ReactNode } from 'react'
import { Box } from '@chakra-ui/react'
import { motion } from 'framer-motion'

import { componentTokens } from '../../theme/tokens'
import { transitionFor } from './policy.logic'
import { synapseTiming } from './synapse.logic'
import { typesetVariants } from './typeset.logic'
import { useMotionPolicy } from './useMotionPolicy'
import { useSynapseAnchor } from './useSynapseAnchor'

export interface SignalTargetProps {
  children: ReactNode
  /** `span` for a run inside a line; `div` for a block. */
  as?: 'span' | 'div'
  className?: string
}

const MotionBox = motion(Box)
const litGlow = { blur: componentTokens.signal.haloBlur } as const

export function SignalTarget({ children, as = 'div', className }: SignalTargetProps) {
  const policy = useMotionPolicy()
  const timing = synapseTiming(policy)
  const ref = useRef<HTMLDivElement>(null)
  const { hit, lit } = useSynapseAnchor(ref, Math.round(timing.pulse * 1000))

  return (
    <MotionBox
      ref={ref}
      as={as}
      className={className}
      display={as === 'span' ? 'inline-block' : 'block'}
      data-lit={lit ? 'true' : undefined}
      initial="hidden"
      animate={hit ? 'visible' : 'hidden'}
      variants={typesetVariants(policy)}
      transition={transitionFor('reveal', policy)}
      sx={{
        transition:
          'color var(--chakra-transition-duration-fast), text-shadow var(--chakra-transition-duration-fast)',
        '&[data-lit="true"]': {
          color: 'action.primary',
          // The glow is the field's ink: cobalt on the light canvas, lime on the dark.
          textShadow: `0 0 ${litGlow.blur} var(--chakra-colors-ambient-glow)`,
          _dark: { textShadow: `0 0 ${litGlow.blur} var(--chakra-colors-ambient-accentGlow)` },
        },
      }}
    >
      {children}
    </MotionBox>
  )
}

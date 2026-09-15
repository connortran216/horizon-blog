/**
 * Horizon Design System v2 - hover depth.
 *
 * Two pixels of transform, never a layout change, and gone entirely under
 * reduced motion. Depth is never the only signal: a card that lifts also
 * changes background or border, and those are the surface's job, not this
 * wrapper's.
 */

import { motion, type HTMLMotionProps } from 'framer-motion'

import { hoverLiftProps } from './policy.logic'
import { useMotionPolicy } from './useMotionPolicy'

export interface HoverLiftProps extends Omit<
  HTMLMotionProps<'div'>,
  'whileHover' | 'whileTap' | 'transition'
> {
  /**
   * Turn the lift off without unmounting - for a disabled card, or a touch
   * surface where the parent has decided hover means nothing.
   */
  disabled?: boolean
}

export function HoverLift({ disabled = false, children, ...rest }: HoverLiftProps) {
  const policy = useMotionPolicy()
  const { whileHover, whileTap, transition } = hoverLiftProps(policy)

  return (
    <motion.div
      whileHover={disabled ? undefined : whileHover}
      whileTap={disabled ? undefined : whileTap}
      transition={transition}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

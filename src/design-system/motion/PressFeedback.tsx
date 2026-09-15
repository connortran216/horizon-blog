/**
 * Horizon Design System v2 - press response.
 *
 * Press is the one interaction that must survive reduced motion, because it is
 * the answer to "did that register?". The scale goes away; the opacity dip
 * stays, and opacity is explicitly preserved by the motion policy.
 *
 * This wrapper does not create a control. Wrap a real `button` or `a` - the
 * accessibility floor has no room for a `div` with a click handler.
 */

import { motion, type HTMLMotionProps } from 'framer-motion'

import { pressFeedbackProps } from './policy.logic'
import { useMotionPolicy } from './useMotionPolicy'

export interface PressFeedbackProps extends Omit<
  HTMLMotionProps<'div'>,
  'whileTap' | 'transition'
> {
  disabled?: boolean
}

export function PressFeedback({ disabled = false, children, ...rest }: PressFeedbackProps) {
  const policy = useMotionPolicy()
  const { whileTap, transition } = pressFeedbackProps(policy)

  return (
    <motion.div whileTap={disabled ? undefined : whileTap} transition={transition} {...rest}>
      {children}
    </motion.div>
  )
}

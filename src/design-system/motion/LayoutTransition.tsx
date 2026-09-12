/**
 * Horizon Design System v2 - layout movement.
 *
 * Framer's layout projection, for the cases the design contract names:
 * filter reordering, Series connectors, a list that gains or loses a row. It
 * animates position, not size-driven reflow of prose.
 *
 * Under reduced motion `layout` is switched off outright rather than given a
 * zero duration. Projection with a zero duration still measures and still
 * rewrites transforms on every commit; switching it off is the honest reading
 * of "decorative layout movement stops".
 */

import { motion, type HTMLMotionProps } from 'framer-motion'

import { transitionFor } from './policy.logic'
import { useMotionPolicy } from './useMotionPolicy'

export interface LayoutTransitionProps extends Omit<HTMLMotionProps<'div'>, 'layout'> {
  /**
   * Give every participant in one reordering group the same `layoutId` family
   * via `layoutGroupId`, or leave it out for simple position animation.
   */
  layoutGroupId?: string
}

export function LayoutTransition({ layoutGroupId, children, ...rest }: LayoutTransitionProps) {
  const policy = useMotionPolicy()

  return (
    <motion.div
      layout={policy.layoutProjection}
      layoutId={layoutGroupId}
      transition={transitionFor('layout', policy)}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

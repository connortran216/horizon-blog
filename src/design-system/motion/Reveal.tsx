/**
 * Horizon Design System v2 - entry reveal.
 *
 * Fade, plus at most 8px of upward travel, once. Under reduced motion the
 * travel is zero and the duration collapses, so content appears without
 * movement rather than not appearing at all.
 *
 * `Reveal` paints nothing: no background, no padding, no radius. It is a motion
 * wrapper, and the surface underneath keeps its single visual owner.
 */

import { useRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'

import type { DurationToken } from '../../theme/tokens'
import { revealVariants, transitionFor } from './policy.logic'
import { useMotionPolicy } from './useMotionPolicy'
import { useRevealInView } from './useRevealInView'

export interface RevealProps extends Omit<
  HTMLMotionProps<'div'>,
  'initial' | 'animate' | 'variants' | 'transition'
> {
  /** `inView` waits for the scroll position; `mount` reveals immediately. */
  trigger?: 'inView' | 'mount'
  /** Entry duration. `enter` for prominent content, `reveal` for editorial. */
  duration?: DurationToken
  /** Seconds. `Stagger` uses this; a single `Reveal` rarely needs it. */
  delay?: number
  rootMargin?: string
  threshold?: number
}

export function Reveal({
  trigger = 'inView',
  duration = 'enter',
  delay = 0,
  rootMargin,
  threshold,
  children,
  ...rest
}: RevealProps) {
  const policy = useMotionPolicy()
  const ref = useRef<HTMLDivElement>(null)
  const revealed = useRevealInView(ref, {
    enabled: trigger === 'inView',
    rootMargin,
    threshold,
  })
  const variants = revealVariants(policy)

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={revealed ? 'visible' : 'hidden'}
      variants={variants}
      transition={transitionFor(duration, policy, delay)}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

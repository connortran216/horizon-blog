/**
 * Horizon Design System v2 - sequenced entry.
 *
 * `Stagger` renders no container of its own. It wraps each child in a `Reveal`
 * and returns them as siblings, so a grid or flex parent keeps its own layout
 * and each wrapper becomes the item the parent was already going to lay out.
 * A container here would silently add a layer between a grid and its cells.
 *
 * Delays are capped (`maxDelay`): a long results list must not put its last row
 * seconds into the future. Under reduced motion every delay is zero and the
 * group fades in together.
 */

import { Children, isValidElement } from 'react'
import type { ReactNode } from 'react'

import type { DurationToken } from '../../theme/tokens'
import { staggerDelays } from './policy.logic'
import { useMotionPolicy } from './useMotionPolicy'
import { Reveal } from './Reveal'

export interface StaggerProps {
  children: ReactNode
  /** Gap between two neighbours. Defaults to the `fast` token (120ms). */
  step?: DurationToken
  /** Entry duration for each child. */
  duration?: DurationToken
  /** Seconds before the first child. */
  initialDelay?: number
  /** Seconds. The longest any child will wait, however long the list is. */
  maxDelay?: number
  trigger?: 'inView' | 'mount'
}

export function Stagger({
  children,
  step = 'fast',
  duration = 'enter',
  initialDelay = 0,
  maxDelay = 0.6,
  trigger = 'inView',
}: StaggerProps) {
  const policy = useMotionPolicy()
  // `toArray` already drops null, undefined and booleans, and gives every entry
  // a stable key, so the wrapper keys below survive a reorder.
  const items = Children.toArray(children)
  const delays = staggerDelays({ count: items.length, policy, step, initialDelay, maxDelay })

  return (
    <>
      {items.map((child, index) => (
        <Reveal
          key={isValidElement(child) && child.key !== null ? child.key : index}
          trigger={trigger}
          duration={duration}
          delay={delays[index]}
        >
          {child}
        </Reveal>
      ))}
    </>
  )
}

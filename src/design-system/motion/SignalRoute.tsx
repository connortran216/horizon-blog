/**
 * Horizon Design System v2 - a line that writes the copy beside it.
 *
 * Home's field writes its headline with signals that leave the network and
 * land on words. A route does the same with one line: when it comes into view
 * its `SignalLine` draws itself, the drawing tip is a signal, and every anchor
 * inside the route - each `Typeset` word, each `SignalTarget` - is written as
 * the tip reaches it. The anchors use the field's own contract, so the two
 * copy primitives work inside a route unchanged.
 *
 * `pace` decides what "reaches" means: `position` writes an anchor when the
 * tip passes its place along the line - a divider with rows beside it - and
 * `order` writes the anchors one after another across the travel - the words
 * of a headline above a rule.
 *
 * Decoration never gates content. Under reduced motion, or when the line is
 * not laid out at this width, every anchor is written at once; an anchor the
 * tip has somehow not reached appears by `fallbackMs` regardless. The route
 * paints nothing of its own and owns no surface.
 */

import { useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { Box, type BoxProps } from '@chakra-ui/react'
import { animate, useMotionValue } from 'framer-motion'

import { createDisposerBag, type DisposerBag } from './lifecycle.logic'
import { standardEase, type Disposer } from './policy.logic'
import {
  projectOnRail,
  railLength,
  reachedAt,
  routeStops,
  routeTravels,
  signalRouteTiming,
  type SignalOrientation,
  type SignalPace,
} from './signalRoute.logic'
import { SignalRouteContext, type SignalRouteRail } from './signalRouteContext'
import { SynapseContext, type SynapseAnchorHandle, type SynapseSignals } from './synapseContext'
import { useMotionPolicy } from './useMotionPolicy'
import { useRevealInView } from './useRevealInView'

export interface SignalRouteProps extends Omit<BoxProps, 'as'> {
  children: ReactNode
  /** The axis the route's `SignalLine` runs along. */
  orientation?: SignalOrientation
  /** How the anchors are spaced along the travel. */
  pace?: SignalPace
  /** `mount` for a route above the fold; `inView` for one further down. */
  trigger?: 'mount' | 'inView'
  /** Extra seconds before the tip leaves - to let something else finish first. */
  delay?: number
  as?: 'div' | 'section' | 'header' | 'article'
}

interface RouteAnchor extends SynapseAnchorHandle {
  hit: boolean
}

export function SignalRoute({
  children,
  orientation = 'horizontal',
  pace = 'position',
  trigger = 'inView',
  delay = 0,
  as = 'div',
  ...rest
}: SignalRouteProps) {
  const policy = useMotionPolicy()
  const timing = signalRouteTiming(policy, delay)
  const progress = useMotionValue(policy.reduced ? 1 : 0)
  const rootRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLElement | null>(null)
  const anchorsRef = useRef<RouteAnchor[]>([])
  const doneRef = useRef(policy.reduced)
  const revealed = useRevealInView(rootRef, { enabled: trigger === 'inView' })

  doneRef.current = doneRef.current || policy.reduced

  const write = (anchor: RouteAnchor) => {
    const first = !anchor.hit

    anchor.hit = true
    anchor.onHit(first)
  }

  /*
   * Anchors register from effects in tree order, which is writing order. One
   * that registers after the tip has arrived - content that mounted late - is
   * written at once rather than left for the fallback.
   */
  const register = useCallback((handle: SynapseAnchorHandle): Disposer => {
    const entry: RouteAnchor = { ...handle, hit: false }

    anchorsRef.current = [...anchorsRef.current, entry]

    if (doneRef.current) {
      entry.hit = true
      handle.onHit(true)
    }

    return () => {
      anchorsRef.current = anchorsRef.current.filter((item) => item !== entry)
    }
  }, [])

  const registerRail = useCallback((element: HTMLElement): Disposer => {
    railRef.current = element

    return () => {
      if (railRef.current === element) {
        railRef.current = null
      }
    }
  }, [])

  // The whole travel plus one reveal of slack: the ceiling any anchor waits.
  const fallbackMs = Math.round((timing.delay + timing.travel + timing.pulse) * 1000) + 1
  const signals = useMemo<SynapseSignals>(() => ({ register, fallbackMs }), [register, fallbackMs])
  const rail = useMemo<SignalRouteRail>(
    () => ({ progress, orientation, registerRail }),
    [progress, orientation, registerRail],
  )

  useEffect(() => {
    if (!revealed) {
      return
    }

    // Travelled once already: the line stays drawn, whatever re-runs this.
    if (doneRef.current) {
      progress.set(1)

      return
    }

    const bag: DisposerBag = createDisposerBag()
    const line = railRef.current
    const lineBox = line?.getBoundingClientRect()
    const length = lineBox ? railLength(lineBox, orientation) : 0

    const finish = () => {
      doneRef.current = true
      progress.set(1)
      anchorsRef.current.filter((anchor) => !anchor.hit).forEach(write)
    }

    if (!routeTravels(policy, length) || lineBox === undefined) {
      finish()

      return
    }

    const anchors = [...anchorsRef.current]
    const stops = routeStops(
      anchors.map((anchor) =>
        projectOnRail(anchor.element.getBoundingClientRect(), lineBox, orientation),
      ),
      pace,
    )
    const written = new Set<number>()

    progress.set(0)
    bag.add(
      progress.on('change', (value) => {
        for (const index of reachedAt(stops, value, written)) {
          written.add(index)
          write(anchors[index])
        }
      }),
    )

    const controls = animate(progress, 1, {
      duration: timing.travel,
      delay: timing.delay,
      ease: standardEase,
      onComplete: finish,
    })

    bag.add(() => controls.stop())

    return () => bag.dispose()
    // `policy` is read through `routeTravels`; the timing values are its own.
  }, [revealed, orientation, pace, policy, progress, timing.delay, timing.travel])

  return (
    <SignalRouteContext.Provider value={rail}>
      <SynapseContext.Provider value={signals}>
        <Box ref={rootRef} as={as} {...rest}>
          {children}
        </Box>
      </SynapseContext.Provider>
    </SignalRouteContext.Provider>
  )
}

/**
 * A set of nav items with one travelling indicator.
 *
 * Each `NavItem` on its own marks the current page with a bar that fades in
 * under it. Inside a track the items keep `aria-current` and their colour but
 * give up their own bars, and the track draws one bar that travels to the
 * current item when the route changes - with a signal riding its leading end
 * for the length of the journey, the Dawn language's light arriving along a
 * line. On the first placement it simply appears.
 *
 * The bar is the full width of the set, positioned by translate and sized by
 * scale, so it moves nothing beside it. It is measured from the element that
 * carries `aria-current="page"` - the attribute assistive technology reads is
 * still the one that decides where the bar goes. Under reduced motion it moves
 * without travel and without a signal.
 */

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Box, Flex, type FlexProps } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'

import { componentTokens, radii, space } from '../../../theme/tokens'
import { createDisposerBag } from '../../motion/lifecycle.logic'
import { durationSeconds, standardEase } from '../../motion/policy.logic'
import { SignalSpark } from '../../motion/SignalSpark'
import { useMotionPolicy } from '../../motion/useMotionPolicy'
import {
  spanWithin,
  trackIndicator,
  trackLead,
  type TrackIndicator,
  type TrackLead,
} from './navTrack.logic'

const NavTrackContext = createContext(false)

/** Whether a `NavItem` sits in a track, which then draws its indicator for it. */
export function useInNavTrack(): boolean {
  return useContext(NavTrackContext)
}

export interface NavTrackProps extends FlexProps {
  children: ReactNode
}

/** The items' own padding, which the bar is inset by - see `NavItem`. */
const ITEM_INSET = Number.parseFloat(space[3])

// Layout effects are a warning under server rendering; there is nothing to measure there anyway.
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

interface Journey {
  readonly lead: TrackLead
  /** Changes with every journey, so the signal replays. */
  readonly id: number
}

export function NavTrack({ children, ...rest }: NavTrackProps) {
  const policy = useMotionPolicy()
  const { pathname } = useLocation()
  const setRef = useRef<HTMLDivElement>(null)
  const previousRef = useRef<TrackIndicator | null>(null)
  const [indicator, setIndicator] = useState<TrackIndicator | null>(null)
  const [journey, setJourney] = useState<Journey | null>(null)

  useIsomorphicLayoutEffect(() => {
    const set = setRef.current

    if (set === null) {
      return
    }

    const bag = createDisposerBag()

    const measure = (asJourney: boolean) => {
      const setBox = set.getBoundingClientRect()
      const current = set.querySelector<HTMLElement>('[aria-current="page"]')
      const span = current ? spanWithin(setBox, current.getBoundingClientRect()) : null
      const next = trackIndicator(setBox.width, span, ITEM_INSET)
      const lead = trackLead(previousRef.current, next, setBox.width)

      previousRef.current = next
      setIndicator(next)

      // Only a route change is a journey; a resize simply moves the bar with its item.
      if (asJourney && lead.travels) {
        setJourney((last) => ({ lead, id: (last?.id ?? 0) + 1 }))
      }
    }

    measure(true)

    // A resize or a late web font moves the items; follow them without a journey.
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => measure(false))

      observer.observe(set)
      bag.add(() => observer.disconnect())
    }

    return () => bag.dispose()
  }, [pathname])

  const seconds = durationSeconds('navigation', policy)
  const travel = { duration: seconds, ease: standardEase }
  const lead = journey?.lead

  return (
    <NavTrackContext.Provider value>
      <Flex ref={setRef} position="relative" {...rest}>
        {children}
        {indicator ? (
          <motion.div
            aria-hidden="true"
            data-nav-track-indicator=""
            initial={false}
            animate={{
              x: indicator.x,
              scaleX: indicator.scale,
              opacity: indicator.visible ? 1 : 0,
            }}
            transition={travel}
            style={{ position: 'absolute', left: 0, bottom: 0, width: '100%', originX: 0 }}
          >
            <Box height="2px" borderRadius={radii.tag} bg={componentTokens.header.itemIndicator} />
          </motion.div>
        ) : null}
        {lead && !policy.reduced ? (
          <motion.div
            key={journey?.id}
            aria-hidden="true"
            initial={{ x: lead.from, opacity: 0 }}
            animate={{ x: lead.to, opacity: [0, 1, 1, 0] }}
            transition={{
              ...travel,
              opacity: { duration: seconds * 1.6, times: [0, 0.15, 0.6, 1] },
            }}
            style={{ position: 'absolute', left: 0, bottom: '1px', width: 0, height: 0 }}
          >
            <SignalSpark orientation="horizontal" />
          </motion.div>
        ) : null}
      </Flex>
    </NavTrackContext.Provider>
  )
}

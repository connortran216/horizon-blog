/**
 * Horizon Design System v2 - a hairline whose drawing tip is a signal.
 *
 * Inside a `SignalRoute` the line is the route's rail: it draws exactly as far
 * as the route's travel has gone, and a small spark in the field's own ink
 * rides its leading end, fading in as it leaves and out as it arrives.
 *
 * Outside a route it belongs to a host - the nearest ancestor carrying
 * `data-signal-host` - and draws when the host is hovered or holds focus, then
 * withdraws when it is left: a horizon under a card's cover. Given `drawn`, it
 * answers to that instead - a selected tab, a current thread - drawing, tip
 * and all, each time it turns true. It reserves the same footprint either way,
 * so it never moves anything beside it.
 *
 * Transform and opacity only. The rail scales along its axis; the tip rides a
 * carrier the rail's own length that translates by its own size, so travel
 * needs no measurement. It is decoration, hidden from assistive technology,
 * and under reduced motion there is no tip - the rail is simply drawn.
 */

import { useEffect, useRef, type RefObject } from 'react'
import { Box, type BoxProps } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { motion, useTransform, type MotionValue } from 'framer-motion'

import { componentTokens, duration, easing } from '../../theme/tokens'
import {
  carrierTransform,
  railTransform,
  signalLineFrame,
  type SignalOrientation,
} from './signalRoute.logic'
import { SignalSpark } from './SignalSpark'
import { useSignalRouteRail } from './signalRouteContext'
import { useMotionPolicy } from './useMotionPolicy'

export interface SignalLineProps extends Omit<BoxProps, 'children'> {
  /** Standalone only; inside a route the route's orientation wins. */
  orientation?: SignalOrientation
  /** `quiet` is the divider role; `action` is the action colour. */
  tone?: 'quiet' | 'action'
  /** Standalone only: draw on this state instead of on the host's hover and focus. */
  drawn?: boolean
}

/** The attribute that makes an element a standalone line's host. */
export const SIGNAL_HOST = 'data-signal-host'

const MotionBox = motion(Box)
const tokens = componentTokens.signal

/*
 * The tip's life while a host draws its line: in over the first stretch, out
 * over the last - the same envelope `signalLineFrame` gives a route's tip.
 */
const hostTip = keyframes({
  '0%': { opacity: 0 },
  '8%': { opacity: 1 },
  '88%': { opacity: 1 },
  '100%': { opacity: 0 },
})

export function SignalLine({
  orientation: ownOrientation = 'horizontal',
  tone = 'quiet',
  drawn,
  ...rest
}: SignalLineProps) {
  const route = useSignalRouteRail()
  const policy = useMotionPolicy()
  const ref = useRef<HTMLDivElement>(null)
  const orientation = route?.orientation ?? ownOrientation
  const horizontal = orientation === 'horizontal'
  const railColour = tone === 'action' ? tokens.railActive : tokens.rail

  useEffect(() => {
    const element = ref.current

    if (route === null || element === null) {
      return
    }

    return route.registerRail(element)
  }, [route])

  const shell: BoxProps = {
    position: 'relative',
    flexShrink: 0,
    ...(horizontal ? { width: '100%', height: '1px' } : { height: '100%', width: '1px' }),
    sx: {
      // Clipped along the axis only, so the tip's bloom is not cut off.
      clipPath: horizontal ? `inset(-${tokens.haloBlur} 0)` : `inset(0 -${tokens.haloBlur})`,
    },
  }
  const origin = horizontal ? 'left center' : 'center top'

  if (route !== null) {
    return (
      <RouteLine
        progress={route.progress}
        lineRef={ref}
        shell={shell}
        origin={origin}
        railColour={railColour}
        orientation={orientation}
        showTip={!policy.reduced}
        rest={rest}
      />
    )
  }

  const travel = policy.reduced
    ? 'none'
    : `transform ${duration[tokens.transition]} ${easing.standard}`
  const hovered = `[${SIGNAL_HOST}]:hover &, [${SIGNAL_HOST}]:focus-within &`
  // Controlled: the drawn styles apply by state. Otherwise the host decides.
  const when = (styles: Record<string, string>) =>
    drawn === undefined ? { [hovered]: styles } : drawn ? styles : {}

  return (
    <Box
      ref={ref}
      data-signal-line=""
      data-drawn={drawn === undefined ? undefined : String(drawn)}
      aria-hidden="true"
      {...shell}
      {...rest}
    >
      <Box
        position="absolute"
        inset={0}
        bg={railColour}
        transformOrigin={origin}
        transform={railTransform(0, orientation)}
        transition={travel}
        sx={when({ transform: railTransform(1, orientation) })}
      />
      {policy.reduced ? null : (
        <Box
          position="absolute"
          inset={0}
          transform={carrierTransform(0, orientation)}
          transition={travel}
          opacity={0}
          sx={when({
            transform: carrierTransform(1, orientation),
            animation: `${hostTip} ${duration[tokens.transition]} ${easing.standard} both`,
          })}
        >
          <SignalSpark orientation={orientation} />
        </Box>
      )}
    </Box>
  )
}

interface RouteLineProps {
  readonly progress: MotionValue<number>
  readonly lineRef: RefObject<HTMLDivElement>
  readonly shell: BoxProps
  readonly origin: string
  readonly railColour: string
  readonly orientation: SignalOrientation
  readonly showTip: boolean
  readonly rest: BoxProps
}

/** The route's rail: every value read from the route's single progress. */
function RouteLine({
  progress,
  lineRef,
  shell,
  origin,
  railColour,
  orientation,
  showTip,
  rest,
}: RouteLineProps) {
  const horizontal = orientation === 'horizontal'
  const draw = useTransform(progress, (value) => signalLineFrame(value).draw)
  const tip = useTransform(progress, (value) => signalLineFrame(value).tip)
  const offset = useTransform(
    progress,
    (value) => `${(Math.min(1, Math.max(0, value)) - 1) * 100}%`,
  )

  return (
    <Box ref={lineRef} data-signal-line="" aria-hidden="true" {...shell} {...rest}>
      <MotionBox
        position="absolute"
        inset={0}
        bg={railColour}
        style={horizontal ? { scaleX: draw, originX: 0 } : { scaleY: draw, originY: 0 }}
        sx={{ transformOrigin: origin }}
      />
      {showTip ? (
        <MotionBox
          position="absolute"
          inset={0}
          style={horizontal ? { x: offset, opacity: tip } : { y: offset, opacity: tip }}
        >
          <SignalSpark orientation={orientation} />
        </MotionBox>
      ) : null}
    </Box>
  )
}

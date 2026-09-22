/**
 * Horizon Design System v2 - the pointer light.
 *
 * Wrap a piece of artwork and a glare follows the reader's pointer across it:
 * a horizontal band at the pointer's height and a soft pool beneath the pointer,
 * both in `ambient.*` colour, blended as light. See `pointerLight.logic.ts` for
 * the geometry and for the gate that keeps this off touch devices and away
 * from readers who asked for less motion.
 *
 * It paints only light. Border, radius, shadow and clipping belong to the
 * surface it sits inside - put it inside a `Surface`, not around one.
 *
 * The pointer lives in motion values, not React state: a re-render per mouse
 * move would put the whole Signature through React for a decoration. Only the
 * enter and leave change state, and only to fade the light.
 */

import { useCallback, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { Box, type BoxProps } from '@chakra-ui/react'
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionStyle,
} from 'framer-motion'

import { componentTokens, transitionFor } from '../../theme/tokens'
import {
  LIGHT_BAND_HEIGHT,
  LIGHT_POOL_WIDTH,
  LIGHT_REST,
  LIGHT_SPRING,
  lightPositionIn,
  pointerLightState,
  readFinePointer,
  subscribeFinePointer,
} from './pointerLight.logic'
import type { Disposer } from './policy.logic'
import { useMotionPolicy } from './useMotionPolicy'

export interface PointerLightProps extends Omit<BoxProps, 'children'> {
  children: ReactNode
  /** Keep the wrapper, drop the light - for a surface that is not artwork today. */
  disabled?: boolean
}

const browserMatchMedia = () =>
  typeof window === 'undefined' ? null : window.matchMedia?.bind(window)

function useFinePointer(): boolean {
  const subscribe = useCallback(
    (notify: () => void): Disposer => subscribeFinePointer(browserMatchMedia(), notify),
    [],
  )
  const getSnapshot = useCallback(() => readFinePointer(browserMatchMedia()), [])

  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}

const MotionBox = motion(Box)
const light = { position: 'absolute', pointerEvents: 'none' } as const
const feature = componentTokens.feature

export function PointerLight({ children, disabled = false, ...rest }: PointerLightProps) {
  const policy = useMotionPolicy()
  const hasFinePointer = useFinePointer()
  const [isHovering, setIsHovering] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const state = pointerLightState({
    allowsPointerFollowing: policy.pointerFollowing,
    hasFinePointer,
    isHovering,
    disabled,
  })

  const pointerX = useMotionValue(LIGHT_REST.x)
  const pointerY = useMotionValue(LIGHT_REST.y)
  const smoothX = useSpring(pointerX, LIGHT_SPRING)
  const smoothY = useSpring(pointerY, LIGHT_SPRING)
  const xPercent = useTransform(smoothX, (value) => value * 100)
  const yPercent = useTransform(smoothY, (value) => value * 100)
  const bandTop = useMotionTemplate`calc(${yPercent}% - ${(LIGHT_BAND_HEIGHT * 100) / 2}%)`
  const poolLeft = useMotionTemplate`${xPercent}%`
  const poolTop = useMotionTemplate`${yPercent}%`

  const bandStyle: MotionStyle = { top: bandTop }
  const poolStyle: MotionStyle = { left: poolLeft, top: poolTop, x: '-50%', y: '-50%' }

  const follow = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!state.isEnabled || ref.current === null) {
      return
    }

    const next = lightPositionIn(ref.current.getBoundingClientRect(), event.clientX, event.clientY)

    pointerX.set(next.x)
    pointerY.set(next.y)
  }

  return (
    <Box
      ref={ref}
      position="relative"
      onPointerMove={follow}
      onPointerEnter={() => setIsHovering(true)}
      onPointerLeave={() => setIsHovering(false)}
      {...rest}
    >
      {children}
      {state.isEnabled ? (
        <Box
          aria-hidden="true"
          {...light}
          inset={0}
          overflow="hidden"
          mixBlendMode="screen"
          opacity={state.opacity}
          transition={transitionFor('opacity', 'normal')}
        >
          {/*
            The glare band, twice: two layers of the same low-alpha glow read
            as one band of light on a photograph, where one layer reads as a
            tint. Stacking the token beats inventing a stronger colour.
          */}
          <MotionBox
            {...light}
            insetX={0}
            height={`${LIGHT_BAND_HEIGHT * 100}%`}
            bgGradient="linear(to-b, transparent, ambient.glow 40%, ambient.glow 60%, transparent)"
            style={bandStyle}
          />
          <MotionBox
            {...light}
            insetX={0}
            height={`${LIGHT_BAND_HEIGHT * 100}%`}
            bgGradient="linear(to-b, transparent, ambient.glow, transparent)"
            style={bandStyle}
          />
          <MotionBox
            {...light}
            width={`${LIGHT_POOL_WIDTH * 100}%`}
            sx={{ aspectRatio: '1' }}
            borderRadius="full"
            bgGradient="radial(ambient.glow, transparent 70%)"
            filter={`blur(${feature.ambientBloom})`}
            style={poolStyle}
          />
        </Box>
      ) : null}
    </Box>
  )
}

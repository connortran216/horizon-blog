/**
 * Horizon Design System v2 - the pointer light.
 *
 * `DESIGN.md` approves one pointer-following behaviour: the desktop Signature
 * light. This is its geometry and its gate. The light is a horizontal glare
 * that follows the pointer's height across the artwork - the sun on water,
 * rather than the round spotlight under the cursor that every card on the web
 * already has - with a softer pool beneath the pointer itself.
 *
 * It runs only where a pointer can hover (`pointer: fine`) and only while the
 * policy allows pointer following, so a phone never mounts it and a reduced-
 * motion reader never sees it. Both decisions are pure functions here.
 */

import type { Disposer, MatchMediaLike, MediaQueryChangeEvent } from './policy.logic'

export interface PointerBox {
  readonly left: number
  readonly top: number
  readonly width: number
  readonly height: number
}

/** Unit coordinates inside the lit surface: 0..1 across and 0..1 down. */
export interface LightPosition {
  readonly x: number
  readonly y: number
}

/** Where the light rests when the pointer is not over the surface. */
export const LIGHT_REST: LightPosition = { x: 0.5, y: 0.5 }

/** How tall the glare band is, as a share of the surface. */
export const LIGHT_BAND_HEIGHT = 0.38
/** The pool's diameter, as a share of the surface's width. */
export const LIGHT_POOL_WIDTH = 0.46

/**
 * Spring for the two motion values. Softer than the About scene's: the band
 * should lag the pointer the way light on water lags the thing casting it.
 */
export const LIGHT_SPRING = { stiffness: 110, damping: 26, mass: 0.7 } as const

const clampUnit = (value: number) => Math.min(1, Math.max(0, value))

/** A degenerate box means the surface has no size yet; the light rests. */
export function lightPositionIn(box: PointerBox, clientX: number, clientY: number): LightPosition {
  if (box.width <= 0 || box.height <= 0) {
    return LIGHT_REST
  }

  return {
    x: clampUnit((clientX - box.left) / box.width),
    y: clampUnit((clientY - box.top) / box.height),
  }
}

export interface PointerLightStateInput {
  readonly allowsPointerFollowing: boolean
  readonly hasFinePointer: boolean
  readonly isHovering: boolean
  readonly disabled?: boolean
}

export interface PointerLightState {
  /** The light exists on this device for this reader. */
  readonly isEnabled: boolean
  /** Its opacity right now. It fades in on enter and out on leave. */
  readonly opacity: number
}

export function pointerLightState({
  allowsPointerFollowing,
  hasFinePointer,
  isHovering,
  disabled = false,
}: PointerLightStateInput): PointerLightState {
  const isEnabled = !disabled && allowsPointerFollowing && hasFinePointer

  return { isEnabled, opacity: isEnabled && isHovering ? 1 : 0 }
}

/** Media query for a device whose primary pointer can hover precisely. */
export const finePointerQuery = '(pointer: fine)'

/** No `matchMedia` means a server render: assume a touch device, mount nothing. */
export function readFinePointer(matchMedia: MatchMediaLike | null | undefined): boolean {
  if (typeof matchMedia !== 'function') {
    return false
  }

  return matchMedia(finePointerQuery).matches === true
}

/** The same shape as `subscribeReducedMotion`, for the pointer query. */
export function subscribeFinePointer(
  matchMedia: MatchMediaLike | null | undefined,
  listener: (fine: boolean) => void,
): Disposer {
  if (typeof matchMedia !== 'function') {
    return () => {}
  }

  const query = matchMedia(finePointerQuery)
  const handle = (event: MediaQueryChangeEvent) => listener(event.matches === true)

  if (typeof query.addEventListener === 'function') {
    query.addEventListener('change', handle)

    return () => query.removeEventListener?.('change', handle)
  }

  if (typeof query.addListener === 'function') {
    query.addListener(handle)

    return () => query.removeListener?.(handle)
  }

  return () => {}
}

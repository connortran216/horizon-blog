/**
 * The About hero's editorial track and ambient scene - the decisions, without
 * the DOM.
 *
 * The hero shows three threads. Each one is a control the reader can press, and
 * the pressed thread drives both the emphasis in the track and the atmosphere
 * behind it. Which thread is current, what its control reports, whether the
 * scene may move at all and how far it may travel are all answered here so they
 * can be tested in a repository that does not render components.
 *
 * `DESIGN.md`'s Motion section sanctions ambient movement on suitable Home and
 * About artwork, on the conditions that it pauses on interaction and stops under
 * reduced motion. Both conditions are properties of `ambientScene`, which is why
 * they are provable rather than promised.
 *
 * The millisecond values below are dwell times and pacing, not motion
 * durations. The motion token scale stops at 480ms because that is the longest a
 * transition may take; how long a thread stays on screen, and how often a pass
 * of light crosses the scene, are reading-pace decisions with no token, so they
 * are named here rather than inlined.
 */

import { transform } from '../../theme/tokens'
/*
 * Imported from the motion policy module directly rather than through the
 * design system barrel: this file is pure and its test must stay free of React,
 * and the barrel pulls in every component in the system.
 */
import { parseLengthPx } from '../../design-system/motion/policy.logic'

/** How long a thread stays current before the track advances by itself. */
export const AUTO_ADVANCE_MS = 4600

/** How long the track stays put after the reader chooses a thread. */
export const USER_PAUSE_MS = 5200

/** How long one pass of light takes to cross the scene. */
export const SWEEP_TRAVEL_MS = 10500

/** How long the scene rests between two passes. */
export const SWEEP_REST_MS = 4000

export interface TrackRotationInput {
  /** Number of threads. One thread has nothing to rotate to. */
  readonly count: number
  /** The reader touched the track recently. */
  readonly isPaused: boolean
  /**
   * The motion policy allows ambient movement. Under reduced motion it does
   * not, and the track becomes a plain selector.
   */
  readonly allowsAmbient: boolean
}

/**
 * Whether the auto-advance timer should be running.
 *
 * Reduced motion stops it outright rather than slowing it: an advance is a
 * content change, not a transition, so collapsing its duration would not help
 * anyone who asked for less movement.
 */
export function trackAdvances({ count, isPaused, allowsAmbient }: TrackRotationInput): boolean {
  return allowsAmbient && !isPaused && count > 1
}

/** The thread after this one, wrapping at the end. */
export function nextThreadIndex(current: number, count: number): number {
  if (count <= 0) {
    return 0
  }

  return (current + 1) % count
}

/**
 * Keep the current index inside the list.
 *
 * The threads are static content today, but an index that outlived a shorter
 * list would leave the track with nothing marked current and no way back.
 */
export function clampThreadIndex(index: number, count: number): number {
  if (count <= 0) {
    return 0
  }

  if (index < 0) {
    return 0
  }

  return Math.min(index, count - 1)
}

/** "01", "02", "03" - the position, zero-padded, as the track prints it. */
export function threadOrdinal(index: number): string {
  return String(index + 1).padStart(2, '0')
}

/**
 * The id of the paragraph a thread's control is described by.
 *
 * The control's accessible name is the thread title alone, which keeps it short
 * enough to be useful in a list of controls. The sentence underneath is the
 * detail, linked rather than absorbed, so the name stays a name.
 */
export function threadDetailId(index: number): string {
  return `about-thread-${threadOrdinal(index)}-detail`
}

export interface ThreadStateOutput {
  readonly isActive: boolean
  /** Colour role for the title. Luminance, not hue, carries the emphasis. */
  readonly titleColor: 'text.primary' | 'text.secondary'
  /** Colour role for the ordinal and label. */
  readonly labelColor: 'action.primary' | 'text.muted'
  /** What the thread's control reports to assistive technology. */
  readonly ariaPressed: boolean
}

/**
 * What a thread looks like, and what its control announces.
 *
 * Every thread's label, title and description stays on the page at every
 * moment, so the emphasis is a luminance step rather than a disclosure. The
 * selection is still real: it is what the ambient scene reads, which is why the
 * control is a pressable button with a state to report rather than decoration.
 */
export function threadState(index: number, activeIndex: number): ThreadStateOutput {
  const isActive = index === activeIndex

  return {
    isActive,
    titleColor: isActive ? 'text.primary' : 'text.secondary',
    labelColor: isActive ? 'action.primary' : 'text.muted',
    ariaPressed: isActive,
  }
}

/* -------------------------------------------------------------------------- */
/* The ambient scene                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Where the pointer is inside the hero, normalised.
 *
 * `-1` is the left or top edge, `1` the right or bottom, `0` the centre. The
 * scene works in this space rather than in pixels so that the same travel
 * distances apply at 375px and at 1440px.
 */
export interface PointerPosition {
  readonly x: number
  readonly y: number
}

/** Rest position. Also where the scene returns to when the pointer leaves. */
export const POINTER_CENTRE: PointerPosition = { x: 0, y: 0 }

export interface PointerBox {
  readonly left: number
  readonly top: number
  readonly width: number
  readonly height: number
}

const clampUnit = (value: number): number => Math.min(1, Math.max(-1, value))

/**
 * Normalise a client position inside a box.
 *
 * Clamped, because a pointer can be reported just outside the box it entered
 * (sub-pixel rounding, a fast exit) and an unclamped value would throw the glow
 * further than any position on screen ever could.
 *
 * A zero-width or zero-height box - an element that has not been laid out yet -
 * answers the centre instead of dividing by zero.
 */
export function pointerPositionIn(
  box: PointerBox,
  clientX: number,
  clientY: number,
): PointerPosition {
  if (box.width <= 0 || box.height <= 0) {
    return POINTER_CENTRE
  }

  return {
    x: clampUnit(((clientX - box.left) / box.width - 0.5) * 2),
    y: clampUnit(((clientY - box.top) / box.height - 0.5) * 2),
  }
}

/**
 * Parallax travel, derived from the reveal distance rather than invented. The
 * glow pools sit furthest back and travel twice the reveal distance; the wash
 * in front of them travels one, which is what reads as depth.
 */
const REVEAL_DISTANCE_PX = parseLengthPx(transform.revealDistance)
const GLOW_TRAVEL_PX = REVEAL_DISTANCE_PX * 2
const WASH_TRAVEL_PX = REVEAL_DISTANCE_PX

export interface AmbientLayer {
  /** Opacity at rest for this thread. */
  readonly opacity: number
  /** Scale at rest for this thread. 1 means the layer does not breathe. */
  readonly scale: number
}

export interface AmbientSweep {
  /** Whether the pass of light is looping. */
  readonly isRunning: boolean
  /** Peak opacity of the pass. */
  readonly opacity: number
  /** Seconds, because that is the unit the animation library works in. */
  readonly travelSeconds: number
  readonly restSeconds: number
}

const MS_PER_SECOND = 1000

const sweepPacing = {
  travelSeconds: SWEEP_TRAVEL_MS / MS_PER_SECOND,
  restSeconds: SWEEP_REST_MS / MS_PER_SECOND,
} as const

export interface AmbientTravel {
  /** How far the glow pools follow the pointer, in px at full deflection. */
  readonly glowPx: number
  /** How far the foreground wash follows it. */
  readonly washPx: number
}

export interface AmbientSceneInput {
  /** Which thread the reader has selected. */
  readonly threadIndex: number
  readonly threadCount: number
  /** `MotionPolicy.ambient`: looping decorative movement is permitted. */
  readonly allowsAmbient: boolean
  /** `MotionPolicy.pointerFollowing`: the scene may track the cursor. */
  readonly allowsPointerFollowing: boolean
  /** The reader is interacting with the track right now. */
  readonly isHeld: boolean
}

export interface AmbientSceneOutput {
  readonly glow: AmbientLayer
  readonly accentGlow: AmbientLayer
  readonly sweep: AmbientSweep
  readonly travel: AmbientTravel
  /**
   * Nothing in the scene moves: no parallax, no sweep, no scale change, and no
   * difference between one thread and the next. The scene is a still picture.
   */
  readonly isStill: boolean
}

/**
 * How each thread colours the scene.
 *
 * Selecting a thread trades one pool against the other and dims the pass of
 * light, so the change is visible without anything jumping: opacity and scale
 * only, both outside layout.
 */
const threadProfiles = [
  { glow: { opacity: 0.76, scale: 1.06 }, accentGlow: { opacity: 0.34, scale: 1.02 }, sweep: 0.48 },
  { glow: { opacity: 0.62, scale: 0.98 }, accentGlow: { opacity: 0.46, scale: 1.08 }, sweep: 0.38 },
  { glow: { opacity: 0.54, scale: 0.94 }, accentGlow: { opacity: 0.58, scale: 1.12 }, sweep: 0.34 },
] as const

/**
 * The scene with the movement taken out: both pools at a mid opacity, neither
 * scaled, no sweep. It is what a reader who asked for reduced motion sees, and
 * it is the same picture for every thread.
 */
const stillProfile = {
  glow: { opacity: 0.6, scale: 1 },
  accentGlow: { opacity: 0.4, scale: 1 },
} as const

/**
 * The ambient scene for the current thread and the current motion policy.
 *
 * Two rules from `DESIGN.md` are enforced here rather than in the component:
 *
 * - **It stops under reduced motion.** With ambient movement disallowed the
 *   answer is `isStill`, every travel distance is zero, every scale is 1, the
 *   sweep is off, and the result no longer depends on which thread is selected.
 *   There is nothing left for the component to animate.
 * - **It pauses on interaction.** While the reader is holding the track the
 *   sweep stops looping. The pools keep the selected thread's appearance,
 *   because that appearance is the answer to what the reader just pressed.
 *
 * Pointer following is asked separately from ambient movement. They are both
 * off under reduced motion, but one is a loop the page runs by itself and the
 * other is a response to the reader, and conflating them would mean a held
 * track froze the cursor response too.
 */
export function ambientScene({
  threadIndex,
  threadCount,
  allowsAmbient,
  allowsPointerFollowing,
  isHeld,
}: AmbientSceneInput): AmbientSceneOutput {
  if (!allowsAmbient) {
    return {
      glow: stillProfile.glow,
      accentGlow: stillProfile.accentGlow,
      sweep: { isRunning: false, opacity: 0, ...sweepPacing },
      travel: { glowPx: 0, washPx: 0 },
      isStill: true,
    }
  }

  const profile = threadProfiles[clampThreadIndex(threadIndex, threadCount) % threadProfiles.length]

  return {
    glow: profile.glow,
    accentGlow: profile.accentGlow,
    sweep: { isRunning: !isHeld, opacity: profile.sweep, ...sweepPacing },
    travel: {
      glowPx: allowsPointerFollowing ? GLOW_TRAVEL_PX : 0,
      washPx: allowsPointerFollowing ? WASH_TRAVEL_PX : 0,
    },
    isStill: false,
  }
}

/**
 * Framer's spring for the pointer response.
 *
 * Physics, not design values: nothing here is a duration, a distance or a
 * colour, so none of it belongs in the token source. It lives beside the scene
 * so the component stays free of loose numbers.
 */
export const POINTER_SPRING = { stiffness: 120, damping: 24, mass: 0.75 } as const

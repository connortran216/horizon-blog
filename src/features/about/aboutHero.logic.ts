/**
 * The About hero's editorial track and the field behind it - the decisions,
 * without the DOM.
 *
 * The hero shows three threads. Each one is a control the reader can press, and
 * the pressed thread drives both the emphasis in the track and where the synapse
 * field behind the copy leans: each thread is a place on the plate, and the
 * network gathers towards the current one and sends its signals there. Which
 * thread is current, what its control reports and where it sits on the field are
 * all answered here so they can be tested without rendering.
 *
 * The millisecond values below are dwell times, not motion durations. The motion
 * token scale stops at 480ms because that is the longest a transition may take;
 * how long a thread stays current is a reading-pace decision with no token, so
 * it is named here rather than inlined.
 */

/*
 * Imported from the motion module directly rather than through the design
 * system barrel: this file is pure and its test must stay free of React, and
 * the barrel pulls in every component in the system.
 */
import type { UnitPoint } from '../../design-system/motion/synapse.logic'

/** How long a thread stays current before the track advances by itself. */
export const AUTO_ADVANCE_MS = 4600

/** How long the track stays put after the reader chooses a thread. */
export const USER_PAUSE_MS = 5200

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
/* The field                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Where each thread sits on the hero's field, in the plate's unit space. All
 * three are in the open right-hand part of the plate, beside the copy rather
 * than under it, and far enough apart that moving between them reads as the
 * network leaning somewhere new: Build high, Write out towards the edge, Shape
 * low - the order the track reads in, as a path down the plate.
 */
export const THREAD_FOCUS: readonly UnitPoint[] = [
  { x: 0.8, y: 0.26 },
  { x: 0.9, y: 0.5 },
  { x: 0.78, y: 0.74 },
]

/**
 * The field's focus for the current thread. Threads beyond the three places
 * reuse them in turn, so a longer track still leans somewhere real; an empty
 * track has no focus.
 */
export function threadFocus(index: number, count: number): UnitPoint | null {
  if (count <= 0) {
    return null
  }

  return THREAD_FOCUS[clampThreadIndex(index, count) % THREAD_FOCUS.length]
}

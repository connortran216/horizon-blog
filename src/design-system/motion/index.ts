/**
 * Horizon Design System v2 - motion barrel.
 *
 * The motion contract: primitives here, policy in `policy.logic.ts`, lifecycle
 * in `lifecycle.logic.ts`. A component that animates asks `useMotionPolicy` and
 * registers every subscription through a disposer bag; it does not read
 * `prefers-reduced-motion` and it does not call `setTimeout` inline.
 */

export { HoverLift } from './HoverLift'
export type { HoverLiftProps } from './HoverLift'

export { LayoutTransition } from './LayoutTransition'
export type { LayoutTransitionProps } from './LayoutTransition'

export { PressFeedback } from './PressFeedback'
export type { PressFeedbackProps } from './PressFeedback'

export { Reveal } from './Reveal'
export type { RevealProps } from './Reveal'

export { Stagger } from './Stagger'
export type { StaggerProps } from './Stagger'

export { useMotionPolicy, useReducedMotionPreference } from './useMotionPolicy'
export { useRevealInView } from './useRevealInView'
export type { RevealInViewOptions } from './useRevealInView'
export { useViewTransition } from './useViewTransition'

export {
  ambientAllowed,
  cubicBezierPoints,
  durationSeconds,
  fullMotionPolicy,
  hoverLiftOffset,
  hoverLiftProps,
  loadingCycle,
  loadingCycleMs,
  motionPolicyFor,
  parseDurationMs,
  parseLengthPx,
  pressFeedbackProps,
  readReducedMotion,
  reducedMotionPolicy,
  revealOffset,
  revealVariants,
  spinnerSpeed,
  staggerDelays,
  standardEase,
  subscribeReducedMotion,
  transitionFor,
} from './policy.logic'
export type {
  CubicBezierPoints,
  Disposer,
  MatchMediaLike,
  MediaQueryLike,
  MotionPolicy,
  MotionSurface,
  MotionTransition,
  RevealTarget,
  RevealVariants,
  StaggerInput,
} from './policy.logic'

export {
  createDisposerBag,
  guardAsync,
  observeOnce,
  scheduleFrame,
  scheduleTimer,
} from './lifecycle.logic'
export type {
  DisposerBag,
  FrameScheduler,
  IntersectionEntryLike,
  IntersectionObserverFactory,
  IntersectionObserverLike,
  ObserveOnceInput,
  TimerScheduler,
} from './lifecycle.logic'

export { loadingPulse, loadingPulseAnimation } from './loadingPulse'

export { isPlainRouterClick, startViewTransition } from './viewTransition.logic'
export type {
  RouterClickLike,
  StartViewTransitionInput,
  ViewTransitionDocumentLike,
  ViewTransitionLike,
  ViewTransitionResult,
} from './viewTransition.logic'

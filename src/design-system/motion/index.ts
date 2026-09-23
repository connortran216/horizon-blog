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

export { InteractionTrace } from './InteractionTrace'
export type { InteractionTraceProps } from './InteractionTrace'

export { MarginalNote } from './MarginalNote'
export type { MarginalNoteProps } from './MarginalNote'

export { PointerLight } from './PointerLight'
export type { PointerLightProps } from './PointerLight'

export { PressFeedback } from './PressFeedback'
export type { PressFeedbackProps } from './PressFeedback'

export { Reveal } from './Reveal'
export type { RevealProps } from './Reveal'

export { SignalTarget } from './SignalTarget'
export type { SignalTargetProps } from './SignalTarget'

export { Stagger } from './Stagger'
export type { StaggerProps } from './Stagger'

export { StateHandoff } from './StateHandoff'
export type { StateHandoffProps } from './StateHandoff'

export { COPY_MARKER, SynapseField } from './SynapseField'
export type { SynapseFieldProps } from './SynapseField'

export { TimelineEntry } from './TimelineEntry'
export type { TimelineEntryProps } from './TimelineEntry'

export { Typeset } from './Typeset'
export type { TypesetProps } from './Typeset'

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

export {
  DEFAULT_VEIL,
  NO_VEIL,
  SYNAPSE,
  anchorHitRate,
  bezierPoint,
  chooseLink,
  createNodes,
  createRng,
  curveControl,
  decayExcitation,
  distanceToRect,
  easeInOut,
  exciteNear,
  fieldAwake,
  fieldInk,
  fieldOpacity,
  linkNodes,
  nearestNodeTo,
  parseColorChannels,
  rgba,
  sentenceWrittenAt,
  signalRate,
  smoothstep,
  stepNodes,
  stirredUntil,
  synapseScene,
  synapseTiming,
  veilNear,
} from './synapse.logic'
export type {
  ChooseLinkOptions,
  FieldInk,
  FieldTheme,
  PixelPoint,
  PixelRect,
  RgbChannels,
  Rng,
  SignalRoute,
  SynapseLink,
  SynapseNode,
  SynapseScene,
  SynapseTiming,
  UnitPoint,
  Veil,
} from './synapse.logic'

export {
  LIGHT_REST,
  LIGHT_SPRING,
  finePointerQuery,
  lightPositionIn,
  pointerLightState,
  readFinePointer,
  subscribeFinePointer,
} from './pointerLight.logic'
export type {
  LightPosition,
  PointerBox,
  PointerLightState,
  PointerLightStateInput,
} from './pointerLight.logic'

export { runThemeSweep, themeSweepKeyframes } from './themeSweep.logic'
export type { RunThemeSweepInput, SweepDocumentLike, SweepRootLike } from './themeSweep.logic'

export {
  typesetClip,
  typesetDelays,
  typesetEmphasis,
  typesetRule,
  typesetRuleDelays,
  typesetVariants,
  typesetWords,
} from './typeset.logic'
export type { TypesetTarget, TypesetVariants, TypesetWord } from './typeset.logic'

export { isPlainRouterClick, startViewTransition } from './viewTransition.logic'
export type {
  RouterClickLike,
  StartViewTransitionInput,
  ViewTransitionDocumentLike,
  ViewTransitionLike,
  ViewTransitionResult,
} from './viewTransition.logic'

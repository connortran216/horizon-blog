/**
 * Horizon Design System v2 - public surface.
 *
 * Everything the system offers is re-exported here, grouped the way
 * `DESIGN.md` groups it: shared primitives first, then the cross-cutting motion
 * and state contracts.
 *
 * Nothing under `src/features/**` or `src/pages/**` may import from this file
 * yet. Production keeps its current composition and its current appearance
 * until the migration gate `horizon-blog-dsv2.7.3` passes; see
 * `CONVENTIONS.md`.
 *
 * Components mount under `horizonTheme` (`src/theme/horizon.ts`), not the legacy
 * theme that production still uses.
 */

// Layout and structure
export * from './components/layout'

// Surfaces and separation
export * from './components/surface'

// Typography
export * from './components/typography'

// Actions
export * from './components/actions'

// Navigation
export * from './components/navigation'

// Forms and selection
export * from './components/forms'

// Status indicators
export * from './components/status'

// Motion contract and primitives
export * from './motion'

// Loading, empty, error and permission states
export * from './components/feedback'

// Media and its state machine
export * from './components/media'

/*
 * Domain patterns. Primitives above own behaviour; the patterns below own
 * content hierarchy and identity, and compose the primitives to get there.
 */

// Post discovery and metadata
export * from './patterns/posts'

// Series discovery and reading
export * from './patterns/series'

// Reader, prose and conversation
export * from './patterns/reader'

// Account and identity
export * from './patterns/account'

// Editor and publishing workspace
export * from './patterns/editor'

// Analytics, tables and administration
export * from './patterns/data'

# horizon-blog-dsv2.4.1: Build the shared motion contract and primitives

## Goal

Replace ad hoc animation behavior with typed motion primitives and one reduced-motion policy.

## Source requirements

- Approved Signal prototype and behavioral-system decisions.
- Current source inventory and repository design-system guidance.
- Epic rule: complete the component system before production page migration.

## Dependencies

`horizon-blog-dsv2.2.2`

## Constraints

- Preserve React 18, TypeScript, Vite, Chakra UI, routing, API, auth, editor, and feature boundaries.
- No new production dependencies without explicit owner approval.
- Support paired themes, responsive layouts, keyboard/touch, and reduced motion.

## Non-goals

- Production page composition replacement.
- Backend or domain-contract changes.

## Acceptance criteria

1. No infinite decorative animation in reading surfaces.
2. Reduced motion removes translation and ambient movement.
3. Timers, observers, and animation frames clean up.

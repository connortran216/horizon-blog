# horizon-blog-dsv2.3.1: Build layout, typography and surface primitives

## Goal

Provide structural primitives that carry tokens without imposing a universal card identity.

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

1. Breakpoints match the approved 680/1000 transitions.
2. Surfaces define depth roles rather than hardcoded shadows.
3. Semantic HTML remains available through component APIs.

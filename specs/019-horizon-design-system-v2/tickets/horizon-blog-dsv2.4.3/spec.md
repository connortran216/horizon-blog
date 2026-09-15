# horizon-blog-dsv2.4.3: Build resilient media primitives

## Goal

Make media loading, absence, failure, retry, aspect ratio, and accessibility reusable across product patterns.

## Source requirements

- Approved Signal prototype and behavioral-system decisions.
- Current source inventory and repository design-system guidance.
- Epic rule: complete the component system before production page migration.

## Dependencies

`horizon-blog-dsv2.3.1`, `horizon-blog-dsv2.4.1`

## Constraints

- Preserve React 18, TypeScript, Vite, Chakra UI, routing, API, auth, editor, and feature boundaries.
- No new production dependencies without explicit owner approval.
- Support paired themes, responsive layouts, keyboard/touch, and reduced motion.

## Non-goals

- Production page composition replacement.
- Backend or domain-contract changes.

## Acceptance criteria

1. Loading, ready, absent, error, and retry states are covered.
2. Alt and decorative semantics are explicit.
3. Retry can request a fresh signed source.

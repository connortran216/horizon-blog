# horizon-blog-dsv2.1.1: Inventory every legacy component and visual surface

## Goal

Create a complete, reviewable map from every current UI implementation file to its v2 owner and migration disposition.

## Source requirements

- Approved Signal prototype and behavioral-system decisions.
- Current source inventory and repository design-system guidance.
- Epic rule: complete the component system before production page migration.

## Dependencies

None

## Constraints

- Preserve React 18, TypeScript, Vite, Chakra UI, routing, API, auth, editor, and feature boundaries.
- No new production dependencies without explicit owner approval.
- Support paired themes, responsive layouts, keyboard/touch, and reduced motion.

## Non-goals

- Production page composition replacement.
- Backend or domain-contract changes.

## Acceptance criteria

1. No implementation file is unclassified.
2. Inventory count equals source query count.
3. Page-owned surfaces are explicitly deferred rather than omitted.

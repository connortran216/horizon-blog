# horizon-blog-dsv2.5.1: Build post discovery and metadata patterns

## Goal

Create distinct reusable patterns for featured, grid, row, filter, author, and metadata presentation.

## Source requirements

- Approved Signal prototype and behavioral-system decisions.
- Current source inventory and repository design-system guidance.
- Epic rule: complete the component system before production page migration.

## Dependencies

`horizon-blog-dsv2.3`, `horizon-blog-dsv2.4`

## Constraints

- Preserve React 18, TypeScript, Vite, Chakra UI, routing, API, auth, editor, and feature boundaries.
- No new production dependencies without explicit owner approval.
- Support paired themes, responsive layouts, keyboard/touch, and reduced motion.

## Non-goals

- Production page composition replacement.
- Backend or domain-contract changes.

## Acceptance criteria

1. Signature and normal cards remain distinct.
2. Content does not duplicate hierarchy labels.
3. Hover, focus, touch, loading, empty, and error states are visible.

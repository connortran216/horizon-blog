# horizon-blog-dsv2.4.2: Build loading and feedback primitives

## Goal

Represent blocked, progressive, empty, error, denied, missing, offline, and success states consistently.

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

1. No blank async surface.
2. Feedback actions are keyboard accessible.
3. Skeletons and loaders preserve layout and do not compete.

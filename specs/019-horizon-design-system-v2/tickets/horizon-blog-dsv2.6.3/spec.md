# horizon-blog-dsv2.6.3: Build analytics, table and administration patterns

## Goal

Create readable data-display and permission-management patterns for analytics and administration.

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

1. Approximate metrics are labelled.
2. Tables scroll within their container.
3. Permissions and destructive actions retain backend authority.

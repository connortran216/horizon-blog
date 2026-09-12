# horizon-blog-dsv2.6.1: Build account and identity patterns

## Goal

Cover authentication, verification, contact, CV, profile, and avatar presentation without changing identity behavior.

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

1. No auth or OAuth contract changes.
2. External links and print behavior remain correct.
3. Identity surfaces work in paired themes and mobile.

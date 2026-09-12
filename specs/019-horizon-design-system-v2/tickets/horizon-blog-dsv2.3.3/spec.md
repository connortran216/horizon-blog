# horizon-blog-dsv2.3.3: Build form and selection primitives

## Goal

Create accessible field and selection contracts for account and workspace flows.

## Source requirements

- Approved Signal prototype and behavioral-system decisions.
- Current source inventory and repository design-system guidance.
- Epic rule: complete the component system before production page migration.

## Dependencies

`horizon-blog-dsv2.3.1`

## Constraints

- Preserve React 18, TypeScript, Vite, Chakra UI, routing, API, auth, editor, and feature boundaries.
- No new production dependencies without explicit owner approval.
- Support paired themes, responsive layouts, keyboard/touch, and reduced motion.

## Non-goals

- Production page composition replacement.
- Backend or domain-contract changes.

## Acceptance criteria

1. Every field has a programmatic label.
2. Errors are announced and not color-only.
3. Touch targets and contrast meet the design contract.

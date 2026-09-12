# horizon-blog-dsv2.7.2: Audit legacy coverage and compatibility

## Goal

Prove every legacy component has a v2 implementation, retained-behavior decision, compatibility adapter, or explicit deprecation.

## Source requirements

- Approved Signal prototype and behavioral-system decisions.
- Current source inventory and repository design-system guidance.
- Epic rule: complete the component system before production page migration.

## Dependencies

`horizon-blog-dsv2.7.1`

## Constraints

- Preserve React 18, TypeScript, Vite, Chakra UI, routing, API, auth, editor, and feature boundaries.
- No new production dependencies without explicit owner approval.
- Support paired themes, responsive layouts, keyboard/touch, and reduced motion.

## Non-goals

- Production page composition replacement.
- Backend or domain-contract changes.

## Acceptance criteria

1. Coverage command exits zero.
2. No silently custom component remains.
3. Every compatibility alias has an owner and target.

# horizon-blog-dsv2.2.2: Integrate tokens with Chakra and local typography

## Goal

Make Chakra consume v2 tokens while legacy production pages continue rendering without composition changes.

## Source requirements

- Approved Signal prototype and behavioral-system decisions.
- Current source inventory and repository design-system guidance.
- Epic rule: complete the component system before production page migration.

## Dependencies

`horizon-blog-dsv2.2.1`

## Constraints

- Preserve React 18, TypeScript, Vite, Chakra UI, routing, API, auth, editor, and feature boundaries.
- No new production dependencies without explicit owner approval.
- Support paired themes, responsive layouts, keyboard/touch, and reduced motion.

## Non-goals

- Production page composition replacement.
- Backend or domain-contract changes.

## Acceptance criteria

1. Existing pages compile without page edits.
2. Theme tests cover compatibility aliases and paired tokens.
3. Font loading uses local assets and font-display swap.
4. Reduced motion disables theme animation without removing state feedback.

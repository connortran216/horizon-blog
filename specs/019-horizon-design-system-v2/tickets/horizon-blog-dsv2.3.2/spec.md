# horizon-blog-dsv2.3.2: Build action and navigation primitives

## Goal

Create consistent actions and navigation feedback across pointer, keyboard, touch, and motion preferences.

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

1. No interactive divs.
2. Focus remains visible in both themes.
3. Hover transforms never shift layout.
4. Controls do not depend on hover for meaning.

# horizon-blog-dsv2.7.1: Build the complete component gallery

## Goal

Create an isolated local review surface for every v2 primitive and pattern without migrating production pages.

## Source requirements

- Approved Signal prototype and behavioral-system decisions.
- Current source inventory and repository design-system guidance.
- Epic rule: complete the component system before production page migration.

## Dependencies

`horizon-blog-dsv2.5`, `horizon-blog-dsv2.6`

## Constraints

- Preserve React 18, TypeScript, Vite, Chakra UI, routing, API, auth, editor, and feature boundaries.
- No new production dependencies without explicit owner approval.
- Support paired themes, responsive layouts, keyboard/touch, and reduced motion.

## Non-goals

- Production page composition replacement.
- Backend or domain-contract changes.

## Acceptance criteria

1. Every implemented v2 export appears in the gallery.
2. Gallery works without backend state.
3. Production routes retain legacy composition.

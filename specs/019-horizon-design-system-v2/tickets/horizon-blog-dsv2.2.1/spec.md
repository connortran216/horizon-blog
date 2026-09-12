# horizon-blog-dsv2.2.1: Implement typed v2 token source

## Goal

Create typed primitive, semantic, motion, typography, layout, elevation, and component token modules.

## Source requirements

- Approved Signal prototype and behavioral-system decisions.
- Current source inventory and repository design-system guidance.
- Epic rule: complete the component system before production page migration.

## Dependencies

`horizon-blog-dsv2.1.1`, `horizon-blog-dsv2.1.2`

## Constraints

- Preserve React 18, TypeScript, Vite, Chakra UI, routing, API, auth, editor, and feature boundaries.
- No new production dependencies without explicit owner approval.
- Support paired themes, responsive layouts, keyboard/touch, and reduced motion.

## Non-goals

- Production page composition replacement.
- Backend or domain-contract changes.

## Acceptance criteria

1. TypeScript rejects unknown token names.
2. Light and dark semantic roles are paired.
3. No page-specific token is introduced.
4. Contrast-critical pairs retain approved values.

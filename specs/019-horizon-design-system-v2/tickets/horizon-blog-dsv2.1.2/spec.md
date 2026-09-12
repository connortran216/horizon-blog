# horizon-blog-dsv2.1.2: Publish the Horizon v2 design contract

## Goal

Make the approved Signal direction and component-first migration policy the repository design source of truth.

## Source requirements

- Approved Signal prototype and behavioral-system decisions.
- Current source inventory and repository design-system guidance.
- Epic rule: complete the component system before production page migration.

## Dependencies

None

## Constraints

- Preserve React 18, TypeScript, Vite, Chakra UI, routing, API, auth, editor, and feature boundaries.
- No new production dependencies without explicit owner approval.
- Support paired themes, responsive layouts, keyboard/touch, and reduced motion.

## Non-goals

- Production page composition replacement.
- Backend or domain-contract changes.

## Acceptance criteria

1. DESIGN.md contains every required design-workflow section.
2. Approved light/dark and motion requirements are explicit.
3. Existing service, auth, editor, and route contracts remain non-goals for redesign.

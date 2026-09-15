# horizon-blog-dsv2.5.3: Build reader, prose and conversation patterns

## Goal

Cover long-form reading, code, diagrams, navigation, feedback, reactions, sharing, and threaded discussion.

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

1. Code and tables scroll locally.
2. TOC and progress remain accessible.
3. Reader feedback does not move into opening metadata.

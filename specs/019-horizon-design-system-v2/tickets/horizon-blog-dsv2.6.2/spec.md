# horizon-blog-dsv2.6.2: Build editor and publishing workspace patterns

## Goal

Provide dense authoring patterns for editing, metadata, media, preview, draft recovery, publication, and scheduling.

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

1. Scheduled publication remains a draft timestamp.
2. No editor library replacement.
3. Critical state is never communicated by motion or color alone.

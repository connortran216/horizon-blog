# Horizon Design System v2

## Goal

Build a production-grade component system for every current Horizon frontend visual surface before replacing any production page composition.

## Sources

- User direction on 2026-09-10: cover all legacy components with the new system before page replacement.
- Approved Signal prototype in `../prototypes/horizon-uiux` and Beads memories `horizon-design-system-v0.2`, `horizon-prototype-approved-2026-09-06`, and `horizon-signal-behavioral-system-v1`.
- Current production tree at merge commit `536c262` after full R1/R3 rollback.
- `AGENTS.md`, `docs/agent-guides/workflow.md`, `docs/agent-guides/design-system.md`, and `.specify/memory/constitution.md`.

## Scope

- Durable design source of truth and complete legacy inventory.
- Typed primitive, semantic, motion, layout, elevation, and component tokens.
- Chakra integration with temporary compatibility aliases.
- Shared structural, control, form, motion, feedback, and media primitives.
- Editorial, Series, reader, conversation, account, editor, analytics, and administration patterns.
- Isolated component gallery and measurable coverage gate.

## Non-goals

- Replacing the composition or visual presentation of production routes during this Epic.
- Changing backend APIs, authentication, authorization, scheduling, media storage, editor libraries, routing contracts, or content.
- Adding a production dependency without separate owner approval.
- Reusing one universal card for every domain surface.

## Acceptance criteria

1. Every legacy component and page-owned visual surface is inventoried and assigned a disposition and owner.
2. The approved Signal foundation is implemented through typed tokens and Chakra without requiring page edits.
3. Every v2 component defines paired themes, responsive behavior, accessibility, interaction, reduced-motion, and applicable async/media states.
4. Domain patterns retain distinct identities while consuming shared primitives.
5. An isolated component gallery covers all v2 exports with production-shaped fixtures.
6. Automated coverage reports zero missing or unowned legacy mappings.
7. The existing page-migration Epic stays blocked until the readiness gate passes.

## Dependency order

`B0 -> B1 -> (B2 + B3) -> (B4 + B5) -> B6 -> page migration`

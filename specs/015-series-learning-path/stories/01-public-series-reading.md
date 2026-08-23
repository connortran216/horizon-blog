# Story 01: Public Series Reading

**Project**: Horizon Blog Frontend
**Service**: Series feature
**Dependencies**: Backend public series contract
**Blockers**: None after typed adapter/service foundation

## Context

Readers need a calm ordered Series and Series-aware article navigation without losing the existing reader experience.

## Acceptance Criteria

- Public Series route renders its editorial header, total reading metadata, topics, and ordered parts with excerpt and read time.
- Member blogs show series position and adjacent navigation.
- Context failure never blocks article content.
- Public Series UI shows no opened/completion state.
- Mobile, keyboard, light/dark, and reduced-motion behavior follow the design system.

## Definition of Done

- Mapping, page, ordered-part, and reader fallback tests pass.
- Existing public blog tests remain green.

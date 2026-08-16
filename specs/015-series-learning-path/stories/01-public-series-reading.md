# Story 01: Public Series Reading

**Project**: Horizon Blog Frontend
**Service**: Series feature
**Dependencies**: Backend public series contract
**Blockers**: None after typed adapter/service foundation

## Context

Readers need a calm ordered roadmap and series-aware article navigation without losing the existing reader experience.

## Acceptance Criteria

- Public series route renders ordered parts and local opened progress.
- Member blogs show series position and adjacent navigation.
- Context failure never blocks article content.
- Mobile, keyboard, light/dark, and reduced-motion behavior follow the design system.

## Definition of Done

- Mapping, progress, page, and reader fallback tests pass.
- Existing public blog tests remain green.

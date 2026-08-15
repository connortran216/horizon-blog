# Story 03: Bounded Errors, Media, and Engagement

**Project**: Horizon Blog Frontend
**Service**: Shared API, media, analytics, reactions
**Dependencies**: Backend policy/error/cookie compatibility
**Blockers**: None after contract approval

## Context

The client must not loop on abuse responses, upload new SVG, or select anonymous actor IDs.

## Acceptance Criteria

- `429`/`413` and security errors are status-aware and non-replaying.
- JPEG/PNG upload remains; SVG selection is denied.
- Existing media rendering is unchanged.
- Analytics/reactions send no visitor ID.

## Verify and Pass

- Adapter/component tests prove payload and retry behavior.
- Existing editor, reader, interaction, and auth regressions pass.

## Definition of Done

Client behavior matches the hardened contract and staging smoke evidence is recorded.

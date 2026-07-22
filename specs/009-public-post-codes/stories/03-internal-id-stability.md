# Story 03: Internal ID Stability

**Project**: Horizon Blog frontend
**Service**: Existing API, analytics, profile, media, and reader-interaction flows
**Dependencies**: Stories 01 and 02
**Blockers**: Public route decoding must complete before service calls

## Context

Opaque reader URLs are a presentation contract only. Numeric identifiers must remain intact at API and protected-flow boundaries to avoid an unnecessary backend migration.

## Acceptance Criteria

- Public detail retrieval calls the existing service with a decimal ID.
  - **Verify**: Inspect the hook test spy.
  - **Pass**: The service receives the decoded decimal string.
- Related-post, interaction, media-image, analytics, and profile identifiers remain numeric.
  - **Verify**: Run targeted searches and existing tests after implementation.
  - **Pass**: No protected or backend route contract is encoded.
- The production application still builds.
  - **Verify**: Run type check, lint, and build.
  - **Pass**: All commands succeed without API contract changes.

## Technical Approach

Encode at public URL output boundaries and decode at the public reader input boundary. Do not let public codes cross repository or backend service contracts.

## Non-Goals

- Removing numeric IDs from response bodies or browser developer tools.
- Treating the codec as access control.

## Definition of Done

- Existing numeric contracts are unchanged.
- Validation passes and the scoped diff contains no backend changes.

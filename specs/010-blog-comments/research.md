# Research: Blog Comments Frontend

## Decision: Add one optional discussion slot to the reader frame

**Rationale**: `BlogReaderFrame` already composes reader-only sections. A `discussionSection` rendered after interactions keeps route orchestration thin and prevents the comments feature from changing the reader paradigm.

**Alternatives considered**:

- Place comments in the related-blog rail: rejected because discussion is part of the article flow.
- Build a new reader page: rejected because it duplicates established behavior.

## Decision: Use a feature-local repository, service, hook, and components

**Rationale**: This follows `apiService -> repository -> service -> hook/page -> component` without inflating the core blog service. Exact transport shapes remain in the repository; mapping and validation stay in the service.

**Alternatives considered**:

- Call `apiService` from components: rejected because it mixes transport with rendering.
- Add comments to the monolithic blog repository: rejected because comments have distinct mutations and nested pagination.

## Decision: Trust capability flags, not public account IDs

**Rationale**: Backend flags keep authorization authoritative and allow public DTOs to omit internal IDs.

## Decision: Load direct replies on demand

**Rationale**: Each comment owns a small cursor state for its direct children. This supports two reply levels without unbounded initial payloads.

## Decision: Apply mutations only after success

**Rationale**: Non-optimistic create/edit/remove keeps failure rollback simple and honors the requirement that failed mutations leave the discussion unchanged. Buttons still prevent duplicate in-flight submissions.

## Decision: Reuse login return state

**Rationale**: Existing login, registration, and Google flows honor `location.state.from`. The CTA passes the current path, query, and `#comments`.

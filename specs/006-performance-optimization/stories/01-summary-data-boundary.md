# Story 01: Add the Summary Data Boundary

**Dependencies**: Backend summary Swagger contract
**Owns**: core API types, repository, service interfaces and mapping

## Acceptance Criteria

- Summary responses map directly to `BlogPostSummary`.
- No markdown-derived computation runs for summary items.
- Full-post, search, authoring, and profile methods remain unchanged.
- Cache keys do not collide between full and summary responses.

## Validation

- Contract tests cover optional fields, pagination, endpoint selection, and mapping.
- Existing repository/service tests remain green.

## Definition of Done

- [x] T001-T007 complete.
- [x] Focused repository/type tests pass.
- [x] Commit and validation recorded in `checklist.md`.

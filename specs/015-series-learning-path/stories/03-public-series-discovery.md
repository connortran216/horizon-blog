# Story 03: Public Series Discovery

**Project**: Horizon Blog Frontend
**Service**: Series feature
**Dependencies**: Backend public Series summary and blog-summary context contracts
**Blockers**: Public list contract must be available before page integration

## Context

Readers need to discover Series beside normal chronological writing without turning Horizon into a course catalogue or changing the global navbar.

## Acceptance Criteria

- Home preserves its hero and places a two-item Series shelf before Recent Blogs.
- The default unfiltered first Blog page places the compact shelf before results and hides it for search, tag filters, or later pages.
- `View all series` opens `/series`, which shows a featured Series and paginated all-Series grid.
- Series-member blog cards add light `Series title / Part X of Y` context; standalone cards remain unchanged.
- Empty or failed discovery requests never block normal blog content.

## Definition of Done

- List mapping, hook, shelf, route, page-composition, and card-context tests pass.
- Keyboard, responsive, empty, failure, and retry states match the approved screen inventory.

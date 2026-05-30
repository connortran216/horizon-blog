# Feature Specification: Query Nine Posts

**Feature Branch**: `main`
**Created**: 2026-05-30
**Status**: Ready for planning
**Input**: Update the frontend published-post queries to request 9 posts, an odd number, instead of 6.

## User Scenarios & Testing

### User Story 1 - See an odd-sized post set (Priority: P1)

As a reader or profile owner viewing post lists, I want frontend post requests to load 9 items per page or section so that the UI can present an odd-sized collection instead of the previous 6-item collection.

**Why this priority**: Public and profile post surfaces currently request 6 items. The requested product behavior is to use 9 consistently.

**Independent Test**: Inspect the frontend request and pagination sources and confirm published/home/archive/profile post limits are 9, with no remaining request/page-size limit of 6.

**Acceptance Scenarios**:

1. **Given** the home page loads published posts, **When** it calls the blog service, **Then** the request limit is 9.
2. **Given** the blog archive loads posts, **When** pagination is initialized, **Then** the archive page size is 9.
3. **Given** profile post pagination is initialized, **When** published and draft lists load, **Then** both page sizes are 9.
4. **Given** the blog archive is loading, **When** placeholders render, **Then** the loading count matches the 9-item page size.

## Requirements

### Functional Requirements

- **FR-001**: Home page published-post loading MUST request 9 posts.
- **FR-002**: Blog archive pagination MUST use a page size of 9.
- **FR-003**: Profile published and draft post pagination MUST use a page size of 9.
- **FR-004**: Blog archive loading placeholders SHOULD match the 9-item page size.
- **FR-005**: The change MUST NOT alter backend endpoints, response shapes, or filtering behavior.

### Key Entities

- **Post query limit**: The number passed to frontend services or pagination state when requesting post summaries.
- **Post list surface**: A UI surface that renders a collection of posts, including home, archive, and profile lists.

## Success Criteria

- **SC-001**: A source search finds the relevant frontend post request and pagination limits set to 9.
- **SC-002**: A source search finds no relevant frontend request/page-size post limits still set to 6.
- **SC-003**: Frontend lint passes with the repo-compatible Node runtime.

## Assumptions

- This is frontend-only; the backend already accepts `limit=9`.
- Existing pagination and total-count behavior remains valid with the larger page size.
- The profile draft limit should match the published profile limit for consistency.

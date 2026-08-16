# Feature Specification: Series Learning Paths

**Feature Branch**: `agent/series-learning-path`
**Created**: 2026-08-15
**Status**: Approved for implementation
**Counterpart**: `horizon-blog-be/specs/010-series-learning-path/spec.md`

## User Scenarios & Testing

### User Story 1 - Follow a learning path (Priority: P1)

A reader can open a public series, scan its purpose and ordered blogs, continue from the last blog opened on that browser, and move between adjacent published parts from the reader page.

**Independent Test**: Given a public series, a reader can open any part, see `Part X of Y`, navigate previous or next, return to the series page, and see that part reflected in local progress without signing in.

### User Story 2 - Manage an owned series (Priority: P1)

An authorized author can create, rename, describe, delete, and reorder an owned series, and can choose at most one series for a blog during the publication review flow.

**Independent Test**: Given owned blogs and series, the author can save a gap-free order, move a blog to another series only after the backend accepts the new membership, and remove a blog from its series.

### User Story 3 - Recover gracefully (Priority: P2)

Reading a blog remains fully usable when series data is absent or temporarily unavailable, and author changes show clear retryable failures without losing the last confirmed server state.

**Independent Test**: With the series endpoint unavailable, the public blog still renders; with an owner mutation failure, the management view keeps the confirmed order and displays a useful error.

## Requirements

### Functional Requirements

- **FR-001**: The application MUST provide a public route for a series identified by its backend-provided slug.
- **FR-002**: The public series page MUST show its title, description when present, author, visible blog count, ordered published blogs, and local progress.
- **FR-003**: Opening a published blog in a series MUST mark that blog as visited in first-party browser storage without requiring authentication.
- **FR-004**: Local progress MUST be scoped by stable series and blog identifiers and MUST tolerate unavailable or malformed stored data.
- **FR-005**: The blog reader MUST show series title, `Part X of Y`, a link to the series page, and available previous/next navigation.
- **FR-006**: Series UI MUST NOT block article rendering, interactions, comments, related blogs, or normal back navigation when series context is absent or fails.
- **FR-007**: Authorized authors MUST have a protected series-management route that lists their series and supports create, update, delete, membership selection, and explicit ordering.
- **FR-008**: Author controls MUST use backend-provided ownership and status data and MUST NOT infer authorization from route state or token claims.
- **FR-009**: Publication review MUST let an author choose zero or one existing owned series for the current blog.
- **FR-010**: Saving membership from publication review MUST use the approved series API and show a retryable error when membership fails.
- **FR-011**: Public UI MUST use `blog`, `blogs`, `series`, `part`, `read`, and `continue`; it MUST avoid course-platform or dashboard-heavy language.
- **FR-012**: Controls MUST be keyboard accessible, provide visible focus, preserve contrast in light and dark modes, and not rely on color alone.
- **FR-013**: Reader surfaces MUST remain calm and nearly static; new motion, if any, MUST respect reduced-motion preferences.
- **FR-014**: Existing public blog, editor, publishing, comments, analytics, and related-blog behavior MUST remain available.

### Key Entities

- **Series**: Public or owner view of an ordered learning path.
- **Series Part**: A blog summary with its projected position and status where authorized.
- **Local Series Progress**: Browser-local visited blog identifiers for one series.

## Success Criteria

- **SC-001**: A reader can move from one published part to the next in one action.
- **SC-002**: A reader can identify series position and progress within five seconds of opening a series or member blog.
- **SC-003**: The series page remains usable at 375px, 768px, 1024px, and 1440px widths without horizontal overflow.
- **SC-004**: Keyboard users can reach every series navigation and author-management action with visible focus.
- **SC-005**: A series API failure never prevents the main blog article from rendering.
- **SC-006**: Frontend tests cover public mapping, local progress recovery, reader fallback, and owner mutation behavior.

## Edge Cases

- A series contains only one published blog.
- A visited blog is later removed from the series.
- Stored progress is invalid JSON or belongs to an older membership list.
- Previous or next entries are absent.
- The selected series is deleted in another tab before save.
- A blog moves from one series to another.
- An author has no series or no unassigned blogs.

## Assumptions

- Each blog belongs to zero or one series in this MVP.
- Progress means blogs opened on the current browser, not verified completion.
- Series creation and ordering live on a dedicated protected route; publication review only selects membership.
- Slugs and all public identifiers come from the backend.
- The existing Horizon semantic tokens, typography, spacing, and feature-first architecture remain authoritative.

## Non-Goals

- Account-synced progress or cross-device resume.
- Multiple series per blog.
- Subscriptions, notifications, quizzes, certificates, or paid enrollment.
- Automatic series generation.
- A new visual paradigm for the reader or editor.

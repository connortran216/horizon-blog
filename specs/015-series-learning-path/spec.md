# Feature Specification: Series Discovery and Reading

**Feature Branch**: `agent/series-learning-path`
**Created**: 2026-08-15
**Status**: Approved UI; implementation update planned
**Counterpart**: `horizon-blog-be/specs/010-series-learning-path/spec.md`

## User Scenarios & Testing

### User Story 1 - Read an ordered Series (Priority: P1)

A reader can open a public Series, understand its purpose, scan its ordered public blogs, open any part, and move between adjacent published parts from the reader page.

**Independent Test**: Given a public Series, a reader can open any part, see `Part X of Y`, navigate previous or next, and return to the same Series without signing in.

### User Story 2 - Manage an owned series (Priority: P1)

An authorized author can create, rename, describe, delete, and reorder an owned series, and can choose at most one series for a blog during the publication review flow.

**Independent Test**: Given owned blogs and series, the author can save a gap-free order, move a blog to another series only after the backend accepts the new membership, and remove a blog from its series.

### User Story 3 - Discover Series from public reading surfaces (Priority: P1)

A reader can discover recently updated Series below the unchanged Home hero, on the default Blog view, and on a dedicated public Series index without losing the normal chronological blog feed.

**Independent Test**: Given at least one public Series, a reader can move from Home or the default Blog view to a Series in one action, open `/series` through `View all series`, and still find Series-member and standalone blogs together in Recent Blogs.

### User Story 4 - Recover gracefully (Priority: P2)

Reading a blog remains fully usable when series data is absent or temporarily unavailable, and author changes show clear retryable failures without losing the last confirmed server state.

**Independent Test**: With the series endpoint unavailable, the public blog still renders; with an owner mutation failure, the management view keeps the confirmed order and displays a useful error.

## Requirements

### Functional Requirements

- **FR-001**: The application MUST provide a public Series detail route identified by its stable public slug.
- **FR-002**: The Series detail page MUST show title, optional description, author, public part count, total estimated reading time, last-updated date, ordered public blogs, and optional topics derived only from public blogs.
- **FR-003**: Each public Series part MUST show its stable position, title, short excerpt, and estimated reading time and MUST link to the existing public blog reader.
- **FR-004**: The application MUST provide a public `/series` index showing one featured Series and a responsive list of all public Series.
- **FR-005**: The public Series index MUST provide content-shaped loading, meaningful empty, retryable error, and pagination states without showing an empty featured slot.
- **FR-006**: Home MUST preserve its existing hero and Latest Blog preview, then place a Series shelf before Recent Blogs.
- **FR-007**: The default, unfiltered first Blog page MUST show a compact Series shelf before normal blog results; active search, tag filters, or later result pages MUST hide the shelf.
- **FR-008**: Home and Blog Series shelves MUST show at most two recently updated public Series and MUST disappear without blocking the normal blog feed when empty or unavailable.
- **FR-009**: Recent and archive blog feeds MUST remain chronological and contain standalone and Series-member blogs together.
- **FR-010**: A Series-member blog preview MUST show light `Series title / Part X of Y` context; standalone blog previews MUST retain their normal treatment without a redundant standalone label.
- **FR-011**: The blog reader MUST show Series title, `Part X of Y`, a link to the Series detail page, and available previous/next public navigation.
- **FR-012**: Series context MUST NOT block blog rendering, interactions, comments, related blogs, analytics, sharing, or normal navigation when context is absent or fails.
- **FR-013**: Public Series UI MUST NOT show browser-local opened state, progress bars, completion percentages, read-state checkmarks, or account-synced progress.
- **FR-014**: Authorized authors MUST retain a protected Series-management route supporting create, update, delete, membership selection, and explicit ordering.
- **FR-015**: Author controls MUST use backend-provided ownership and status data and MUST NOT infer authorization from route state or token claims.
- **FR-016**: Publication review MUST let an author choose zero or one existing owned Series for the current blog and expose a `Manage series` link.
- **FR-017**: Saving membership from publication review MUST show a retryable failure and prevent publication from continuing with an unconfirmed Series assignment.
- **FR-018**: Public UI MUST use `Series`, `Part X of Y`, `blog`, `blogs`, `read`, and `Recent Blogs`; it MUST NOT use `learning path`, `collection`, course, lesson, enrollment, or completion language.
- **FR-019**: Controls MUST be keyboard accessible, provide visible focus, preserve contrast in light and dark modes, and not rely on color alone.
- **FR-020**: Public reading surfaces MUST remain calm and nearly static; new motion, if any, MUST respect reduced-motion preferences.
- **FR-021**: `/series` and public Series detail pages MUST expose indexable canonical metadata and sitemap entries, while missing, private, or empty Series MUST remain not found.
- **FR-022**: Existing navbar, public blog, editor, publishing, comments, analytics, related-blog, and owner-management behavior MUST remain available.

### Key Entities

- **Public Series Summary**: Discovery-safe identity, description, author, public part count, and last-updated metadata.
- **Public Series**: A public Series summary plus ordered public parts and derived reading metadata.
- **Series Part**: A public blog summary with stable visible position, excerpt, reading time, topics, and optional adjacent navigation.
- **Owner Series**: Protected Series metadata and ordered owner blogs including author-only status fields.

## Success Criteria

- **SC-001**: A reader can reach a public Series from Home, Blog, or `/series` in one action.
- **SC-002**: A reader can identify the current part and its adjacent public parts within five seconds of opening a Series or member blog.
- **SC-003**: The series page remains usable at 375px, 768px, 1024px, and 1440px widths without horizontal overflow.
- **SC-004**: Keyboard users can reach every series navigation and author-management action with visible focus.
- **SC-005**: A series API failure never prevents the main blog article from rendering.
- **SC-006**: Home and Blog remain fully usable when public Series discovery is empty or unavailable.
- **SC-007**: Every visible Series-member blog preview uses the same Series title and `Part X of Y` position as its Series detail page.
- **SC-008**: Public Series index and detail URLs produce shareable metadata and appear in sitemap discovery within the same publication cycle.

## Edge Cases

- A series contains only one published blog.
- No public Series exists.
- The featured Series becomes private or empty between list and detail requests.
- A Series shelf request fails while the normal blog request succeeds.
- Search, tag filters, or pagination are active on `/blog`.
- Previous or next entries are absent.
- The selected series is deleted in another tab before save.
- A blog moves from one series to another.
- An author has no series or no unassigned blogs.

## Assumptions

- Each blog belongs to zero or one series in this MVP.
- Series creation and ordering live on a dedicated protected route; publication review only selects membership.
- Slugs and all public identifiers come from the backend.
- Public Series ordering is deterministic and most-recently-updated first.
- The first public Series returned by that order is the featured Series.
- Total estimated reading time and topics are derived from public member-blog metadata.
- The existing Horizon semantic tokens, typography, spacing, and feature-first architecture remain authoritative.

## Non-Goals

- Reading progress, completion state, cross-device resume, or account-synced reading history.
- Multiple series per blog.
- Subscriptions, notifications, quizzes, certificates, or paid enrollment.
- Automatic series generation.
- Search or tag filters dedicated to Series in this iteration.
- A permanent Series item in the global navbar.
- A new visual paradigm for the reader or editor.

# Feature Specification: Blog Interaction Analytics

**Feature Branch**: `main`
**Created**: 2026-06-04
**Status**: Ready for planning
**Input**: Deliver reader interactions and author performance analytics defined by the approved frontend technical design.

## User Scenarios & Testing

### User Story 1 - React and share after reading (Priority: P1)

As an anonymous or authenticated reader, I want to heart and share a blog after reading the content without leaving the reader so that my response is based on the article itself.

**Why this priority**: Reader interactions must feel natural and timed to the reading experience before their analytics value matters.

**Independent Test**: Open a published blog anonymously, read through the article, heart/unheart it from the closing feedback section, share it through a social target or copy-link action, and confirm the article remains comfortable to read.

**Acceptance Scenarios**:

1. **Given** a reader opens a blog, **When** interaction state loads, **Then** a compact icon row appears after the article content with active heart/share actions and muted unavailable future actions.
2. **Given** a reader hearts or unhearts, **When** the action completes or fails, **Then** the visible state is reconciled accurately.
3. **Given** the reader opens the share menu, **When** they choose Facebook, X, LinkedIn, or copy link, **Then** the selected action shares or copies the canonical blog URL.
4. **Given** a reader uses keyboard or assistive technology, **When** they reach the actions, **Then** toggle state and labels are understandable.

### User Story 2 - Measure reading without interrupting it (Priority: P1)

As a reader, I want analytics collection to remain invisible and non-blocking so that scrolling, links, page unload, and idle tabs behave normally.

**Why this priority**: Measurement must not reduce reading quality or create misleading activity.

**Independent Test**: Read, scroll, idle, hide the tab, click links, and leave the page; confirm expected milestones queue while navigation and rendering remain unaffected.

**Acceptance Scenarios**:

1. **Given** a reader reaches progress milestones, **When** progress advances, **Then** each milestone is queued once.
2. **Given** a tab is hidden, unfocused, or idle, **When** active-time ticks occur, **Then** they are not counted.
3. **Given** a reader clicks a blog-content link, **When** tracking runs, **Then** navigation is never prevented or delayed.
4. **Given** event delivery fails, **When** the reader continues or leaves, **Then** the reading experience remains usable.

### User Story 3 - Understand overall writing performance (Priority: P2)

As an author, I want a protected analytics overview with date ranges, summary metrics, trends, and sortable blogs so that I can identify what performs well.

**Why this priority**: The overview is the author's main entry point into analytics.

**Independent Test**: Authenticate, open analytics, switch date ranges, sort blogs, and confirm meaningful loading, empty, error, and freshness states.

**Acceptance Scenarios**:

1. **Given** an author opens analytics, **When** data loads, **Then** the most important metrics and range are immediately clear.
2. **Given** an author changes the range or sort, **When** the view updates, **Then** the URL preserves the selection.
3. **Given** there is no data, **When** the page loads, **Then** it explains the empty state without inventing metrics.
4. **Given** analytics data is not current to the second, **When** it loads, **Then** freshness is communicated accurately.

### User Story 4 - Diagnose one blog and compare outcomes (Priority: P2)

As an author, I want blog-level funnel, link, traffic source, reaction, comparison, and insight views so that I can improve future writing.

**Why this priority**: Detailed analysis turns the overview into actionable content decisions.

**Independent Test**: Open one owned blog's analytics and confirm summary, trend, funnel, links, sources, reaction trend, and cautious insights remain readable on desktop and mobile.

**Acceptance Scenarios**:

1. **Given** blog detail data exists, **When** the page loads, **Then** drop-off is easy to identify.
2. **Given** links and sources have performance data, **When** they render, **Then** click and engagement quality are understandable.
3. **Given** the backend returns cautious insights, **When** they render, **Then** evidence and low-sample language are preserved.
4. **Given** the author uses mobile, keyboard, light mode, or dark mode, **When** they use analytics, **Then** the information remains accessible and distinct.

## Requirements

### Functional Requirements

- **FR-001**: Published blog detail MUST provide compact post-content icon actions for anonymous and authenticated readers, with only backend-supported heart/share actions enabled.
- **FR-002**: Heart state MUST update optimistically and reconcile with the backend result.
- **FR-003**: Share tracking MUST count only selected social share targets or successful clipboard copies.
- **FR-004**: The frontend MUST create and validate a first-party anonymous visitor ID without treating it as authentication.
- **FR-005**: The frontend MUST create bounded per-blog reading sessions and queue one view per session.
- **FR-006**: The frontend MUST queue progress milestones at 25, 50, 75, 80, and 100 percent no more than once per session.
- **FR-007**: The frontend MUST count active time only while the document is visible, focused, and recently active.
- **FR-008**: Link tracking MUST never prevent or delay navigation.
- **FR-009**: Event delivery MUST batch and retry without blocking reading or page teardown.
- **FR-010**: The frontend MUST stop queueing non-reaction events when backend capabilities disable analytics tracking.
- **FR-011**: Authors MUST have protected overview and blog-detail analytics routes.
- **FR-012**: Overview MUST support summary metrics, trends, date ranges, sortable blogs, pagination, and insights.
- **FR-013**: Blog detail MUST support summary metrics, freshness, progress funnel, reaction trend, links, traffic sources, and insights.
- **FR-014**: Selected date range and sorting MUST survive refresh through URL query parameters.
- **FR-015**: Analytics UI MUST show accurate loading, empty, error, low-sample, and stale-data states.
- **FR-016**: Analytics UI MUST follow semantic tokens, maintain distinct surfaces, and remain accessible in light/dark and mobile/desktop contexts.
- **FR-017**: Analytics UI MUST remain separate from the editorial profile management route.
- **FR-018**: The frontend MUST consume approved backend contracts without inventing endpoints or fields.
- **FR-020**: Unique-reader UI MUST communicate when reader counts are approximate.
- **FR-019**: The feature MUST NOT add a new production dependency without explicit owner approval.

### Key Entities

- **Visitor identity**: A validated first-party identifier for anonymous interaction continuity.
- **Reading session**: Per-blog session metadata and one-time milestones.
- **Queued analytics event**: A pending best-effort measurement event.
- **Interaction state**: Visible heart count, reader heart state, and backend capabilities.
- **Analytics range**: Date range and sort state reflected in the URL.
- **Analytics overview**: Author-level summary, trends, blogs, and insights.
- **Blog analytics detail**: One blog's funnel, links, sources, reactions, and insights.

## Success Criteria

- **SC-001**: Readers can heart, unheart, and share in no more than one direct action from the blog reader.
- **SC-002**: Link tracking causes zero prevented or delayed navigations in acceptance testing.
- **SC-003**: Hidden, unfocused, and idle-tab scenarios emit zero active-time events.
- **SC-004**: Each progress milestone emits no more than once per reading session.
- **SC-005**: Authors can identify the top-performing blog, main drop-off stage, top clicked link, and strongest traffic source from the UI.
- **SC-006**: Every analytics route has usable loading, empty, error, and freshness states.
- **SC-007**: Analytics routes remain readable and operable at mobile and desktop widths in light and dark modes.
- **SC-008**: Protected analytics routes do not expose another author's analytics.
- **SC-009**: Repository lint, format, and production build gates pass after implementation.

## Edge Cases

- Local/session storage is unavailable, invalid, or cleared.
- A reader logs in after anonymous interactions.
- The backend disables tracking or reactions independently.
- Native sharing is cancelled or unsupported.
- Clipboard copy fails.
- Reader content contains same-page anchors, unsafe links, or generated editor controls.
- Event batches fail during page teardown.
- An analytics range has no data or crosses long periods.
- Active-time delivery retries or arrives out of order.
- A blog analytics route returns not found or stale data.
- Charts and tables must work without relying on color alone.

## Assumptions

- The approved backend contracts and fixtures are authoritative.
- Initial reader reaction support is heart-only.
- Analytics is a dedicated protected route, not part of profile management.
- The first implementation uses existing dependencies and accessible SVG/Chakra visualization primitives unless the owner separately approves a chart library.
- The owner runs application servers; implementation validation uses repo-approved static/build gates and coordinated manual QA.

# Feature Specification: Performance Optimization

**Feature Branch**: `main`
**Created**: 2026-06-13
**Status**: Ready for review
**Input**: Reduce frontend request and payload pressure while preserving public reading, analytics accuracy, and reaction behavior.
**Backend Counterpart**: `horizon-blog-be/specs/002-performance-optimization/spec.md`
**Related Feature**: `specs/005-blog-interaction-analytics/spec.md`

## User Scenarios & Testing

### User Story 1 - Browse summaries without downloading full articles (Priority: P1)

As a reader, I want home and archive cards to load only the information they display so that browsing is fast on ordinary connections.

**Why this priority**: The current nine-post response downloads almost 180 KB of article markdown before a reader chooses an article.

**Independent Test**: Load home and the unfiltered archive with nine representative posts; verify cards retain title, excerpt, cover, author, tags, date, and reading time while the response remains within the agreed payload target.

**Acceptance Scenarios**:

1. **Given** a reader opens home, **When** published posts load, **Then** cards are built from the approved summary response.
2. **Given** a reader opens the unfiltered archive, **When** posts load, **Then** listing cards do not require full article markdown.
3. **Given** a summary has no cover or avatar, **When** it renders, **Then** existing fallback visuals remain.
4. **Given** a reader opens an article or editor, **When** full content is required, **Then** the existing full-post flow remains unchanged.

### User Story 2 - Read before background features finish (Priority: P1)

As a reader, I want article content to become usable independently of analytics and reaction requests so that optional features cannot hold up reading.

**Why this priority**: Article visits now start analytics and reaction work against an API with unstable tail latency.

**Independent Test**: Delay or fail analytics and reaction requests while loading a published article; verify article content, scrolling, links, and navigation remain usable.

**Acceptance Scenarios**:

1. **Given** article detail succeeds and reaction state is slow, **When** the page renders, **Then** content is usable before reaction state completes.
2. **Given** analytics delivery is slow or fails, **When** the reader scrolls or follows links, **Then** reading and navigation are not delayed.
3. **Given** reaction state fails, **When** the interaction row appears, **Then** it degrades without replacing article content.
4. **Given** the reader leaves the page, **When** final delivery is attempted, **Then** teardown is not blocked.

### User Story 3 - Batch measurement without losing semantics (Priority: P1)

As an author, I want reading events delivered efficiently while preserving the meaning of views, milestones, active time, links, shares, and reactions.

**Why this priority**: Fewer requests are useful only if analytics remains trustworthy.

**Independent Test**: Simulate reading, progress, idling, hidden tabs, links, shares, slow delivery, retries, and exit; verify event contents and counts match the existing analytics specification with fewer routine deliveries.

**Acceptance Scenarios**:

1. **Given** active reading and progress occur between delivery intervals, **When** the interval fires, **Then** queued events are delivered together.
2. **Given** one delivery is still running, **When** another flush trigger occurs, **Then** no overlapping delivery is started.
3. **Given** delivery fails, **When** later delivery succeeds, **Then** eligible queued events are retried within existing bounds.
4. **Given** a link, successful share, hidden page, or page exit occurs, **When** delivery is triggered, **Then** the reader action remains immediate and events retain existing semantics.

### User Story 4 - Keep author analytics isolated and lazy (Priority: P2)

As a visitor who is not using analytics, I want author analytics code and requests excluded from public routes so that dashboard functionality does not burden reading.

**Why this priority**: Analytics UI should remain isolated even as its data layer evolves.

**Independent Test**: Build and navigate public routes without authentication; verify analytics routes remain lazy and no owner analytics requests occur.

**Acceptance Scenarios**:

1. **Given** a visitor uses home, archive, or article routes, **When** route assets load, **Then** protected analytics pages remain separate lazy chunks.
2. **Given** a visitor is unauthenticated, **When** public pages load, **Then** no owner analytics query is sent.
3. **Given** an author opens analytics, **When** data loads, **Then** existing metrics, ranges, sorting, freshness, and error states remain.

## Requirements

### Functional Requirements

- **FR-001**: Home and unfiltered public archive listings MUST consume the approved backend post-summary contract.
- **FR-002**: Summary mapping MUST preserve title, excerpt, reading time, cover, author, tags, status, identifier, and timestamps.
- **FR-003**: Full article, authoring, profile, search, and protected analytics flows MUST retain their established contracts unless explicitly covered by the backend counterpart.
- **FR-004**: Article content rendering MUST NOT depend on analytics delivery or reaction-state completion.
- **FR-005**: Routine progress and active-time events MUST queue and share a periodic batch delivery.
- **FR-006**: The default routine analytics delivery interval MUST be 30 seconds.
- **FR-007**: Analytics delivery MUST prevent overlapping flush requests.
- **FR-008**: Failed events MUST retain existing bounded retry behavior.
- **FR-009**: Page hide, page exit, content-link, and successful-share delivery MUST remain non-blocking.
- **FR-010**: View, progress, completion, active-time, click, share, heart, and unheart event semantics MUST remain compatible with the related analytics specification.
- **FR-011**: Hidden, unfocused, and idle tabs MUST continue to emit no active-time growth.
- **FR-012**: Protected analytics routes MUST remain lazy and MUST NOT issue owner analytics requests from public routes.
- **FR-013**: The optimization MUST follow the existing repository, service, hook, page, and component boundaries.
- **FR-014**: The optimization MUST NOT add a new production dependency.

### Key Entities

- **Post summary response**: Compact listing data supplied by the backend.
- **Blog post summary**: Frontend display model for home and archive cards.
- **Reading-session queue**: Ordered in-memory analytics events for one article session.
- **Delivery interval**: Shared periodic trigger for routine queued events.
- **In-flight flush**: The single active analytics delivery promise.

## Success Criteria

- **SC-001**: A nine-post public summary response is no larger than 50 KB.
- **SC-002**: Public article content remains usable when analytics and reaction requests are delayed by at least five seconds or fail.
- **SC-003**: Routine active-time and progress tracking generates no more than one delivery request per 30-second interval.
- **SC-004**: Concurrent flush tests observe at most one analytics delivery in flight.
- **SC-005**: Existing analytics event, retry, activity, link, share, and reaction tests show no semantic regression.
- **SC-006**: Public article-flow median latency is below 300 ms and p95 is below one second in the agreed production sample after backend deployment.
- **SC-007**: The production build keeps analytics pages in separate lazy chunks and adds no production dependency.
- **SC-008**: Frontend lint, type, targeted tests, and the justified production build gate pass.

## Edge Cases

- Summary responses omit optional cover, avatar, tags, or publication time.
- A cached full-post response exists while a summary response changes.
- Progress and active-time events arrive while a previous flush is pending.
- Page hide and page exit fire close together.
- A link click occurs before the first routine delivery.
- Storage is unavailable or the visitor identity is invalid.
- Analytics or reactions are disabled independently.
- A reader moves quickly between two articles.

## Assumptions

- The backend counterpart owns the post-summary and performance contracts.
- A 30-second routine delivery interval provides sufficient analytics freshness while reducing request pressure.
- Existing card fallbacks and design-system behavior remain authoritative.
- The owner continues to run application servers; browser validation targets the deployed site or an owner-provided local URL.

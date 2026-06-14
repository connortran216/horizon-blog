# Research: Performance Optimization Frontend

## Decision: Consume backend summaries through the existing data boundary

**Rationale**: Home and archive already consume `BlogPostSummary`, but the repository currently obtains it from full posts and derives fields from markdown. A summary API type and direct mapping remove payload waste while preserving service and component boundaries.

**Alternatives considered**:

- Call the API directly from pages: rejected because it bypasses repository/service architecture.
- Keep full posts in cache: rejected for unfiltered listings because the network waste remains.

## Decision: Limit summary adoption to home and unfiltered archive

**Rationale**: Detail and editor need full content. Search and profile flows use established contracts and should not be silently changed without matching backend endpoints.

**Alternatives considered**:

- Replace every listing call: rejected because backend summary behavior is not defined for every filtered flow.
- Change full `BlogPost` to omit content: rejected as a broad breaking model change.

## Decision: Use one 30-second routine delivery interval

**Rationale**: Active-time and progress events can queue together. Lifecycle, content-link, and successful-share flushes remain explicit because loss risk is higher.

**Alternatives considered**:

- Keep 15-second active-time flushes: rejected because they double routine request pressure.
- Flush every progress milestone: rejected because fast scrolling can create bursts.
- Persist an offline queue: excluded by scope.

## Decision: Make flush single-flight

**Rationale**: Slow requests can overlap interval, lifecycle, link, or share triggers. Reusing one in-flight promise prevents concurrent delivery while retaining queued events for the next pass.

**Alternatives considered**:

- Drop flush triggers while busy: rejected because callers need deterministic completion and queued events must remain eligible.
- Abort the active request: rejected because it can increase retries and duplicate ambiguity.

## Decision: Verify article independence rather than add duplicate state

**Rationale**: Existing hooks are not awaited by article rendering. Tests should freeze that boundary and only remove proven coupling.

**Alternatives considered**:

- Add another page-level loading coordinator: rejected because it could couple optional requests to content.
- Hide reaction controls permanently: rejected because degradation should be local to the optional feature.

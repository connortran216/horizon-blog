# Data Model: Blog Interaction Analytics Frontend

## Reader Feature Models

### VisitorIdentity

- `visitorId`: validated anonymous first-party UUID.
- Stored in local storage when available.
- Never treated as authentication or displayed.

### ReadingSession

- `postId`: current blog.
- `sessionId`: per-blog session UUID.
- `startedAt`: session start.
- `lastActivityAt`: expiration reference.
- `emittedMilestones`: milestones already queued.
- `activeTimeSeq`: strictly increasing counter for cumulative active-time reports.
- `activeMs`: cumulative visible/focused/recently-active reading time sent to backend.

### QueuedAnalyticsEvent

- Canonical event fields from backend fixtures.
- Stable `eventId` preserved across retries.
- In-memory delivery status and retry count.
- Never persisted as a long-term event history.

### ReaderInteractionState

- `heartCount`
- `viewerHasHearted`
- `capabilities.analyticsTracking`
- `capabilities.reactions`

## Author Feature Models

### AnalyticsRange

- Inclusive `from` and `to` UTC dates.
- Preset or custom selection.
- Optional blog sort and order.
- Serialized to URL query parameters.

### AnalyticsSummary

- Views, approximate unique readers, hearts received, shares, link clicks, completion rate, and average active read seconds.

### AnalyticsTrendPoint

- UTC date and typed metric values for trend rendering.

### BlogMetricRow

- Blog identity plus sortable summary metrics.

### BlogAnalyticsDetail

- Blog identity, summary, progress funnel, reaction trend, top links, traffic sources, insights, and freshness.

### AnalyticsInsight

- Stable code, cautious message, sample size, and metric evidence.

## Mapping Rules

- API DTOs remain isolated in the author analytics repository.
- Services map API DTOs to display models.
- Ratios remain numeric until UI formatting.
- Durations remain seconds until UI formatting.
- Approximate unique-reader values carry approximate UI copy/formatting.
- Missing requests are errors; only successful empty responses become zero/empty display models.

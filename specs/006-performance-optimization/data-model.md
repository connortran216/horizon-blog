# Data Model: Performance Optimization Frontend

## ApiPostSummary

The direct TypeScript representation of backend `GET /posts/summaries` items:

- `id`
- `title`
- `excerpt`
- `reading_time`
- optional `cover_image`
- `owner`
- `tags`
- `status`
- `created_at`
- `updated_at`
- optional `published_at`

It intentionally has no `content_markdown`.

## BlogPostSummary

The existing display model remains the UI boundary. The summary adapter maps:

- `reading_time` to `readingTime`;
- `cover_image` to `featuredImage`;
- timestamps and owner/tags through existing domain types;
- optional values to existing card fallbacks.

Full `BlogPost` and `ApiBlogPost` models remain unchanged.

## ReadingSessionQueue

An ordered in-memory queue of existing analytics event objects. Event creation rules, IDs, cumulative active time, progress milestones, retry counts, and queue bounds remain unchanged.

## DeliverySchedule

- routine interval: 30 seconds by default;
- test interval: injected;
- explicit non-blocking triggers: page hidden, page exit, content link, successful share;
- progress and active-time recording enqueue events but do not independently start routine network delivery.

## InFlightFlush

At most one active delivery promise per transport. Concurrent triggers reuse the promise or leave newly queued events for the next pass. Failed eligible events retain existing bounded retry behavior.

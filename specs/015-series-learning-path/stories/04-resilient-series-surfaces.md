# Story 04: Resilient Series Surfaces

**Project**: Horizon Blog Frontend
**Service**: Series feature and SEO gateway
**Dependencies**: Public Series discovery and detail
**Blockers**: None after the public contract stabilizes

## Context

Series is useful context, but it must never make the existing Home, Blog, or reader experience less reliable.

## Acceptance Criteria

- Home and Blog hide unavailable Series shelves while keeping normal content usable.
- Reader Series context failure leaves the complete article experience intact.
- `/series` offers explicit loading, empty, error, retry, and pagination states.
- Public Series routes expose canonical and share metadata and participate in sitemap discovery.
- Missing, private, and empty Series preserve a real not-found boundary.

## Definition of Done

- Failure-isolation, route, metadata, sitemap, and crawler regressions pass.
- Production build and manual responsive/accessibility review pass.

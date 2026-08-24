# Research: Responsive Media Delivery Frontend

## Decision: Additive manifest with legacy wrapper

- **Decision**: Introduce a typed manifest resolver while retaining the URL-only resolver signature.
- **Rationale**: GitNexus reports the shared resolver as CRITICAL blast radius across editor, reader, profile, and cards.
- **Alternatives considered**: Changing all consumers in one breaking edit was rejected.

## Decision: Microtask request coalescing

- **Decision**: Queue uncached IDs for one microtask, deduplicate them, then split by the backend limit.
- **Rationale**: Existing card hooks mount independently; coalescing removes N+1 calls without moving ownership into every page.
- **Alternatives considered**: Page-specific batch plumbing duplicates logic and misses editor/profile surfaces.

## Decision: Expiry-aware manifest cache

- **Decision**: Cache the complete manifest until shortly before the earliest returned expiry and share in-flight work.
- **Rationale**: A variant set is valid only while every URL used in its `srcset` remains valid.
- **Alternatives considered**: Fixed-duration caching can retain expired signed URLs.

## Decision: Render article variants after token resolution

- **Decision**: Preserve markdown tokens and give the reader a manifest map for image rendering; external image URLs remain unchanged.
- **Rationale**: Persisted content stays durable and sanitized rendering owns presentation attributes.
- **Alternatives considered**: Persisting HTML or `srcset` in markdown would couple content to expiring URLs.

## Decision: Priority by surface

- **Decision**: Hero images load eagerly with high priority; cards and article images load lazily and decode asynchronously.
- **Rationale**: This protects the likely LCP image while preventing below-the-fold overfetch.

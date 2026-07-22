# Research: Public Post Codes

## Decision: Use a fixed reversible code without a new dependency

- **Decision**: Encode positive safe-integer post IDs through a fixed reversible permutation and a fixed-width base-62 representation prefixed with `p`.
- **Rationale**: The user selected cosmetic ID obfuscation, the repository requires approval before adding production dependencies, and the existing SEO gateway plan explicitly avoids new dependencies. A small deterministic codec satisfies the URL goal without changing backend storage or contracts.
- **Alternatives considered**:
  - Sqids/Hashids dependency: familiar and maintained, but adds a production dependency for a narrow deterministic transform.
  - Plain base-62: smaller, but sequential IDs remain visibly related and easy to infer.
  - Stored random public IDs: stronger separation, but requires backend schema, migrations, API fields, and deployment coordination beyond the approved scope.
  - Title slugs: readable, but require backend ownership, uniqueness, rename policy, and redirect history.

## Decision: Treat the codec configuration as a permanent public contract

- **Decision**: Fix the alphabet, prefix, width, multiplier, offset, and numeric range in one shared module.
- **Rationale**: Changing any of these values would invalidate previously shared links. A single module consumed by both the React application and Node SEO gateway prevents configuration drift.
- **Alternatives considered**:
  - Environment-configured secrets: operationally flexible but unsafe for permanent URLs because a missing or rotated value breaks links.
  - Separate frontend and gateway implementations: easier file placement but creates drift risk.

## Decision: Redirect legacy numeric reader routes and preserve numeric APIs

- **Decision**: The SEO gateway permanently redirects `/blog/<decimal-id>` to the coded path. The client router also replaces legacy numeric paths during local/static hosting. Backend requests continue to use the decoded decimal ID.
- **Rationale**: Existing indexed and shared URLs must survive, while internal curl, analytics, media, and related-post requests should retain their current identifiers.
- **Alternatives considered**:
  - Render both numeric and coded routes with canonical metadata only: avoids redirects but leaves duplicate public URLs accessible.
  - Change backend routes to codes: expands the cosmetic change into an API contract migration.

## Decision: Keep stable image routes numeric

- **Decision**: `/seo/post-image/:id` remains numeric.
- **Rationale**: It is an infrastructure image endpoint rather than the reader-facing article URL, and changing it provides no address-bar benefit while increasing cache churn.
- **Alternatives considered**:
  - Encode image route IDs: possible, but would require decoding in another route family and invalidate existing cached image URLs.

## Decision: Keep protected routes out of scope

- **Decision**: `/analytics/blog/:id` and `/profile/:username/blog/:id` remain numeric.
- **Rationale**: They are protected operational routes and were explicitly excluded from the public-reader URL requirement.
- **Alternatives considered**:
  - Encode every route: creates unnecessary changes to owner-only flows and diagnostics.

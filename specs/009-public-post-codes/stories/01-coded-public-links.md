# Story 01: Coded Public Links

**Project**: Horizon Blog frontend
**Service**: React reader and SEO gateway
**Dependencies**: Shared public-post-code contract
**Blockers**: None

## Context

Reader-facing article URLs currently expose sequential post IDs. Public navigation, metadata, crawler HTML, sitemap, and RSS must derive the same stable opaque URL while internal data retrieval remains numeric.

## Acceptance Criteria

- Public React article links use the stable coded path.
  - **Verify**: Render representative home/blog/related links.
  - **Pass**: Their `href` values use the code and contain no decimal ID.
- SEO metadata and discovery documents use the same coded path.
  - **Verify**: Run metadata, feed, renderer, and server tests.
  - **Pass**: Canonical, structured data, sitemap, RSS, and crawler links agree.
- The codec is stable and reversible for supported IDs.
  - **Verify**: Run fixed-vector and boundary tests.
  - **Pass**: Encoding is deterministic and decoding returns the original ID.

## Interface Contracts

- `encodePublicPostId(id)` returns a canonical code.
- `decodePublicPostCode(code)` returns a decimal ID string or no value.
- `toPublicPostPath(id)` returns `/blog/<canonical-code>`.

## Technical Approach

Keep the reversible transform in one dependency-free module consumed by both Vite and the Node SEO gateway. Public link producers call the path helper; internal services continue receiving numeric IDs.

## Non-Goals

- Security against determined enumeration.
- Backend schema or API changes.
- Encoding stable SEO image paths or protected owner routes.

## Definition of Done

- Codec and URL producers are tested.
- Public paths agree across browser and crawler surfaces.
- Numeric backend behavior is unchanged.

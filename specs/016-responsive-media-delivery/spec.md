# Feature Specification: Responsive Media Delivery

**Feature Branch**: `agent/responsive-media-delivery`
**Created**: 2026-08-24
**Status**: Approved for implementation
**Counterpart**: `horizon-blog-be/specs/011-responsive-media-delivery/spec.md`

## User Scenarios & Testing

### User Story 1 - Read media without downloading oversized originals (Priority: P1)

A reader receives an image sized for the current viewport while the article continues to reference one durable `media://<id>` identity.

**Independent Test**: Given media with responsive variants, mobile and desktop browsers render the same logical image from different suitable sources, with the original URL available as fallback.

### User Story 2 - Load media-heavy pages efficiently (Priority: P1)

Cards and article images avoid duplicate resolve calls, defer below-the-fold downloads, and reserve image space where dimensions are known.

**Independent Test**: Rendering several cards in one turn produces one batched resolve request; non-hero images expose lazy/async hints and responsive attributes.

### User Story 3 - Preserve legacy and editor behavior (Priority: P2)

Existing media without variants and editor previews remain usable through the legacy fallback URL.

**Independent Test**: A resolve response with only `id`, `url`, and `expires_at` still renders in cards, readers, previews, and profile views without changing stored markdown.

## Requirements

### Functional Requirements

- **FR-001**: Stored markdown MUST continue to use exactly one durable `media://<id>` token per logical media item.
- **FR-002**: The client MUST accept the existing resolve response and optional responsive variant metadata without breaking current consumers.
- **FR-003**: Responsive sources MUST be ordered by intrinsic width and emitted as a valid width-descriptor `srcset`.
- **FR-004**: Image components MUST use the original resolved URL as fallback when responsive metadata is missing or invalid.
- **FR-005**: Resolve calls made by sibling consumers in the same render window MUST be coalesced into bounded batch requests.
- **FR-006**: Concurrent requests for the same unresolved media ID MUST share one in-flight resolution.
- **FR-007**: Resolved manifests MUST be cached no longer than their earliest signed URL expiry.
- **FR-008**: Article media MUST render responsive attributes without rewriting persisted markdown.
- **FR-009**: Below-the-fold article and card media MUST use lazy loading and asynchronous decoding.
- **FR-010**: The primary hero image MAY load eagerly with high fetch priority; other images MUST NOT receive that priority.
- **FR-011**: Known width and height MUST be exposed to the browser so layout space can be reserved.
- **FR-012**: Sanitization MUST continue to reject unsafe markup while allowing only the responsive image attributes required by this feature.
- **FR-013**: Editor upload, token insertion, preview, and delete flows MUST retain their current fallback-URL behavior.
- **FR-014**: A failed resolve or missing item MUST leave the existing placeholder/fallback behavior intact and MUST NOT block article text.

### Key Entities

- **Media Token**: Durable `media://<id>` reference stored in content or summary fields.
- **Resolved Media Source**: Fallback URL, expiry, intrinsic dimensions, and zero or more width variants.
- **Resolve Batch**: One coalesced API call serving multiple current consumers.

## Success Criteria

- **SC-001**: A card collection mounted in one render window issues at most one resolve request per API batch limit.
- **SC-002**: Responsive media renders a valid `srcset` and `sizes`; legacy media renders the fallback URL only.
- **SC-003**: Non-hero image elements expose lazy loading and async decoding.
- **SC-004**: Media resolution failure never prevents article text or editor content from rendering.
- **SC-005**: Focused tests cover batching, in-flight deduplication, legacy fallback, responsive mapping, sanitization, and reader output.

## Edge Cases

- Duplicate IDs arrive in one or several calls.
- A batch is larger than the backend request limit.
- One variant URL expires earlier than the original URL.
- Variants are absent, duplicated, unsorted, or contain invalid dimensions.
- The media token resolves after a component unmounts.
- Markdown contains external images and `media://` images together.

## Assumptions

- The backend preserves the existing `id`, `url`, and `expires_at` fields.
- Variant URLs use the same authorization semantics as the original URL.
- Width targets and WebP encoding are backend concerns; the frontend treats the manifest as authoritative.

## Non-Goals

- Replacing `media://` tokens in persisted content.
- Browser-side image transcoding.
- Changing avatar delivery in this feature.
- Introducing a new image CDN or public bucket policy.

# Story 02: Legacy Route Compatibility

**Project**: Horizon Blog frontend
**Service**: React reader and SEO gateway
**Dependencies**: Story 01 codec
**Blockers**: Codec contract must be stable

## Context

Numeric article URLs already exist in search indexes, bookmarks, and external references. They must remain useful while consolidating public traffic onto coded canonical URLs.

## Acceptance Criteria

- Numeric gateway routes permanently redirect to the corresponding coded path.
  - **Verify**: Request legacy `GET` and `HEAD` routes without following redirects.
  - **Pass**: Both return `301`; `HEAD` has no body; `Location` is coded.
- Client-only routing replaces a numeric path and still loads the correct article.
  - **Verify**: Run the public-detail hook regression with a numeric segment.
  - **Pass**: The existing service receives the decimal ID and navigation replaces the URL.
- Invalid public codes do not request or display unrelated posts.
  - **Verify**: Test malformed and non-canonical segments.
  - **Pass**: The route reports not found without a post request.

## Error Handling

- Unsupported shapes are classified as not found.
- A valid code for a missing published ID receives the existing backend-backed 404 behavior.

## Technical Approach

Route classification distinguishes coded article routes from legacy decimal routes. The gateway owns permanent HTTP redirects; the React detail hook provides equivalent compatibility when running without that gateway.

## Non-Goals

- Redirecting protected analytics or profile routes.
- Validating publication status before issuing the legacy redirect.

## Definition of Done

- Legacy and malformed paths have focused route/server/hook tests.
- Canonical coded paths render exactly once.

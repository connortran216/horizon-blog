# Feature Specification: RBAC Authorization

## Overview

Horizon's web application must reflect the current authorization returned by the backend without becoming a security boundary itself. Members retain profile and comment participation, authors receive writing and analytics controls, and administrators receive a minimal role-assignment surface. Public reading remains unchanged.

## User Scenarios & Testing

### Use member features without author controls (P1)

As a signed-in member, I can manage my profile and participate in comments without seeing editor or analytics actions that the API will reject.

**Acceptance scenarios**:

1. A member does not see Write, Publish, or Analytics navigation/actions.
2. Direct navigation to editor or analytics shows access denied and does not sign the member out.
3. Profile and backend-provided comment capabilities remain available.

### Author and manage owned blogs (P1)

As an author, I can access editor, publishing, profile blog management, and analytics for my own content.

**Acceptance scenarios**:

1. An author sees the existing Write and Analytics actions.
2. Editor and analytics routes accept an author with the required permission.
3. The UI does not imply access to another author's private content.

### Recover safely from a mid-session demotion (P1)

As a user whose author permission is removed while an editor is open, I keep my unsaved local work and receive a clear access-loss state.

**Acceptance scenarios**:

1. The first authoring `403` stops autosave retries, preserves the local draft, and refreshes `/users/me`.
2. The user is not logged out because authentication remains valid.
3. Navigation and route access update to the new permission state.

### Assign supported roles as an admin (P1)

As an administrator, I can inspect user role assignments and select member, author, or admin from a minimal protected access-management page.

**Acceptance scenarios**:

1. Only a caller with `roles:assign` can enter `/admin/access` or see its navigation entry.
2. Role updates show success, idempotent no-change, validation, forbidden, missing-user, and last-admin conflict states.
3. The page does not expose audit history or unrelated private account data.

### Preserve public and connected-client behavior (P1)

As a reader, public routes load without waiting for authorization context. As a connected client user, backend denials remain authoritative and are not overridden by the web UI.

## Functional Requirements

- **FR-001**: The frontend must consume the backend's private `authorization.role` and `authorization.permissions` context and must not decode or infer RBAC from JWT claims.
- **FR-002**: Missing authorization context during session hydration must fail closed for author/admin actions while preserving member/public surfaces.
- **FR-003**: Protected routes must support an optional required permission in addition to authentication.
- **FR-004**: Editor routes require `content:manage:own`; analytics routes require `analytics:read:own`; admin access requires `roles:assign`.
- **FR-005**: Navigation, home authoring calls to action, profile management, and publish controls must reflect effective permissions.
- **FR-006**: Backend `401` must keep existing session-expiry/logout behavior; `403` must show access denied without clearing the token.
- **FR-007**: A mid-edit authoring `403` must stop autosave, preserve local draft state, show persistent recovery guidance, and refresh the current authorization context.
- **FR-008**: Comment controls must continue using backend-provided capability flags rather than duplicating comment ownership rules in the client.
- **FR-009**: The admin access page must consume only the approved `GET /admin/users` and `PATCH /admin/users/:id/role` contracts.
- **FR-010**: Public user/profile/blog/comment DTOs must not gain role or permission fields.
- **FR-011**: Client-side permission checks must be described and implemented as UX gates, never as the authoritative security control.

## Assumptions

- The backend returns stable, ordered effective permissions in private auth and `/users/me` responses.
- The backend remains authoritative for permission, ownership, and last-admin decisions.
- A minimal role-assignment page is sufficient for version 1.
- Existing owner-scoped Writer MCP tools and cross-owner admin content browsing are not frontend responsibilities in this version.

## Out of Scope

- Custom role or permission editing.
- Audit-log browsing.
- Session/device management or token revocation UI.
- Cross-owner admin content browser.
- Conditional Writer MCP tool registration.

## Success Criteria

- **SC-001**: Route and navigation tests cover member, author, admin, absent-context, and anonymous states.
- **SC-002**: A `403` never clears authenticated state in automated tests.
- **SC-003**: A mid-edit demotion preserves local draft content and stops autosave in automated tests.
- **SC-004**: Public routes render without an authorization-context dependency.
- **SC-005**: The role-assignment page handles all backend response states without exposing public role data.

## Implementation Gate

Frontend implementation begins only after the backend contract in `../../../horizon-blog-be/specs/007-rbac-authorization/contracts/authorization-api.md` is approved.

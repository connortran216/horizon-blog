# R10 - Final Manual Verification

## Header

- Project: Horizon Blog frontend
- Service: End-to-end refactor verification
- Dependencies: R1, R2, R3, R4, R5, R6, R7, R8, R9
- Blockers: owner-run dev server and backend are required for browser/manual verification

## Context

This story verifies that the refactor preserved behavior across public reading, author archive, profile, editor, and auth flows. The owner runs the dev server and backend in this repo, so Codex should provide commands and checks without starting runtime services. See [plan section 6](../clean-architecture-refactor-plan.md#6-validation-plan).

## Acceptance Criteria

### Functional Requirements

- Public blog archive loads.
  - Verify: owner opens `/blog`
  - Pass: Published posts render without console/runtime errors.

- Blog search works.
  - Verify: owner enters a search query on `/blog`
  - Pass: Results update for the query and empty state is sensible when no posts match.

- Blog tag filtering works.
  - Verify: owner toggles a tag on `/blog`
  - Pass: Active tag state and results update.

- Blog pagination works.
  - Verify: owner changes page on `/blog`
  - Pass: URL page state and rendered posts update.

- Blog detail loads.
  - Verify: owner opens a known published post detail URL
  - Pass: Title, content, author, tags, and media render.

- Blog detail not-found state works.
  - Verify: owner opens a missing or unavailable post detail URL
  - Pass: Public not-found message is shown.

- Author archive loads profile and posts.
  - Verify: owner opens an author archive route from a post author link
  - Pass: Author profile and published posts render.

- Profile published and draft lists load.
  - Verify: owner opens authenticated profile page
  - Pass: Published and draft sections render expected posts.

- Profile pagination works for both lists.
  - Verify: owner changes published and draft pages separately
  - Pass: Each list page changes independently.

- Deleting a post refreshes profile lists.
  - Verify: owner deletes a disposable draft/test post
  - Pass: Deleted post disappears and totals update.

- Cover images from `media://` tokens resolve.
  - Verify: owner views a profile or public post with token-backed cover image
  - Pass: Image renders as a resolved URL.

- Editor creates a new draft through autosave.
  - Verify: owner opens new editor, enters title/content, waits for autosave
  - Pass: Draft save status appears and one draft exists.

- Existing draft updates correctly.
  - Verify: owner edits an existing draft and waits for autosave
  - Pass: Same post updates without creating a duplicate.

- Publish works for new and existing posts.
  - Verify: owner publishes a new post and an edited draft
  - Pass: Both become published and are visible in expected lists.

- Editing from profile works.
  - Verify: owner clicks edit from profile
  - Pass: Editor loads the selected post.

- Direct unauthorized edit path blocks access.
  - Verify: owner opens an edit URL without authorized profile state or with wrong user
  - Pass: Access denied behavior remains.

- Auth session restore and `401` flow still work.
  - Verify: owner reloads authenticated app, then tests expired/invalid token behavior
  - Pass: Valid session restores; invalid session clears token and follows existing auth handling.

### Technical Requirements

- No migrated UI flow calls `apiService` directly when a service exists.
  - Verify: `rg "apiService" src/features src/app src/components`
  - Pass: Matches are only approved adapters, media API code, or documented exceptions.

- No migrated UI flow calls `getBlogRepository()` directly.
  - Verify: `rg "getBlogRepository" src/features src/app src/components`
  - Pass: No migrated UI flow depends on repository getter directly.

- Blog mapping has one source of truth.
  - Verify: `rg "extractFirstImageFromMarkdown|getPostOwnerName|calculateReadingTime" src/core`
  - Pass: Shared mapping utility owns these implementations.

### Quality Gates

- Final lint passes.
  - Verify: `yarn lint`
  - Pass: Command exits `0`.

- Final build passes.
  - Verify: `yarn build`
  - Pass: Command exits `0`.

- Documentation reflects completed architecture changes.
  - Verify: `rg "Clean Architecture|repository -> service|apiService -> repository" docs AGENTS.md`
  - Pass: Refactor docs and repo guidance describe the final boundary.

## Error Handling

- Public and authenticated error states remain status-aware.
  - Verify: `rg "ApiError|statusCode|status ===" src/features src/core/services`
  - Pass: `400`, `401`, `403`, and `404` handling still exists where relevant.

## Authentication Context

- Protected profile/editor behavior still depends on authenticated user state.
  - Verify: `rg "useAuth|AuthStatus|ProtectedRoute|user.id" src/features src/components src/context`
  - Pass: Auth checks remain in protected flows.

## Interface Contracts

Consumes all contracts from R1 through R8. This story produces no new code-level interface.

## Technical Approach

Focus Area: behavior preservation. Final verification should combine static commands with owner-run browser checks because there are no frontend tests today and the owner controls runtime services. The goal is to prove architecture changed without changing user-visible workflows.

## Non-Goals

- Do not start the dev server or backend from Codex.
- Do not add new feature behavior during final verification.
- Do not accept unrelated regressions as part of the refactor.

## Definition of Done

- All functional checks pass or exceptions are documented.
- Final lint passes.
- Final build passes.
- Story index is updated to mark completed stories.


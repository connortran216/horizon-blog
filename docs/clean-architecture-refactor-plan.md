# Horizon Blog Clean Architecture Refactor Plan

Task tracker: [clean-architecture-refactor-tasks.md](./clean-architecture-refactor-tasks.md)

## 1. Purpose

This plan describes an incremental frontend refactor for Horizon Blog. The goal is to make the current implementation cleaner, easier to test, and closer to Clean Architecture and SOLID without changing user-facing behavior or backend contracts.

Target architecture:

```text
apiService -> repository -> service/use-case -> feature hook -> component
```

The refactor should be behavior-preserving. Each phase should leave the app buildable and reviewable.

## 2. Current Problems

### 2.1 Duplicated Blog Mapping Logic

`BlogService` and `ApiBlogRepository` both contain business/display mapping logic:

- owner fallback from `owner`, legacy `user`, and `user_id`
- first image extraction from markdown/html
- reading time calculation
- markdown excerpt generation
- API post to `BlogPostSummary` conversion

This duplicates behavior and makes it unclear whether repositories or services own business rules.

### 2.2 UI Hooks Bypass Services

Several hooks/components call repositories or `apiService` directly:

- `useBlogPostDetail` calls `apiService.get('/posts/:id')`
- `useProfilePosts` calls `getBlogRepository()`
- `useAutoSave` calls `getBlogRepository()`
- `useBlogPost` calls `getBlogRepository()`
- `Navbar` calls `getBlogRepository().createPost()`

This makes UI code depend on persistence details and `RepositoryResult` shapes.

### 2.3 Mixed API Patterns

The codebase currently has both:

- core repositories and services under `src/core`
- feature API modules such as `src/features/blog/blog.api.ts` and `src/features/media/media.api.ts`

Feature API modules are useful, but the boundary is inconsistent. Some flows go through repositories/services, while others go straight from hooks to `apiService`.

### 2.4 Editor Save Flow Is Too Large

`useAutoSave` currently handles:

- local draft backup
- autosave timers
- backend create/update
- publish
- in-flight create locking
- repository error mapping
- validation message state
- save status state

This makes the hook hard to reason about and hard to test.

### 2.5 Dependency Injection Is Incomplete

The DI container exists, but services still fall back to global getters internally, and UI hooks often retrieve repositories directly. This weakens Dependency Inversion because dependencies are still pulled globally instead of passed explicitly.

### 2.6 Logging Noise

Some editor and reader flows still contain debug `console.log` calls. The repo guidance says logging should be minimal and intentional.

## 3. Refactor Principles

- Keep backend endpoints and payload contracts unchanged.
- Avoid new production dependencies.
- Preserve existing routes and UI behavior.
- Prefer small, reviewable phases over a large rewrite.
- Move business rules into services/use-cases.
- Keep repositories focused on API access, response normalization, caching, and error wrapping.
- Keep hooks focused on React state, lifecycle, timers, routing, and toasts.
- Keep components focused on rendering and user interaction.
- Do not redesign UI as part of this refactor.

## 4. Target Layer Responsibilities

### 4.1 `apiService`

Responsibilities:

- HTTP transport
- auth interceptor integration
- JSON/FormData handling
- response parsing
- throwing `ApiError` for non-2xx responses

Should not:

- know blog/profile/editor business rules
- create UI-ready models
- calculate derived fields

### 4.2 Repositories

Responsibilities:

- call backend endpoints
- normalize raw API shape where needed
- handle endpoint-specific caching
- return `RepositoryResult<T>`
- preserve status codes for service-level error mapping

Should not:

- calculate reading time
- build markdown excerpts
- decide UI empty-state copy
- own route/navigation behavior
- contain editor orchestration logic

### 4.3 Services and Use-Cases

Responsibilities:

- orchestrate repository calls
- apply business rules
- create UI-ready domain models
- map repository failures to meaningful errors
- hide `RepositoryResult` from UI hooks
- provide use-case methods for current screens

### 4.4 Hooks

Responsibilities:

- React state
- effects and cancellation
- timers
- routing
- toasts
- confirmation prompts

Should not:

- call `apiService` directly when a service exists
- inspect repository internals
- duplicate business mapping

### 4.5 Components

Responsibilities:

- render UI
- bind user events to hook actions
- use Chakra UI and design system tokens

Should not:

- call repositories or `apiService`
- contain data transformation logic beyond display-only formatting

## 5. Implementation Plan

### Phase 0: Refresh Graph and Baseline

Purpose:

- Make architecture changes safer by using fresh dependency insight.

Tasks:

- Rebuild or register the repo graph for `code-review-graph`.
- Confirm graph stats show a fresh timestamp.
- Use graph impact checks before larger phases when available.
- If graph search remains unavailable, continue with direct source inspection and document the limitation.

Validation:

- `code-review-graph` reports current graph stats for the repo.
- No production files are changed in this phase.

### Phase 1: Extract Blog Mapping Utilities

Purpose:

- Remove duplicated mapping logic from service and repository.

Create a core mapping/domain utility module, for example:

```text
src/core/utils/blog-mapping.utils.ts
```

Move or centralize:

- `extractFirstImageFromMarkdown`
- owner fallback helpers
- reading time calculation
- markdown excerpt mapping
- API post to `BlogPostSummary`
- public post normalization helpers if they are shared

Expected ownership:

- Repository normalizes raw API records.
- Service uses mapping utilities to create domain/UI-ready values.

Files likely affected:

- `src/core/services/blog.service.ts`
- `src/core/repositories/blog.repository.ts`
- `src/core/utils/markdown-preview.utils.ts`
- `src/core/types/blog*.ts`

Validation:

- Public blog list still shows title, excerpt, author, reading time, tags, and featured image.
- No duplicate implementations remain for the same mapping behavior.

### Phase 2: Slim `ApiBlogRepository`

Purpose:

- Make repository responsibilities clear and reduce business logic in data access.

Tasks:

- Keep endpoint calls, cache, API response normalization, and `RepositoryResult` wrapping.
- Remove display-specific transformation from the repository where possible.
- Ensure repository methods return stable raw/domain records that services can map.
- Keep cache behavior equivalent.

Important constraint:

- Do not break existing hooks during this phase. If needed, keep temporary compatibility methods and mark them for later migration.

Validation:

- Existing screens still work.
- Repository no longer owns display-only calculations such as reading time and excerpts after dependent services are migrated.

### Phase 3: Expand `BlogService` as the Main Blog Use-Case Layer

Purpose:

- Provide one service interface for current blog, profile, and editor flows.

Add or refine service methods:

```text
getPublishedArchivePosts(query)
getPublicPostDetail(id)
getPopularTags(limit)
getPublicAuthorProfile(authorId)
getPublicAuthorPosts(authorId, page, limit)
getCurrentUserPosts(status, page, limit)
getEditablePostById(id, currentUserId)
createDraft(input)
updateDraft(id, input)
publishPost(input)
deletePost(id)
```

Behavior:

- Service methods should return domain/UI-ready values or throw meaningful errors.
- Hooks should not inspect `RepositoryResult` after migration.
- Service should own validation and business-level error mapping.

Validation:

- Service methods can be instantiated with a mocked repository.
- Existing exported service getter remains compatible.

### Phase 4: Migrate Public Blog Flows

Purpose:

- Remove direct API calls from public blog hooks.

Tasks:

- Update `useBlogArchive` to call `BlogService`.
- Update `useBlogPostDetail` to call `BlogService`.
- Decide whether `src/features/blog/blog.api.ts` should be removed or converted into repository-only adapter code.
- Preserve current query string behavior for search, tags, and pagination.

Acceptance scenarios:

- `/blog` loads published posts.
- Searching posts works.
- Tag filtering works.
- Pagination works.
- `/blog/:id` loads a post.
- Missing/unpublished post shows the current public not-found message.
- API failures still show appropriate empty/error state.

### Phase 5: Migrate Profile Post Flow

Purpose:

- Move profile post orchestration from hook to service/use-case.

Tasks:

- Replace `getBlogRepository()` calls in `useProfilePosts` with service methods.
- Move published/draft post loading into a service method or profile-specific use-case.
- Keep `resolveFeaturedImages` as either a media service helper or feature utility called by the service.
- Keep pagination state, confirmation prompt, and navigation in the hook.
- Avoid clearing the whole repository cache directly from the hook.

Acceptance scenarios:

- Profile page loads published posts.
- Profile page loads draft posts.
- Published and draft pagination remain independent.
- Deleting a post refreshes relevant lists.
- `media://` cover images still resolve.
- Unauthenticated state clears profile post lists.

### Phase 6: Refactor Editor Save and Editable Post Loading

Purpose:

- Split editor persistence from timer/state concerns.

Create or extend an editor post use-case/service, for example:

```text
src/features/editor/editor-post.service.ts
```

Responsibilities:

- create draft
- update draft
- publish post
- load editable post
- verify ownership
- handle in-flight create locking
- map repository/API errors

Refactor `useAutoSave`:

- keep timers
- keep save status state
- keep validation message state
- call editor service methods
- keep local backup behavior separate from backend save behavior

Refactor `useBlogPost`:

- remove debug `console.log` calls
- delegate editable post loading to service
- delegate ownership check to service where practical
- keep toast and redirect behavior in the hook

Acceptance scenarios:

- New post autosave creates exactly one draft.
- Existing post autosave updates the same draft.
- Publish works for new posts.
- Publish works for existing drafts.
- Backend `400` validation messages still surface.
- Local draft backup still writes and clears `blog_draft_backup`.
- Direct unauthorized edit path still blocks access.
- Editing from profile still works.

### Phase 7: Migrate Navbar Create Flow

Purpose:

- Remove direct repository usage from app layout.

Tasks:

- Replace `getBlogRepository().createPost()` in `Navbar` with a service method.
- Recheck whether the navbar should create a post directly or simply navigate to the editor.
- Avoid client-side slug generation as source of truth unless the backend still requires it.

Acceptance scenarios:

- Existing navbar action behavior is preserved, or intentionally simplified with owner approval.
- No direct repository call remains in `Navbar`.

### Phase 8: Improve DI Wiring

Purpose:

- Make dependency direction explicit and testable.

Tasks:

- Register repositories before services.
- Construct services with explicit repository dependencies.
- Remove service constructor fallbacks to global getters where possible.
- Keep exported getters for compatibility during migration.
- Avoid UI hooks retrieving repositories directly after migration.

Target direction:

```text
container -> repository instance
container -> service(repository instance)
hook -> service getter
```

Acceptance:

- No circular dependency errors.
- Services can be constructed with mock repositories.
- Existing public exports from `src/core` still work.

### Phase 9: Logging Cleanup

Purpose:

- Remove debug noise and align with repo logging rules.

Tasks:

- Remove production `console.log` debug statements from editor/reader flows.
- Keep `console.error` only for meaningful failure paths.
- Avoid adding a logging abstraction unless there is a concrete need.

Validation:

```text
rg "console\\.log" src
```

Expected result:

- No production debug logs, or only intentional documented logs.

## 6. Validation Plan

Run after each major phase:

```text
yarn lint
yarn build
```

Manual validation scenarios:

- Public blog archive loads.
- Blog search works.
- Blog tag filtering works.
- Blog pagination works.
- Blog detail loads.
- Blog detail not-found state works.
- Author archive loads profile and posts.
- Author archive pagination works.
- Profile loads published posts.
- Profile loads draft posts.
- Profile pagination works for both lists.
- Deleting a post refreshes profile lists.
- Cover images from `media://` tokens still resolve.
- Editor creates a new draft through autosave.
- Autosave does not create duplicate drafts.
- Existing draft updates correctly.
- Publish works for new and existing posts.
- Editing from profile works.
- Direct unauthorized edit path blocks access.
- Auth session restore still works.
- `401` still clears token and follows existing auth flow.

## 7. Risks and Mitigation

### Risk: Behavior Changes During Layer Migration

Mitigation:

- Migrate one flow at a time.
- Keep compatibility methods temporarily.
- Run build and manual checks after each phase.

### Risk: Repository and Service Type Mismatch

Mitigation:

- Update interfaces before implementation changes.
- Keep payload types explicit.
- Avoid `any`.

### Risk: Editor Autosave Regression

Mitigation:

- Refactor editor save flow after lower-risk blog/profile phases.
- Preserve in-flight create locking behavior.
- Manually test new post, existing draft, publish, and validation failures.

### Risk: Cache Behavior Changes

Mitigation:

- Keep repository cache behavior equivalent during early phases.
- Avoid hook-level cache clearing.
- Add service-level refresh behavior where needed.

## 8. Out of Scope

- Backend endpoint changes.
- UI redesign.
- New production dependencies.
- Route changes.
- Auth model redesign.
- Adding a full test framework unless separately requested.
- Rewriting all feature modules at once.

## 9. Completion Criteria

The refactor is complete when:

- UI hooks no longer call `apiService` directly when a service exists.
- UI hooks no longer call `getBlogRepository()` directly for blog flows.
- Blog mapping logic has one source of truth.
- Repository responsibilities are limited to API/cache/error wrapping.
- Blog/editor/profile use-cases live in services.
- DI wiring passes dependencies explicitly.
- Debug logs are removed.
- `yarn lint` passes.
- `yarn build` passes.
- Manual validation scenarios pass.

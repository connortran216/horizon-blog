# R6 - Editor Save Flow Refactor

## Header

- Project: Horizon Blog frontend
- Service: Blog editor save and editable-post loading
- Dependencies: R3, R5
- Blockers: service must expose draft create/update, publish, editable-load, and ownership-check behavior

## Context

Editor persistence is currently concentrated in hooks, making autosave and publish behavior hard to reason about. This story separates persistence use cases from timers and UI save state while preserving autosave, publish, validation, and authorized edit behavior. See [plan section 5, Phase 6](../clean-architecture-refactor-plan.md#phase-6-refactor-editor-save-and-editable-post-loading).

## Acceptance Criteria

### Functional Requirements

- New-post autosave creates exactly one draft per editor session.
  - Verify: `rg "createInFlightRef|in-flight|createDraft" src/features/editor src/core/services`
  - Pass: In-flight create locking is preserved in service/use-case or hook with one clear implementation.

- Existing draft autosave updates the same post.
  - Verify: `rg "updateDraft|updatePost|postIdRef|currentPostId" src/features/editor src/core/services`
  - Pass: Existing post ID is reused for draft updates.

- Publish works for both new and existing posts.
  - Verify: `rg "publishPost" src/features/editor src/core/services`
  - Pass: Publish path exists and handles nullable/new post ID.

- Backend validation messages still surface for `400` responses.
  - Verify: `rg "validationMessage|ApiError|status === 400" src/features/editor src/core/services`
  - Pass: Validation state still receives backend `400` messages.

- Unauthorized direct edit still blocks access.
  - Verify: `rg "authorizedEdit|permission|Access Denied|getEditablePostById" src/features/editor src/core/services`
  - Pass: Direct edit path still has ownership/authorized-entry checks.

### Technical Requirements

- `useAutoSave` no longer directly calls `getBlogRepository()`.
  - Verify: `rg "getBlogRepository" src/features/editor/hooks/useAutoSave.ts`
  - Pass: No matches.

- Backend save orchestration lives in an editor service/use-case or `BlogService`.
  - Verify: `rg "createDraft|updateDraft|publishPost|getEditablePostById" src/features/editor src/core/services`
  - Pass: Save orchestration is outside `useAutoSave`.

- Local draft backup is separated from backend save behavior.
  - Verify: `rg "blog_draft_backup|localStorage" src/features/editor src/core/services`
  - Pass: Local backup logic is isolated from backend create/update/publish logic.

### Quality Gates

- Lint passes.
  - Verify: `yarn lint`
  - Pass: Command exits `0`.

- Build passes.
  - Verify: `yarn build`
  - Pass: Command exits `0`.

## Error Handling

- Autosave errors do not interrupt the user with toasts.
  - Verify: `rg "toast|saveStatus|Save failed|auto-saving" src/features/editor/hooks/useAutoSave.ts`
  - Pass: Autosave still updates save state without intrusive toast behavior.

- Publish errors are thrown to the page flow.
  - Verify: `rg "throw new Error|publishPost" src/features/editor src/core/services`
  - Pass: Publish failure remains catchable by the page-level handler.

## Authentication Context

- Editable-post loading requires the current authenticated user ID.
  - Verify: `rg "currentUserId|user.id|getEditablePostById" src/features/editor src/core/services`
  - Pass: Ownership check uses authenticated user identity.

## Interface Contracts

Produces:

```ts
export interface EditorPostInput {
  title: string
  content_markdown: string
  content_json?: string
  tag_names?: string[]
}

export interface EditorPostService {
  loadEditablePost(id: string, currentUserId: number): Promise<PublicPostRecord>
  saveDraft(id: string | null, input: EditorPostInput): Promise<{ post: BlogPost; id: string }>
  publish(id: string | null, input: EditorPostInput): Promise<BlogPost>
}
```

Consumes:

```ts
export interface IBlogService {
  getEditablePostById(id: string, currentUserId: number): Promise<PublicPostRecord>
  createDraft(input: BlogServicePostInput): Promise<BlogPost>
  updateDraft(id: string, input: BlogServicePostInput): Promise<BlogPost>
  publishPost(id: string | null, input: BlogServicePostInput): Promise<BlogPost>
}
```

## Technical Approach

Focus Area: editor write path. Timers and save status are React concerns, while create/update/publish and ownership checks are application use cases. The refactor should be conservative because autosave has race conditions; preserving the existing in-flight create guard is more important than making the abstraction perfect.

## Non-Goals

- Do not redesign the editor UI.
- Do not change markdown as source of truth.
- Do not change backend post creation/update endpoints.

## Definition of Done

- Save orchestration is outside `useAutoSave`.
- Autosave, publish, validation, and authorized edit behavior are preserved.
- Lint and build pass.

## Execution Notes

- Status: Done
- Added `src/features/editor/editor-post.service.ts` to own editable-post loading, draft save, and publish orchestration.
- `useAutoSave` now manages timers, local backup, save state, validation state, and the existing in-flight create guard while delegating backend save/publish to `EditorPostService`.
- `useBlogPost` now loads editable posts through `EditorPostService` and no longer calls the blog repository directly.
- Removed debug `console.log` statements from `useAutoSave` and `useBlogPost` touched paths.
- Validation: `rg "getBlogRepository|RepositoryResult|toRepositoryError|console\\.log" src/features/editor/hooks/useAutoSave.ts src/features/editor/hooks/useBlogPost.ts src/features/editor/editor-post.service.ts` returned no matches.
- Validation: `yarn lint` exited `0`.
- Validation: `yarn build` exited `0`; Vite reported chunk-size warnings only.

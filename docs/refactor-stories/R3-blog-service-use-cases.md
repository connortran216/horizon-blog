# R3 - Blog Service Use-Case Expansion

## Header

- Project: Horizon Blog frontend
- Service: Blog service/use-case layer
- Dependencies: R1, R2
- Blockers: repository contract must expose required data for public, profile, and editor flows

## Context

The UI currently reaches into repositories because `BlogService` does not cover every use case. This story makes `BlogService` the main boundary for blog workflows so hooks can stop handling repository results directly. See [plan section 5, Phase 3](../clean-architecture-refactor-plan.md#phase-3-expand-blogservice-as-the-main-blog-use-case-layer).

## Acceptance Criteria

### Functional Requirements

- `BlogService` exposes use-case methods for public archive, detail, author archive, profile posts, editor loading, draft save, publish, and delete.
  - Verify: `rg "getPublishedArchivePosts|getPublicPostDetail|getPopularTags|getCurrentUserPosts|getEditablePostById|createDraft|updateDraft|publishPost|deletePost" src/core/services/blog.service.ts src/core/types/blog-service.types.ts`
  - Pass: All named methods exist in implementation and interface.

- Migrated hooks can consume service return values without inspecting `RepositoryResult`.
  - Verify: `rg "RepositoryResult" src/features src/components src/app`
  - Pass: No migrated hook imports or checks `RepositoryResult`.

### Technical Requirements

- Service interface defines exact use-case method signatures.
  - Verify: `sed -n '1,240p' src/core/types/blog-service.types.ts`
  - Pass: Interface includes signatures listed in Interface Contracts or intentionally equivalent repo-approved names.

- Service converts repository failures into meaningful thrown errors.
  - Verify: `rg "throw new ApiError|throw new Error" src/core/services/blog.service.ts`
  - Pass: Service has centralized result-to-error handling for new use cases.

### Quality Gates

- Lint passes.
  - Verify: `yarn lint`
  - Pass: Command exits `0`.

- Build passes.
  - Verify: `yarn build`
  - Pass: Command exits `0`.

## Error Handling

- Preserve `ApiError.status` for `400`, `401`, `403`, and `404`.
  - Verify: `rg "statusCode|ApiError" src/core/services/blog.service.ts`
  - Pass: Service maps repository status codes into `ApiError` where hooks need status-aware UI.

## Interface Contracts

Produces:

```ts
export interface BlogServicePostInput {
  title: string
  content_markdown: string
  content_json?: string
  tag_names?: string[]
}

export interface IBlogService {
  getPublishedArchivePosts(options: BlogArchiveOptions): Promise<PublicPostsPage>
  getPublicPostDetail(id: string): Promise<PublicPostRecord>
  getPopularTags(limit?: number): Promise<PublicPostTag[]>
  getCurrentUserPostsPage(
    status: 'draft' | 'published',
    page: number,
    limit: number,
  ): Promise<{ posts: BlogPostSummary[]; page: number; limit: number; total: number }>
  getEditablePostById(id: string, currentUserId: number): Promise<PublicPostRecord>
  createDraft(input: BlogServicePostInput): Promise<BlogPost>
  updateDraft(id: string, input: BlogServicePostInput): Promise<BlogPost>
  publishPost(id: string | null, input: BlogServicePostInput): Promise<BlogPost>
  deletePost(id: string): Promise<void>
}
```

Consumes:

```ts
import { IBlogRepository } from './blog-repository.types'
```

## Technical Approach

Focus Area: use-case boundary. The service should hide repository result mechanics because hooks need behavior, not persistence detail. The service can remain in `src/core/services` for now to match existing architecture, while editor/profile-specific orchestration can later move closer to features if needed.

## Non-Goals

- Do not redesign blog types globally.
- Do not change API routes.
- Do not refactor every hook in this story.

## Definition of Done

- Service interface covers required workflows.
- Repository errors are mapped consistently.
- Lint and build pass.

## Execution Notes

- Status: Done
- Added public archive page contracts: `BlogArchiveOptions` and `PublicPostsPage`.
- Added repository methods for raw published post pages, raw public post detail, raw search pages, and popular tags.
- Added service use cases for public archive, public detail, popular tags, current-user post pages, editable-post loading, draft create/update, publish, and delete-or-throw.
- Public archive/detail service methods intentionally return `PublicPostRecord` shapes so R4 can migrate hooks without changing the current blog UI components.
- Repository failures are converted to thrown `Error` or `ApiError` in new service use cases.
- Validation: `yarn lint` exited `0`.
- Validation: `yarn build` exited `0`; Vite reported chunk-size warnings only.

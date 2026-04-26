# R5 - Profile Post Flow Migration

## Header

- Project: Horizon Blog frontend
- Service: Profile post list and deletion
- Dependencies: R3
- Blockers: service must expose current-user posts and delete use cases

## Context

The profile post hook currently loads published and draft posts directly from the repository and also resolves media covers. This story moves persistence orchestration behind the service layer while keeping profile UI state, pagination, routing, and confirmation prompts in the hook. See [plan section 5, Phase 5](../clean-architecture-refactor-plan.md#phase-5-migrate-profile-post-flow).

## Acceptance Criteria

### Functional Requirements

- Published and draft profile lists still load independently.
  - Verify: `yarn build`
  - Pass: Profile page compiles and `useProfilePosts` still returns both `publishedBlogs` and `draftBlogs`.

- Published and draft pagination remain independent.
  - Verify: `rg "publishedPagination|draftPagination|handlePublishedPageChange|handleDraftPageChange" src/features/profile/useProfilePosts.ts`
  - Pass: Hook still owns separate pagination state and handlers.

- Deleting a post refreshes profile lists.
  - Verify: `rg "handleDelete|deletePost|loadBlogs|refresh" src/features/profile/useProfilePosts.ts src/core/services/blog.service.ts`
  - Pass: Delete flow calls a service method and reloads or refreshes list state.

- `media://` cover images still resolve.
  - Verify: `rg "resolveMediaUrls|media://" src/features/profile src/features/media src/core`
  - Pass: Profile post mapping still resolves media token cover images.

### Technical Requirements

- `useProfilePosts` does not call `getBlogRepository()` directly.
  - Verify: `rg "getBlogRepository" src/features/profile/useProfilePosts.ts`
  - Pass: No matches.

- `useProfilePosts` does not inspect `RepositoryResult`.
  - Verify: `rg "success|metadata|RepositoryResult" src/features/profile/useProfilePosts.ts`
  - Pass: No repository-result handling remains in the hook.

### Quality Gates

- Lint passes.
  - Verify: `yarn lint`
  - Pass: Command exits `0`.

- Build passes.
  - Verify: `yarn build`
  - Pass: Command exits `0`.

## Error Handling

- Delete failures remain non-crashing and visible in logs or UI state.
  - Verify: `rg "catch|console.error|deletePost" src/features/profile/useProfilePosts.ts src/core/services/blog.service.ts`
  - Pass: Delete errors are caught and do not leave the UI in a loading state.

## Interface Contracts

Consumes:

```ts
export interface IBlogService {
  getCurrentUserPosts(
    status: 'draft' | 'published',
    page: number,
    limit: number,
  ): Promise<{ posts: BlogPostSummary[]; page: number; limit: number; total: number }>
  deletePost(id: string): Promise<void>
}
```

Produces:

```ts
export interface UseProfilePostsResult {
  postsLoading: boolean
  publishedBlogs: ProfileBlogPost[]
  draftBlogs: ProfileBlogPost[]
  publishedPagination: ProfilePaginationState
  draftPagination: ProfilePaginationState
  handlePublishedPageChange: (page: number) => void
  handleDraftPageChange: (page: number) => void
  handleEdit: (blogId: string) => void
  handleDelete: (blogId: string) => Promise<void>
}
```

## Technical Approach

Focus Area: authenticated profile read/write path. The service should own loading and deleting posts because those are application use cases, while the hook should keep pagination and navigation because those are UI concerns. Media resolution can remain a feature utility until a dedicated media service boundary is justified.

## Non-Goals

- Do not redesign profile UI.
- Do not change post ownership rules.
- Do not change media upload/resolve API.

## Definition of Done

- Profile post hook no longer depends on repository directly.
- Profile lists, pagination, deletion, and cover images still work.
- Lint and build pass.


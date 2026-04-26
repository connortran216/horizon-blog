# R2 - Repository Responsibility Cleanup

## Header

- Project: Horizon Blog frontend
- Service: Blog repository
- Dependencies: R1
- Blockers: temporary compatibility may be needed while hooks still consume repository-shaped data

## Context

The blog repository currently mixes API access with display/business transformation. This story narrows repository responsibility to endpoint calls, raw response normalization, caching, and `RepositoryResult` wrapping. See [plan section 5, Phase 2](../clean-architecture-refactor-plan.md#phase-2-slim-apiblogrepository).

## Acceptance Criteria

### Functional Requirements

- Existing public and profile blog screens still receive compatible data during migration.
  - Verify: `yarn build`
  - Pass: All current consumers compile without type errors.

- Cache behavior remains available for published posts, post detail, and current-user posts.
  - Verify: `rg "generateCacheKey|getFromCache|setCache|clearCache" src/core/repositories/blog.repository.ts`
  - Pass: Repository still has explicit cache read/write/clear behavior.

### Technical Requirements

- Repository methods keep returning `RepositoryResult<T>`.
  - Verify: `rg "Promise<RepositoryResult" src/core/repositories/blog.repository.ts src/core/types/blog-repository.types.ts`
  - Pass: Blog repository contract remains result-based.

- Display-only calculations are removed from repository after service consumers are ready.
  - Verify: `rg "readingTime|generateExcerpt|buildExcerptFromMarkdown|calculateReadingTime" src/core/repositories/blog.repository.ts`
  - Pass: Matches are absent or only in documented temporary compatibility paths.

### Quality Gates

- Lint passes.
  - Verify: `yarn lint`
  - Pass: Command exits `0`.

- Build passes.
  - Verify: `yarn build`
  - Pass: Command exits `0`.

## Interface Contracts

Produces:

```ts
export interface RepositoryResult<T> {
  success: boolean
  data?: T
  error?: string
  statusCode?: number
  metadata?: {
    page?: number
    limit?: number
    total?: number
    hasNext?: boolean
    hasPrev?: boolean
  }
}
```

Consumes:

```ts
export interface IBlogRepository {
  getPublishedPosts(options?: BlogSearchOptions): Promise<RepositoryResult<BlogPostSummary[]>>
  getPostById(id: string): Promise<RepositoryResult<BlogPost>>
  getCurrentUserPosts(
    status?: 'draft' | 'published',
    page?: number,
    limit?: number,
  ): Promise<RepositoryResult<BlogPostSummary[]>>
}
```

## Technical Approach

Focus Area: data access boundary. The repository remains result-based because that pattern already exists and keeps transport errors out of the UI layer. Compatibility methods can remain briefly, but they must be marked as transitional so later stories can remove direct UI reliance on them.

## Non-Goals

- Do not remove caching.
- Do not change API endpoints.
- Do not migrate all UI hooks in this story.

## Definition of Done

- Repository responsibilities are narrower.
- Temporary compatibility is documented if needed.
- Lint and build pass.


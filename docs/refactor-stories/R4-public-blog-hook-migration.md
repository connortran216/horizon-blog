# R4 - Public Blog Hook Migration

## Header

- Project: Horizon Blog frontend
- Service: Public blog archive and detail
- Dependencies: R3
- Blockers: `BlogService` must expose archive, tags, and detail methods

## Context

Public blog hooks currently bypass the service layer and call API helpers directly. This story moves public blog data access behind `BlogService` while preserving search, tag filtering, pagination, detail loading, and not-found behavior. See [plan section 5, Phase 4](../clean-architecture-refactor-plan.md#phase-4-migrate-public-blog-flows).

## Acceptance Criteria

### Functional Requirements

- Public archive still loads published posts.
  - Verify: `yarn build`
  - Pass: `/blog` route consumers compile and archive hook returns posts.

- Search, tag filtering, and pagination query behavior are preserved.
  - Verify: `rg "useSearchParams|setSearchParams|tags|page|q" src/features/blog/useBlogArchive.ts`
  - Pass: Hook still owns URL query state for `q`, `tags`, and `page`.

- Public detail still shows the existing not-found message for missing/unpublished posts.
  - Verify: `rg "This post is not published or is no longer available" src/features/blog/useBlogPostDetail.ts src/core/services/blog.service.ts`
  - Pass: Message remains available to the detail UI path.

### Technical Requirements

- `useBlogArchive` does not import `apiService` or feature API helpers.
  - Verify: `rg "apiService|fetchBlogArchivePosts|fetchPopularTags" src/features/blog/useBlogArchive.ts`
  - Pass: No matches.

- `useBlogPostDetail` does not import `apiService`.
  - Verify: `rg "apiService" src/features/blog/useBlogPostDetail.ts`
  - Pass: No matches.

- `blog.api.ts` is removed or documented as a repository adapter.
  - Verify: `test ! -f src/features/blog/blog.api.ts || rg "repository adapter|TODO|deprecated|transitional" src/features/blog/blog.api.ts`
  - Pass: File is gone or explicitly marked with its boundary purpose.

### Quality Gates

- Lint passes.
  - Verify: `yarn lint`
  - Pass: Command exits `0`.

- Build passes.
  - Verify: `yarn build`
  - Pass: Command exits `0`.

## Error Handling

- Preserve status-aware handling for public detail errors.
  - Verify: `rg "statusCode|ApiError" src/features/blog/useBlogPostDetail.ts src/core/services/blog.service.ts`
  - Pass: Hook can still distinguish `404` from generic load failure.

## Interface Contracts

Consumes:

```ts
export interface IBlogService {
  getPublishedArchivePosts(options: BlogSearchOptions): Promise<BlogPostSummary[]>
  getPublicPostDetail(id: string): Promise<BlogPost>
  getPopularTags(limit?: number): Promise<BlogArchiveTag[]>
}
```

Produces:

```ts
export interface UseBlogArchiveResult {
  searchInput: string
  setSearchInput: (value: string) => void
  query: string
  posts: BlogArchivePost[]
  popularTags: BlogArchiveTag[]
  loading: boolean
  tagsLoading: boolean
  page: number
  totalPages: number
  total: number
  activeTags: string[]
  hasActiveFilters: boolean
  setPage: (page: number) => void
  toggleTag: (tagName: string) => void
  clearQuery: () => void
  removeTag: (tagName: string) => void
  clearAllFilters: () => void
}
```

## Technical Approach

Focus Area: public read path. The hook should keep browser-state behavior because URL search params are UI concerns, while the service should own fetching and mapping. This keeps route behavior stable while removing transport details from the hook.

## Non-Goals

- Do not redesign blog archive UI.
- Do not change route paths.
- Do not change backend search behavior.

## Definition of Done

- Public blog hooks use service methods.
- Public archive and detail behavior are unchanged.
- Lint and build pass.

## Execution Notes

- Status: Done
- `useBlogArchive` now calls `getBlogService().getPublishedArchivePosts()` and `getBlogService().getPopularTags()`.
- `useBlogPostDetail` now calls `getBlogService().getPublicPostDetail()`.
- Removed `src/features/blog/blog.api.ts` because no public blog hook depends on direct feature API helpers.
- URL query state for `q`, `tags`, and `page` remains owned by `useBlogArchive`.
- Validation: direct API/helper search in migrated hooks returned no matches.
- Validation: `test ! -f src/features/blog/blog.api.ts` passed.
- Validation: `yarn lint` exited `0`.
- Validation: `yarn build` exited `0`; Vite reported chunk-size warnings only.

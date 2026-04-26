# R1 - Blog Mapping Single Source of Truth

## Header

- Project: Horizon Blog frontend
- Service: Blog domain mapping
- Dependencies: R0
- Blockers: unclear API field shape for legacy `owner` vs `user` fallback

## Context

Blog mapping is duplicated between repository and service code, making behavior drift likely when fields change. This story creates one source of truth for blog display mapping while preserving current card/detail output. See [plan section 5, Phase 1](../clean-architecture-refactor-plan.md#phase-1-extract-blog-mapping-utilities).

## Acceptance Criteria

### Functional Requirements

- Blog summary mapping still includes title, author, excerpt, reading time, tags, status, slug, and featured image.
  - Verify: `yarn build`
  - Pass: TypeScript compiles with all existing `BlogPostSummary` consumers.

- First image extraction supports current markdown image syntax and existing inline HTML image syntax.
  - Verify: `rg "extractFirstImageFromMarkdown|first image|featuredImage" src/core src/features`
  - Pass: Only the shared mapping utility owns first-image extraction logic.

### Technical Requirements

- Create a shared mapping utility in the core layer.
  - Verify: `test -f src/core/utils/blog-mapping.utils.ts`
  - Pass: File exists and exports the mapping functions listed in Interface Contracts.

- Remove duplicate owner, image, reading-time, and summary mapping implementations from `BlogService` and `ApiBlogRepository`.
  - Verify: `rg "getPostOwnerName|getPostOwnerAvatar|getPostOwnerId|extractFirstImageFromMarkdown|calculateReadingTime" src/core/services/blog.service.ts src/core/repositories/blog.repository.ts`
  - Pass: Matches are imports/usages only, not duplicate private implementations.

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
export interface BlogMappingConfig {
  excerptLength?: number
  wordsPerMinute?: number
}

export function extractFirstImageFromMarkdown(content: string): string | undefined

export function mapApiPostToSummary(
  post: ApiBlogPost,
  config?: BlogMappingConfig,
): BlogPostSummary

export function calculateReadingTime(content: string, wordsPerMinute?: number): number
```

Consumes:

```ts
import { ApiBlogPost } from '../types/blog-service.types'
import { BlogPostSummary } from '../types/blog.types'
```

## Technical Approach

Focus Area: domain mapping. The mapping utility should be pure and framework-free so repositories, services, and future tests can reuse it without React or API transport dependencies. The key tradeoff is keeping mapping in `src/core/utils` for now instead of introducing a larger domain folder before the architecture is stable.

## Non-Goals

- Do not change backend payloads.
- Do not change blog card design.
- Do not introduce a new validation library.

## Definition of Done

- Shared mapper exists.
- Duplicate mapper logic is removed from service/repository.
- Lint and build pass.


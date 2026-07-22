# Tasks: Public Post Codes

## Phase 1: Setup

- [x] T001 Confirm no new dependency or backend change is required in specs/009-public-post-codes/research.md
- [x] T002 Verify current ignore and lint coverage for the shared JavaScript module in .gitignore and eslint.config.js

## Phase 2: Foundational Codec

- [x] T003 Add failing stability, round-trip, boundary, and invalid-input tests in src/core/utils/public-post-code.test.ts
- [x] T004 Implement the shared reversible codec and public path helper in src/core/utils/public-post-code.mjs
- [x] T005 Export the shared public-code contract from src/core/index.ts and scripts/seo/urls.mjs

## Phase 3: User Story 1 - Coded Public Links

**Goal**: Every reader-facing URL producer uses the same opaque code.

**Independent Test**: Render representative React links and SEO documents for post 88; every article URL uses one matching coded path.

- [x] T006 [P] [US1] Update public React link producers and focused assertions under src/app and src/features
- [x] T007 [P] [US1] Update crawler fallback links in scripts/seo/render.mjs and scripts/seo/render.test.mjs
- [x] T008 [P] [US1] Update canonical and structured-data article URLs in scripts/seo/metadata.mjs and scripts/seo/metadata.test.mjs
- [x] T009 [P] [US1] Update sitemap and RSS article URLs in scripts/seo/feeds.mjs and scripts/seo/feeds.test.mjs

## Phase 4: User Story 2 - Legacy Route Compatibility

**Goal**: Coded routes resolve correctly, numeric routes redirect, and malformed codes fail closed.

**Independent Test**: A coded URL loads post 88, `/blog/88` returns a permanent coded redirect, and malformed codes return not found without loading a post.

- [x] T010 [US2] Add coded, legacy, and invalid route classification regressions in scripts/seo/urls.test.mjs
- [x] T011 [US2] Implement coded classification and permanent numeric redirects in scripts/seo/urls.mjs and scripts/seo/server.mjs
- [x] T012 [US2] Add gateway redirect and coded rendering regressions in scripts/seo/server.test.mjs
- [x] T013 [US2] Decode and normalize the public React detail route with shared resolver regressions in src/features/blog/useBlogPostDetail.ts and src/core/utils/public-post-code.test.ts

## Phase 5: User Story 3 - Internal ID Stability

**Goal**: Internal and protected flows retain decimal IDs.

**Independent Test**: The public reader calls the current blog service with the decoded ID while profile, analytics, related-post, interaction, and SEO image paths remain numeric.

- [x] T014 [US3] Verify numeric service and protected-route boundaries with targeted searches and focused existing tests under src/features and scripts/seo

## Phase 6: Polish and Cross-Cutting Validation

- [x] T015 Run focused codec, React link, route, metadata, feed, render, and gateway tests from specs/009-public-post-codes/quickstart.md
- [x] T016 Run type check, lint, build, and diff validation from specs/009-public-post-codes/quickstart.md
- [x] T017 Record execution results and remaining caveats in specs/009-public-post-codes/tasks.md

## Dependencies

- Phase 2 blocks all user stories.
- User Story 1 and the route-classification tests in User Story 2 can proceed after the codec contract is stable.
- User Story 2 gateway behavior depends on the URL helper exports from T005.
- User Story 3 validation depends on the completed public route boundary.
- Final validation depends on all stories.

## Parallel Opportunities

- T006, T007, T008, and T009 touch independent public URL producers after T005.
- Focused tests for React links and SEO modules may run independently before the combined gate.

## Implementation Strategy

1. Stabilize the shared codec with fixed-vector tests.
2. Replace public URL output boundaries without changing service calls.
3. Add coded input resolution and numeric compatibility redirects.
4. Prove internal numeric boundaries remain unchanged.
5. Run focused checks, then the required build gate.

## MVP Scope

User Stories 1 and 2 together form the minimum safe release: coded URLs without legacy redirects would break existing links, while redirects without consistent URL producers would preserve duplicate numeric navigation.

## Execution Results

- `yarn test scripts/seo src/core/utils/public-post-code.test.ts src/features/home/components/StoryCard.test.tsx src/features/blog/components/blog-summary-cards.test.tsx`: passed, 10 files and 77 tests.
- `yarn tsc --noEmit`: passed.
- `yarn lint`: passed.
- `yarn build`: passed; Vite retained its existing large-chunk advisory.
- `git diff --check`: passed.
- Targeted source search confirmed remaining numeric blog paths are compatibility tests, user-authored Markdown fixtures, generic share/parser fixtures, or protected profile/analytics routes.
- Production preview was not started because the repository contract reserves runtime startup for the owner; gateway behavior is covered by ephemeral HTTP integration tests.

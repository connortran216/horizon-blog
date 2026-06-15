# Tasks: SEO Rendering Gateway

## Phase 1: Setup

- [ ] T001 Update the active Spec Kit plan marker in `AGENTS.md`
- [ ] T002 Create the SEO module directory and test file structure under `scripts/seo/`

## Phase 2: Foundational

- [ ] T003 Write failing URL/origin and route-policy tests in `scripts/seo/urls.test.mjs`
- [ ] T004 Implement configuration and URL/route policy in `scripts/seo/config.mjs` and `scripts/seo/urls.mjs`
- [ ] T005 Write failing metadata and JSON-LD tests in `scripts/seo/metadata.test.mjs`
- [ ] T006 Implement escaped metadata and structured-data generation in `scripts/seo/metadata.mjs`

## Phase 3: User Story 1 - Discover every published article

**Independent test**: Sitemap and RSS contain all published canonical URLs once; robots is valid text; no private/draft URLs appear.

- [ ] T007 [P] [US1] Write failing backend normalization/cache tests in `scripts/seo/backend.test.mjs`
- [ ] T008 [US1] Implement published post, author, media, timeout, and cache adapters in `scripts/seo/backend.mjs`
- [ ] T009 [P] [US1] Write failing robots, sitemap, and RSS tests in `scripts/seo/feeds.test.mjs`
- [ ] T010 [US1] Implement discovery document generation in `scripts/seo/feeds.mjs`

## Phase 4: User Story 2 - Understand an article without JavaScript

**Independent test**: A server-rendered published article contains safe semantic HTML and at least 95% of readable source text.

- [ ] T011 [P] [US2] Write failing Markdown safety and semantic fragment tests in `scripts/seo/content.test.mjs`
- [ ] T012 [US2] Implement safe Markdown parsing, excerpts, reading time, and article fragments in `scripts/seo/content.mjs`
- [ ] T013 [P] [US2] Write failing public page fallback tests in `scripts/seo/render.test.mjs`
- [ ] T014 [US2] Implement home, archive, article, author, and static semantic fallback rendering in `scripts/seo/render.mjs`

## Phase 5: User Story 3 - Receive accurate search-result information

**Independent test**: Representative route documents contain one canonical, unique metadata, stable images, and valid page-specific JSON-LD.

- [ ] T015 [US3] Extend metadata tests for WebSite, Blog, BlogPosting, ProfilePage, Person, and BreadcrumbList in `scripts/seo/metadata.test.mjs`
- [ ] T016 [US3] Implement complete route metadata and JSON-LD graphs in `scripts/seo/metadata.mjs`
- [ ] T017 [US3] Add document injection tests and implementation in `scripts/seo/render.test.mjs` and `scripts/seo/render.mjs`

## Phase 6: User Story 4 - Keep private and duplicate pages out of search

**Independent test**: Private/filter routes are noindex; valid pagination has canonical/prev/next; unknown routes/assets are 404.

- [ ] T018 [US4] Extend route-policy tests for private, filtered, tracking, pagination, malformed, and missing routes in `scripts/seo/urls.test.mjs`
- [ ] T019 [US4] Implement final indexing and canonical route policy in `scripts/seo/urls.mjs`
- [ ] T020 [US4] Write failing HTTP integration tests for private routes, soft 404s, missing assets, and HEAD in `scripts/seo/server.test.mjs`

## Phase 7: User Story 5 - Preserve reliable access during failures

**Independent test**: Backend 404 maps to 404, transient failures map to 503 or valid stale content, and unsupported methods return 405.

- [ ] T021 [US5] Extend integration tests for 404, 503, stale cache, 405, and HEAD in `scripts/seo/server.test.mjs`
- [ ] T022 [US5] Implement the composable HTTP gateway, asset policy, security headers, and stable image proxy in `scripts/seo/server.mjs`
- [ ] T023 [US5] Replace `scripts/serve-with-meta.mjs` with the thin production entry point

## Phase 8: Polish and Cross-Cutting Verification

- [ ] T024 Run targeted SEO tests and fix all failures under `scripts/seo/`
- [ ] T025 Run the complete Vitest suite, lint, type check, format check, and production build from `package.json`
- [ ] T026 Run the local production response matrix from `specs/007-seo-rendering-gateway/quickstart.md`
- [ ] T027 Verify React takeover and public navigation against `http://127.0.0.1:3100`
- [ ] T028 Record execution notes and validation evidence in `specs/007-seo-rendering-gateway/tasks.md`

## Dependencies

- T003-T006 block all story implementation.
- T007-T010 and T011-T014 may proceed in parallel by module.
- T015-T019 require foundational metadata/URL behavior and public data/content representations.
- T020-T023 require every composed module.
- T024-T028 require implementation completion.

## Parallel Opportunities

- T007/T009 and T011/T013 can be authored independently.
- Backend/discovery work and Markdown/rendering work touch separate modules.
- Pure unit suites can run in parallel before server integration.

## Implementation Strategy

Complete the foundation, then deliver discovery and crawler-readable article HTML before composing the full server. Maintain red-green-refactor for each task. The first deployable increment is US1 plus US2, but the feature is complete only after all stories and verification gates pass.

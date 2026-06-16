# Tasks: SEO Rendering Gateway

## Phase 1: Setup

- [x] T001 Update the active Spec Kit plan marker in `AGENTS.md`
- [x] T002 Create the SEO module directory and test file structure under `scripts/seo/`

## Phase 2: Foundational

- [x] T003 Write failing URL/origin and route-policy tests in `scripts/seo/urls.test.mjs`
- [x] T004 Implement configuration and URL/route policy in `scripts/seo/config.mjs` and `scripts/seo/urls.mjs`
- [x] T005 Write failing metadata and JSON-LD tests in `scripts/seo/metadata.test.mjs`
- [x] T006 Implement escaped metadata and structured-data generation in `scripts/seo/metadata.mjs`

## Phase 3: User Story 1 - Discover every published article

**Independent test**: Sitemap and RSS contain all published canonical URLs once; robots is valid text; no private/draft URLs appear.

- [x] T007 [P] [US1] Write failing backend normalization/cache tests in `scripts/seo/backend.test.mjs`
- [x] T008 [US1] Implement published post, author, media, timeout, and cache adapters in `scripts/seo/backend.mjs`
- [x] T009 [P] [US1] Write failing robots, sitemap, and RSS tests in `scripts/seo/feeds.test.mjs`
- [x] T010 [US1] Implement discovery document generation in `scripts/seo/feeds.mjs`

## Phase 4: User Story 2 - Understand an article without JavaScript

**Independent test**: A server-rendered published article contains safe semantic HTML and at least 95% of readable source text.

- [x] T011 [P] [US2] Write failing Markdown safety and semantic fragment tests in `scripts/seo/content.test.mjs`
- [x] T012 [US2] Implement safe Markdown parsing, excerpts, reading time, and article fragments in `scripts/seo/content.mjs`
- [x] T013 [P] [US2] Write failing public page fallback tests in `scripts/seo/render.test.mjs`
- [x] T014 [US2] Implement home, archive, article, author, and static semantic fallback rendering in `scripts/seo/render.mjs`

## Phase 5: User Story 3 - Receive accurate search-result information

**Independent test**: Representative route documents contain one canonical, unique metadata, stable images, and valid page-specific JSON-LD.

- [x] T015 [US3] Extend metadata tests for WebSite, Blog, BlogPosting, ProfilePage, Person, and BreadcrumbList in `scripts/seo/metadata.test.mjs`
- [x] T016 [US3] Implement complete route metadata and JSON-LD graphs in `scripts/seo/metadata.mjs`
- [x] T017 [US3] Add document injection tests and implementation in `scripts/seo/render.test.mjs` and `scripts/seo/render.mjs`

## Phase 6: User Story 4 - Keep private and duplicate pages out of search

**Independent test**: Private/filter routes are noindex; valid pagination has canonical/prev/next; unknown routes/assets are 404.

- [x] T018 [US4] Extend route-policy tests for private, filtered, tracking, pagination, malformed, and missing routes in `scripts/seo/urls.test.mjs`
- [x] T019 [US4] Implement final indexing and canonical route policy in `scripts/seo/urls.mjs`
- [x] T020 [US4] Write failing HTTP integration tests for private routes, soft 404s, missing assets, and HEAD in `scripts/seo/server.test.mjs`

## Phase 7: User Story 5 - Preserve reliable access during failures

**Independent test**: Backend 404 maps to 404, transient failures map to 503 or valid stale content, and unsupported methods return 405.

- [x] T021 [US5] Extend integration tests for 404, 503, stale cache, 405, and HEAD in `scripts/seo/server.test.mjs`
- [x] T022 [US5] Implement the composable HTTP gateway, asset policy, security headers, and stable image proxy in `scripts/seo/server.mjs`
- [x] T023 [US5] Replace `scripts/serve-with-meta.mjs` with the thin production entry point

## Phase 8: Polish and Cross-Cutting Verification

- [x] T024 Run targeted SEO tests and fix all failures under `scripts/seo/`
- [x] T025 Run the complete Vitest suite, lint, type check, format check, and production build from `package.json`
- [x] T026 Run the local production response matrix from `specs/007-seo-rendering-gateway/quickstart.md`
- [x] T027 Verify React takeover and public navigation against `http://127.0.0.1:3100`
- [x] T028 Record execution notes and validation evidence in `specs/007-seo-rendering-gateway/tasks.md`
- [x] T029 Keep managed metadata synchronized after React Router navigation
- [x] T030 Include every canonical blog and author pagination page in the sitemap
- [x] T031 Enrich author, article, social-image, and image-sitemap metadata
- [x] T032 Harden the stable image proxy with redirect validation, bounded reads, and sandboxed SVG responses
- [x] T033 Remove eager optional editor/Markdown chunk preloads and scope CV fonts to the CV route
- [x] T034 Improve public-page contrast and add intrinsic brand-logo dimensions
- [x] T035 Use compact published summaries for public listing pages and normalize excerpt metadata
- [x] T036 Restore legacy Medium article links and verify every sitemap/internal crawl target
- [x] T037 Measure the optimized production gateway with Lighthouse and live response timings
- [x] T038 Defer the full SPA entry on public pages until authentication, interaction, or timeout
- [x] T039 Keep private routes immediate and omit application loading from 404/503 documents
- [x] T040 Add accessible fallback presentation and 44px standalone article-link targets

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

## Execution Notes

- TDD evidence: each new module suite was run red for a missing module or behavior before implementation, then rerun green.
- Targeted SEO verification: 7 test files and 36 tests passed before final hardening; final server coverage adds the `/index.html` canonical redirect.
- Full repository verification: 31 test files and 92 tests passed before final hardening; the final fresh run is recorded at handoff.
- Local response matrix: home, archive, article, author, filtered, private, missing route, missing asset, robots, sitemap, RSS, HEAD, image, and canonical index redirect passed.
- Published-content sweep: all 26 published articles returned one canonical, stable same-origin image metadata, parseable JSON-LD, and 100% normalized word coverage in semantic fallback HTML.
- Index control sweep: 10 private routes returned `noindex,nofollow`; canonical pagination/static variants returned one canonical; five invalid/missing variants returned 404.
- Browser verification: the in-app browser confirmed React replaces the fallback without duplicate visible content, then navigated through the archive, article 76, the Connor Tran author archive, reaction/share controls, and a filtered archive using real public data through a temporary local API relay.
- Client metadata verification: after React Router navigation, article and author title, canonical, Open Graph URL, robots policy, and JSON-LD matched the destination route; `/blog?q=api` switched to `noindex,follow` with the clean `/blog` canonical.
- Browser console verification: zero warning or error entries were recorded after the navigation matrix.
- Final automated verification: 35 test files and 109 tests passed; lint, type check, formatting, syntax checks, diff checks, and the production build passed.
- Final discovery sweep: the sitemap exposed 38 canonical URLs for 26 published articles, all pagination pages, and 22 article image entries; all 84 structured-data blocks parsed successfully.
- Final image sweep: all 22 sitemap image URLs returned bounded raster or sandboxed SVG image responses from the stable same-origin proxy.
- Listing payload optimization: `/posts/summaries` reduced the first-page backend payload from 197,577 bytes to 13,573 bytes (about 93%) while preserving titles, excerpts, authors, tags, reading time, dates, and image availability.
- Local gateway timings: uncached listing responses completed in 0.15-0.37 seconds during the final sample and cached responses completed in about 0.002 seconds.
- Lighthouse mobile comparison: performance improved from 55 to 64, accessibility from 96 to 100, FCP from 15.7 seconds to 3.6 seconds, LCP from 17.4 seconds to 5.0 seconds, and transfer size from 3.07 MB to 0.75 MB; SEO remained 100.
- Crawl verification: all 38 sitemap URLs and 83 discovered internal links returned valid responses after restoring a legacy root-relative Medium article URL.
- Deferred hydration response policy: all seven public route classes contain semantic fallback HTML and one deferred entry loader with no eager module request; private routes retain immediate entry loading; 404 and 503 documents contain no application loader.
- Browser runtime verification: the public entry had zero requests after 1.5 seconds, interaction requested the main entry exactly once and replaced the fallback, authenticated sessions loaded immediately, private pages loaded immediately, and the no-interaction timeout took over at about 8.1 seconds.
- Final public crawl after deferred hydration: 38 canonical URLs, 22 image URLs, 83 internal links, and 84 JSON-LD blocks passed with no eager public entry scripts or crawl failures.
- Final mobile Lighthouse home: Performance 100, Accessibility 100, Best Practices 100, SEO 100, FCP 0.75 seconds, LCP 1.43 seconds, TBT 0, CLS 0, 87 KB transferred, five requests, and zero unused JavaScript.
- Final mobile Lighthouse archive: all four category scores 100, FCP 0.75 seconds, LCP 1.43 seconds, TBT 0, CLS 0, and 87 KB transferred.
- Final mobile Lighthouse article 76: all four category scores 100, FCP 0.90 seconds, LCP 1.50 seconds, TBT 0, CLS 0, and 102 KB transferred.

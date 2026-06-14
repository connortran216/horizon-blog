# Tasks: Performance Optimization Frontend

**Input**: [spec.md](./spec.md), [plan.md](./plan.md), [approved design](../../docs/superpowers/specs/2026-06-13-performance-optimization-design.md)

## Phase 1: Story 01 - Summary Data Boundary

**Independent Test**: Repository mapping returns complete card summaries without receiving or parsing markdown.

- [x] T001 [US1] Add failing backend-summary contract and endpoint-selection tests in `src/core/repositories/blog.repository.performance.test.ts`
- [x] T002 [US1] Define summary API response types in `src/core/types/blog.types.ts` and related service/repository type modules
- [x] T003 [US1] Add a direct API-summary-to-`BlogPostSummary` mapper in `src/core/utils/blog-mapping.utils.ts`
- [x] T004 [US1] Add a dedicated summary request/normalizer with a non-colliding cache key in `src/core/repositories/blog.repository.ts`
- [x] T005 [US1] Expose the summary listing through `src/core/services/blog.service.ts` without changing full-post/search methods
- [x] T006 [US1] Add optional cover/avatar/tag/timestamp and pagination test cases
- [x] T007 [US1] Run focused repository/service tests, lint, and type checking; record results in `stories/checklist.md`

## Phase 2: Story 02 - Home and Archive Consumption

**Independent Test**: Home and unfiltered archive render existing card information from summaries while filtered/search flows retain their contracts.

- [x] T008 [US1] Add failing home and archive tests proving summary selection and filtered-flow compatibility
- [x] T009 [US1] Switch `src/features/home/pages/HomePage.tsx` to consume summary objects without synthesizing empty `content_markdown`
- [x] T010 [US1] Switch the unfiltered path in `src/features/blog/useBlogArchive.ts` to the summary service method
- [x] T011 [US1] Preserve search/active-filter behavior on existing full/search contracts in `src/features/blog/useBlogArchive.ts`
- [x] T012 [US1] Update `src/features/blog/components/FeaturedStory.tsx` and `EditorialCard.tsx` to consume excerpt, reading time, and cover summary fields
- [x] T013 [P] [US1] Add card fallback tests for absent cover, avatar, tags, and publication time
- [x] T014 [US1] Run home/archive/component tests, lint, type checking, and format; record results in `stories/checklist.md`

## Phase 3: Story 03 - Analytics Delivery Batching

**Independent Test**: Active-time and progress events queue together, routine delivery occurs at most every 30 seconds, and concurrent flush triggers produce one active request.

- [x] T015 [US3] Add failing single-flight, deferred-request, and queued-during-flight tests in `src/features/reader-interactions/analytics-event.transport.test.ts`
- [x] T016 [US3] Implement one in-flight flush promise and queued-event retention in `src/features/reader-interactions/analytics-event.transport.ts`
- [x] T017 [US3] Add failing fake-timer tests for one 30-second routine delivery interval in a focused `useReaderSession` test
- [x] T018 [US3] Separate active-time/progress event creation from routine network delivery in `src/features/reader-interactions/useReaderSession.ts`
- [x] T019 [US3] Preserve explicit non-blocking page-hide, page-exit, content-link, and successful-share flush triggers
- [x] T020 [US3] Preserve one-time view/progress/completion, cumulative active time, retry, and queue-bound semantics
- [x] T021 [P] [US3] Run existing activity, link, session-service, API, and transport regression tests
- [x] T022 [US3] Run reader-interaction tests, lint, type checking, and format; record results in `stories/checklist.md`

## Phase 4: Story 04 - Reader Independence and Cross-Repo Validation

- [x] T023 [US2] Add delayed/failing analytics and reaction tests proving article content remains usable in the blog detail/reader component test boundary
- [x] T024 [US2] Remove only coupling exposed by T023 while keeping reaction degradation local to the interaction feature
- [x] T025 [US4] Verify public routes issue no owner analytics requests and protected analytics remains in separate lazy production chunks
- [x] T026 Compare frontend summary types and fixtures with backend Swagger and `contracts/backend-api.md`
- [x] T027 Run all targeted tests, `yarn lint`, `yarn tsc --noEmit`, and `yarn format` under the supported runtime
- [x] T028 Run the justified production build and record main, article, and analytics chunk sizes
- [x] T029 Use the owner-provided browser target to verify home, archive, article, delayed dependency, mobile/desktop, and navigation journeys
- [ ] T030 Record summary payload bytes and correlate post-deployment article behavior with the backend 30-sample latency report in `stories/checklist.md`

## Dependencies

- T001-T007 require the backend summary Swagger contract.
- T008-T014 depend on Story 01.
- T015-T022 can proceed independently of summary work.
- T023-T030 require Stories 02-03 and deployed backend behavior for final measurement.

## Requirement Traceability

| Requirements | Primary tasks |
| --- | --- |
| FR-001, FR-002 summary consumption and mapping | T001-T014 |
| FR-003 unchanged full/search/authoring/profile flows | T004-T011, T026 |
| FR-004 article independence | T023-T024, T029 |
| FR-005, FR-006 routine batching and interval | T017-T020 |
| FR-007 single-flight delivery | T015-T016 |
| FR-008, FR-009 retry and explicit triggers | T015-T021 |
| FR-010, FR-011 event/activity semantics | T019-T022 |
| FR-012 lazy protected analytics | T025, T028 |
| FR-013 architecture boundary | T002-T012 |
| FR-014 no dependency | T001-T030 |
| SC-001 payload | T001, T006, T026, T030 |
| SC-002 delayed dependency usability | T023-T024, T029 |
| SC-003, SC-004 delivery frequency and concurrency | T015-T022 |
| SC-005 semantic regression safety | T019-T023, T027 |
| SC-006 production latency | T029-T030 |
| SC-007 build isolation | T025, T028 |
| SC-008 frontend quality gates | T027-T030 |

## Implementation Strategy

Freeze and test the summary adapter before changing pages. Let analytics batching proceed independently. Integrate home/archive only after the backend contract is generated, then finish with article-independence tests, production build evidence, browser journeys, and cross-repo latency reporting.

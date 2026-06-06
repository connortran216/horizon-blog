# Tasks: Blog Interaction Analytics Frontend

**Input**: [spec.md](./spec.md), [plan.md](./plan.md), [frontend TD](../../docs/blog-interaction-author-analytics-technical-design.md)

## Phase 1: Setup and Contract Fixtures

- [x] T001 Review approved contracts and record the owner gate that no chart or test dependency may be added without explicit approval in `specs/005-blog-interaction-analytics/research.md`
- [x] T002 Create execution tracker and record tier ownership in `specs/005-blog-interaction-analytics/stories/checklist.md`
- [x] T003 [P] Define reader interaction/event types and approved fixtures in `src/features/reader-interactions/reader-interactions.types.ts` and `src/features/reader-interactions/reader-interactions.fixtures.ts`
- [x] T004 [P] Define author analytics API/display types and approved fixtures in `src/features/author-analytics/author-analytics.types.ts` and `src/features/author-analytics/author-analytics.fixtures.ts`

## Phase 2: Foundational Reader and Author Services

- [x] T005 [P] Implement visitor ID validation/storage in `src/features/reader-interactions/reader-identity.storage.ts`
- [x] T006 [P] Implement reading-session lifecycle, milestone rules, and per-session active-time `client_seq` in `src/features/reader-interactions/reader-session.service.ts`
- [x] T007 [P] Implement in-memory batch/retry/keepalive event transport that preserves `event_id` across retries in `src/features/reader-interactions/analytics-event.transport.ts`
- [x] T008 [P] Implement analytics range parsing and formatting helpers in `src/features/author-analytics/author-analytics.range.ts` and `src/features/author-analytics/author-analytics.format.ts`
- [x] T009 Confirm foundational modules match frozen fixtures with static review documented in `specs/005-blog-interaction-analytics/stories/checklist.md`

## Phase 3: User Stories 1 and 2 - Reader Interactions and Measurement

**Independent Test**: A published blog supports heart/share and non-blocking reading instrumentation without navigation regressions.

- [x] T010 [P] [US1] Implement reader interaction API adapter and service in `src/features/reader-interactions/reader-interactions.api.ts` and `src/features/reader-interactions/reader-interactions.service.ts`
- [x] T011 [P] [US1] Implement accessible heart/share components in `src/features/reader-interactions/components/HeartButton.tsx`, `ShareButton.tsx`, and `ReaderInteractionBar.tsx`
- [x] T012 [US1] Implement interaction orchestration hook in `src/features/reader-interactions/useReaderInteractions.ts`
- [x] T013 [US2] Implement progress, active-time, source, and delegated-link instrumentation in `src/features/reader-interactions/useReaderSession.ts`
- [x] T014 [US2] Integrate one progress source and interaction bar in `src/features/blog/components/BlogReaderFrame.tsx`
- [x] T015 [US1] Integrate reader hooks into `src/features/blog/pages/BlogDetailPage.tsx`
- [x] T016 [US2] Update reader design guidance in `design-system/pages/reader.md`

## Phase 4: User Story 3 - Author Analytics Data and Overview

**Independent Test**: An authenticated author can open overview, change ranges, sort/paginate blogs, and understand loading/empty/error/freshness states.

- [x] T017 [P] [US3] Implement author analytics repository in `src/features/author-analytics/author-analytics.repository.ts`
- [x] T018 [P] [US3] Implement author analytics service and DTO mapping in `src/features/author-analytics/author-analytics.service.ts`
- [x] T019 [US3] Register author analytics service/repository in `src/core/di/container.ts`
- [x] T020 [P] [US3] Implement overview and blog-metrics hooks in `src/features/author-analytics/useAnalyticsOverview.ts` and `src/features/author-analytics/useBlogMetrics.ts`
- [x] T021 [P] [US3] Implement date range, approximate metric card, and accessible trend primitives in `src/features/author-analytics/components/AnalyticsDateRangeFilter.tsx`, `AnalyticsMetricCard.tsx`, and `AnalyticsTrendChart.tsx`
- [x] T022 [US3] Implement analytics overview page in `src/features/author-analytics/pages/AnalyticsOverviewPage.tsx`
- [x] T023 [US3] Add protected route wrapper and route/navigation integration in `src/pages/Analytics.tsx`, `src/Routes.tsx`, and `src/app/layouts/UserMenu.tsx`
- [x] T024 [US3] Add analytics page design guidance in `design-system/pages/analytics.md`, `design-system/pages/README.md`, and `docs/agent-guides/project-reference.md`

## Phase 5: User Story 4 - Blog Detail, Comparison, and Insights

**Independent Test**: An author can diagnose one owned blog and compare blog performance using accessible, cautious presentation.

- [x] T025 [P] [US4] Implement blog-detail hook in `src/features/author-analytics/useBlogAnalytics.ts`
- [x] T026 [P] [US4] Implement progress funnel and reaction trend components in `src/features/author-analytics/components/ReaderProgressFunnel.tsx` and `AnalyticsReactionTrend.tsx`
- [x] T027 [P] [US4] Implement link and source performance components in `src/features/author-analytics/components/LinkPerformanceTable.tsx` and `TrafficSourceBreakdown.tsx`
- [x] T028 [P] [US4] Implement sortable comparison table and insight list in `src/features/author-analytics/components/BlogMetricsTable.tsx` and `AnalyticsInsightList.tsx`
- [x] T029 [US4] Implement blog analytics detail page in `src/features/author-analytics/pages/BlogAnalyticsPage.tsx`
- [x] T030 [US4] Add protected blog analytics route wrapper and route entry in `src/pages/BlogAnalytics.tsx` and `src/Routes.tsx`
- [x] T031 [US4] Document reusable analytics visualization rules in `design-system/components/README.md`

## Phase 6: Validation and Cross-Cutting

- [ ] T032 Verify frontend types and fixtures against backend Swagger and `specs/005-blog-interaction-analytics/contracts/backend-api.md`
- [ ] T033 Perform reader and author manual journeys from `specs/005-blog-interaction-analytics/quickstart.md`
- [ ] T034 Verify mobile/desktop, light/dark, keyboard, screen-reader labels, distinct surfaces, and reduced motion using `specs/005-blog-interaction-analytics/quickstart.md`
- [ ] T035 Run `rtk yarn lint`, `rtk yarn format`, and `rtk yarn build`
- [ ] T036 Record validation and implementation commits in `specs/005-blog-interaction-analytics/stories/checklist.md`

## Dependencies

- T001-T009 block feature implementation.
- Reader stories require backend public interaction contracts.
- Author repository live integration requires backend author query contracts.
- Overview page precedes blog-detail/comparison page composition.
- Cross-repo QA runs only after reader and author stories complete.

## Requirement Traceability

| Requirements | Primary tasks |
| --- | --- |
| FR-001, FR-002, FR-003 reader heart/share behavior | T010-T012, T015 |
| FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-010 identity, sessions, measurement, delivery, capabilities | T003, T005-T007, T013-T016 |
| FR-011, FR-012, FR-013, FR-014, FR-015 protected analytics routes and states | T017-T030 |
| FR-016, FR-017 accessible design and route separation | T021-T024, T026-T031, T034 |
| FR-018 contract alignment | T001, T004, T017-T020, T032 |
| FR-019 dependency approval | T001, T021, T031 |
| FR-020 approximate reader display | T004, T018, T021-T024, T032 |
| SC-001, SC-002, SC-003, SC-004 reader outcomes | T010-T016, T033 |
| SC-005, SC-006, SC-007, SC-008 author outcomes and access | T017-T034 |
| SC-009 quality gates | T035-T036 |

## Parallel Opportunities

- T003 and T004 can run in parallel.
- T005-T008 use independent files after fixtures freeze.
- T010 and T011 can run in parallel.
- T017, T018 scaffolding, and T020 fixtures can be prepared in parallel before live integration.
- T021 components can proceed in parallel after display models stabilize.
- T025-T028 use separate detail/component files.

## Implementation Strategy

Freeze fixtures and build isolated feature foundations first. Integrate reader behavior after public APIs exist, then connect author data and build overview before detail/comparison. Keep shared route, DI, and reader-frame edits under exclusive story ownership.

# Frontend Performance Optimization Implementation Plan

> Execute each task test-first and update `specs/006-performance-optimization/stories/checklist.md` after its focused gate.

**Goal:** Reduce listing payload and analytics request pressure while keeping reading, reactions, and measurement behavior intact.

**Architecture:** Consume the additive backend summary contract through existing core boundaries, switch only home and unfiltered archive consumers, then make reader analytics delivery periodic and single-flight. Freeze article independence and lazy analytics behavior with tests.

**Tech Stack:** React, TypeScript, Vite, Chakra UI, Vitest.

## Task 1: Summary data boundary

**Files:** core blog types, mapping utility, repository, service, focused tests.

1. Write failing tests for `/posts/summaries`, direct mapping, optional fields, pagination, and cache separation.
2. Define API summary types and the direct mapper.
3. Add repository/service summary methods without changing full-post or search methods.
4. Run focused tests, lint, and type checking.
5. Draft commit: `perf(blog): add summary data boundary`.

## Task 2: Home and archive

**Files:** `HomePage.tsx`, `useBlogArchive.ts`, `FeaturedStory.tsx`, `EditorialCard.tsx`, focused tests.

1. Write failing tests for summary usage and filtered-flow compatibility.
2. Switch home and unfiltered archive to the summary method.
3. Render excerpt, reading time, and cover directly from summary fields.
4. Run home/archive/component tests and static gates.
5. Draft commit: `perf(blog): use summaries for public listings`.

## Task 3: Analytics batching

**Files:** `analytics-event.transport.ts`, `useReaderSession.ts`, reader-interaction tests.

1. Write failing deferred-promise tests for single-flight flushes.
2. Implement one in-flight promise while retaining newly queued events.
3. Write failing fake-timer tests for a shared 30-second routine interval.
4. Queue progress and active-time events without immediate routine flushes.
5. Preserve lifecycle, link, successful-share, retry, and activity semantics.
6. Run the complete reader-interaction test suite.
7. Draft commit: `perf(analytics): batch reader event delivery`.

## Task 4: Independence and final verification

1. Write delayed/failing reaction and analytics tests at the reader boundary.
2. Remove only coupling proven by those tests.
3. Run targeted tests, lint, type check, format, and production build under Node 22 when required.
4. Verify lazy analytics chunks and no owner requests on public routes.
5. Run browser journeys against the owner-provided target and record payload/chunk/latency evidence.
6. Draft commit: `test(perf): verify public reading performance`.

# Tasks: Query Nine Posts

**Input**: [spec.md](./spec.md), [plan.md](./plan.md), [research.md](./research.md)

## Phase 1: Setup

- [x] T001 Review frontend workflow and domain guidance in `docs/agent-guides/workflow.md` and `docs/agent-guides/domain.md`
- [x] T002 Locate post list request/page-size values in `src/features/home/pages/HomePage.tsx`, `src/features/blog/pages/BlogPage.tsx`, and `src/features/profile/useProfilePosts.ts`

## Phase 2: Foundational

- [x] T003 [P] Update home page published-post request limit to 9 in `src/features/home/pages/HomePage.tsx`
- [x] T004 [P] Update profile published and draft pagination defaults to 9 in `src/features/profile/useProfilePosts.ts`

## Phase 3: User Story 1 - See an odd-sized post set

**Independent Test**: Source search confirms the in-scope frontend post list limits are 9 and no relevant request/page-size limit remains at 6.

- [x] T005 [US1] Update blog archive page size to 9 in `src/features/blog/pages/BlogPage.tsx`
- [x] T006 [US1] Update blog archive loading placeholder count to 9 in `src/features/blog/pages/BlogPage.tsx`
- [x] T007 [US1] Verify the relevant `limit: 9` and `const limit = 9` source matches
- [x] T008 [US1] Verify no relevant `limit: 6` or `const limit = 6` source matches remain

## Phase 4: Polish & Cross-Cutting

- [x] T009 Run `PATH=/Users/trantuancanh/.nvm/versions/node/v22.18.0/bin:$PATH yarn lint`
- [x] T010 Record validation outcome in the final handoff

## Dependencies

- T001 and T002 precede code edits.
- T003, T004, and T005 can be completed independently after setup.
- T007 and T008 run after code edits.
- T009 runs after source verification.

## MVP Scope

Complete T003 through T008. The feature is useful once all in-scope frontend post list limits use 9.

## Parallel Opportunities

- T003 and T004 touch different files and can run in parallel.
- Source verification commands can run independently after implementation.

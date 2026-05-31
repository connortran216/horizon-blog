# Tasks: Rewrite CV Achievements

**Input**: [spec.md](./spec.md), [plan.md](./plan.md), [research.md](./research.md)

## Phase 1: Setup

- [x] T001 Review frontend workflow and CV domain guidance in `docs/agent-guides/workflow.md` and `docs/agent-guides/domain.md`
- [x] T002 Review existing CV content in `src/features/cv/cv.data.ts`

## Phase 2: Foundational

- [x] T003 Confirm factual guardrails from `specs/003-rewrite-cv-achievements/spec.md` and `specs/003-rewrite-cv-achievements/research.md`

## Phase 3: User Story 1 - Read outcome-focused CV experience

**Independent Test**: Experience bullets explain enabled outcomes and value without invented metrics or changed factual fields.

- [x] T004 [US1] Rewrite Parcel Perform highlights in `src/features/cv/cv.data.ts`
- [x] T005 [US1] Rewrite Think Prompt highlights in `src/features/cv/cv.data.ts`
- [x] T006 [US1] Rewrite SSSMarket highlights in `src/features/cv/cv.data.ts`
- [x] T007 [US1] Rewrite Dai Phat Solutions highlights in `src/features/cv/cv.data.ts`
- [x] T008 [US1] Rewrite HAHALOLO Company highlights in `src/features/cv/cv.data.ts`

## Phase 4: Polish & Cross-Cutting

- [x] T009 Verify no invented metric-style claims were introduced in `src/features/cv/cv.data.ts`
- [x] T010 Run `PATH=/Users/trantuancanh/.nvm/versions/node/v22.18.0/bin:$PATH rtk yarn lint`
- [x] T011 Record validation outcome in the final handoff

## Dependencies

- T001 through T003 precede content edits.
- T004 through T008 can be reviewed independently but edit the same file, so execute sequentially.
- T009 and T010 run after content edits.

## MVP Scope

Complete T004 through T009. The feature is useful once all experience bullets are outcome-focused and factual guardrails pass.

## Parallel Opportunities

- Review tasks T001 and T002 can be completed independently.
- The content rewrites should be applied sequentially because they touch the same file.

## Implementation Strategy

Rewrite one employer at a time, preserving facts and checking that each bullet answers "what value did this work create?" rather than only "what did I do?".

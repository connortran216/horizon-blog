# Tasks: Preserve Landing Card Cover

**Input**: [spec.md](./spec.md), [plan.md](./plan.md), [research.md](./research.md), [contracts/story-card-cover.md](./contracts/story-card-cover.md)

## Phase 1: Setup

- [x] T001 Review approved Option D and repo UI guidance in `design-system/MASTER.md` and `design-system/pages/home.md`
- [x] T002 Confirm the cropping source in `src/features/home/components/StoryCard.tsx`

## Phase 2: Foundational

- [x] T003 Add a contained-cover regression test in `src/features/home/components/StoryCard.test.tsx`

## Phase 3: User Story 1 - See the complete blog cover

**Independent Test**: A recent-blog card with a resolved wide cover renders contained-image styling while retaining its content and link.

- [x] T004 [US1] Implement the Option D media well in `src/features/home/components/StoryCard.tsx`
- [x] T005 [US1] Run the focused test for `src/features/home/components/StoryCard.test.tsx`

## Phase 4: User Story 2 - See a visually finished blog card

**Independent Test**: A standard blog card with a resolved cover renders the image and overlay inside an overflow-clipped rounded frame.

- [x] T009 [US2] Add a rounded-cover regression assertion in `src/features/blog/components/blog-summary-cards.test.tsx`
- [x] T010 [US2] Round the shared cover frame in `src/features/blog/components/EditorialCard.tsx`
- [x] T011 [US2] Run the focused test for `src/features/blog/components/blog-summary-cards.test.tsx`

## Phase 5: Polish & Cross-Cutting

- [x] T006 Run `rtk yarn tsc --noEmit`
- [x] T007 Run `rtk yarn lint`
- [x] T008 Check formatting and the scoped diff for `src/features/home/components/StoryCard.tsx` and `src/features/home/components/StoryCard.test.tsx`
- [x] T012 Run `rtk yarn tsc --noEmit`
- [x] T013 Run `rtk yarn lint`
- [x] T014 Check formatting and the scoped diff for `src/features/blog/components/EditorialCard.tsx` and `src/features/blog/components/blog-summary-cards.test.tsx`

## Validation Results

- `rtk yarn test src/features/home/components/StoryCard.test.tsx`: passed (1 test).
- `rtk yarn tsc --noEmit`: passed.
- `rtk yarn lint`: passed.
- `rtk yarn prettier --check src/features/home/components/StoryCard.tsx src/features/home/components/StoryCard.test.tsx`: passed.
- `git diff --check`: passed.
- `rtk yarn test src/features/blog/components/blog-summary-cards.test.tsx`: passed (4 tests).
- `rtk yarn prettier --check src/features/blog/components/EditorialCard.tsx src/features/blog/components/blog-summary-cards.test.tsx`: passed.

## Dependencies

- T003 precedes T004 to capture the regression.
- T004 blocks T005 through T008.
- T009 precedes T010 to capture the sharp-corner regression.
- T010 blocks T011 through T014.

## MVP Scope

Complete T003 through T005. The user-visible defect is fixed once the resolved cover is contained and the regression test passes.

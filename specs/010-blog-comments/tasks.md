# Tasks: Blog Comments Frontend

## Phase 1: Setup

- [x] T001 Add API and domain comment types in `src/features/comments/comments.types.ts`
- [x] T002 [P] Add exact comments transport methods and repository tests in `src/features/comments/comments.repository.ts` and `src/features/comments/comments.repository.test.ts`
- [x] T003 [P] Add service mapping/validation and tests in `src/features/comments/comments.service.ts` and `src/features/comments/comments.service.test.ts`
- [x] T004 Add the feature-local service factory in `src/features/comments/comments.dependencies.ts`

## Phase 2: Foundational

- [x] T005 Add pure sibling-page mutation helpers and tests in `src/features/comments/comments.reducer.ts` and `src/features/comments/comments.reducer.test.ts`
- [x] T006 Add isolated loading, cursor, retry-stable submission, and mutation state in `src/features/comments/useBlogComments.ts`

## Phase 3: User Story 1 — Read public discussion

**Independent test**: A signed-out reader loads top-level comments and reply pages, sees safe tombstones, and retains the article when the API fails.

- [x] T007 [P] [US1] Add comment item/thread rendering tests in `src/features/comments/components/CommentThread.test.tsx`
- [x] T008 [US1] Implement plain-text `CommentItem` and recursive `CommentThread` in `src/features/comments/components/CommentItem.tsx` and `src/features/comments/components/CommentThread.tsx`
- [x] T009 [US1] Implement public loading, empty, closed, error, and load-more states in `src/features/comments/components/CommentSection.tsx`
- [x] T010 [US1] Add `discussionSection` composition in `src/features/blog/components/BlogReaderFrame.tsx` and `src/features/blog/pages/BlogDetailPage.tsx`

## Phase 4: User Story 2 — Signed-in participation

**Independent test**: Signed-out readers return from login to `#comments`; signed-in readers create depths 0–2 with safe validation and retry behavior.

- [x] T011 [P] [US2] Add composer/auth/return-path component tests in `src/features/comments/components/CommentComposer.test.tsx`
- [x] T012 [US2] Implement accessible create/reply composer states in `src/features/comments/components/CommentComposer.tsx`
- [x] T013 [US2] Connect create/reply actions and confirmed-new-comment state in `src/features/comments/components/CommentSection.tsx` and `src/features/comments/useBlogComments.ts`

## Phase 5: User Story 3 — Management and moderation

**Independent test**: Edit/remove/reply/settings controls follow capabilities; leaf removal disappears; retained removal becomes a tombstone; closed discussions remain readable.

- [x] T014 [P] [US3] Add capability, edit, removal, and settings component tests in `src/features/comments/components/CommentActions.test.tsx`
- [x] T015 [US3] Implement edit/remove actions and destructive confirmation in `src/features/comments/components/CommentActions.tsx` and `src/features/comments/components/CommentItem.tsx`
- [x] T016 [US3] Implement owner open/close control in `src/features/comments/components/CommentSection.tsx`

## Phase 6: Delivery

- [x] T017 Activate the interaction-bar comment anchor in `src/features/reader-interactions/components/ReaderInteractionBar.tsx`
- [x] T018 Extend article failure-isolation regression coverage in `src/features/blog/pages/BlogDetailPage.performance.test.tsx`
- [x] T019 Run focused tests, `yarn tsc --noEmit`, `yarn lint`, and `yarn build`, then record results in `specs/010-blog-comments/quickstart.md`

## Dependencies

```mermaid
flowchart LR
    Setup["T001-T004"] --> Foundation["T005-T006"]
    Foundation --> Read["US1 T007-T010"]
    Read --> Create["US2 T011-T013"]
    Create --> Manage["US3 T014-T016"]
    Manage --> Delivery["T017-T019"]
```

## Parallel opportunities

- Repository and service tests can run in parallel after shared types exist.
- Rendering tests can be written while the hook state helpers stabilize.
- Management component tests can begin once API capability shapes are fixed.

## MVP

US1 and US2 provide public reading and signed-in participation. Management/moderation is required for the approved release boundary.

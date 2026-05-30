# Tasks: Fix Media Preview Text

**Input**: [spec.md](./spec.md), [plan.md](./plan.md), [research.md](./research.md), [contracts/preview-text.md](./contracts/preview-text.md)

## Phase 1: Setup

- [x] T001 Confirm current failure with media-leading markdown samples in `src/core/utils/markdown-preview.utils.ts`
- [x] T002 Review frontend constitution and workflow docs in `.specify/memory/constitution.md` and `docs/agent-guides/workflow.md`

## Phase 2: Foundational

- [x] T003 Update shared preview extraction in `src/core/utils/markdown-preview.utils.ts` to remove markdown and HTML images from preview text

## Phase 3: User Story 1 - Read meaningful blog previews

**Independent Test**: Media-leading markdown samples produce excerpts that begin with prose, not image labels or metadata.

- [x] T004 [US1] Update service-level reading-time calculation in `src/core/utils/blog-mapping.utils.ts` to count cleaned preview text
- [x] T005 [US1] Update archive-card reading-time calculation in `src/features/blog/blog.utils.ts` to count cleaned preview text
- [x] T006 [US1] Verify preview samples from `specs/001-fix-media-preview-text/quickstart.md`

## Phase 4: Polish & Cross-Cutting

- [x] T007 Run `PATH=/Users/trantuancanh/.nvm/versions/node/v22.18.0/bin:$PATH rtk yarn lint`
- [x] T008 Run `PATH=/Users/trantuancanh/.nvm/versions/node/v22.18.0/bin:$PATH rtk yarn tsc --noEmit`
- [x] T009 Record validation outcome in the final handoff

## Dependencies

- T003 blocks T004, T005, and T006.
- T006 blocks final validation.
- T007 and T008 can run after implementation tasks complete.

## MVP Scope

Complete T003 through T006. The feature is useful once previews no longer show media labels.

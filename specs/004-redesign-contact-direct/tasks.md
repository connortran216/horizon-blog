# Tasks: Redesign Contact Direct

**Input**: [spec.md](./spec.md), [plan.md](./plan.md), [research.md](./research.md)

## Phase 1: Setup

- [x] T001 Review frontend workflow and Contact design guidance in `docs/agent-guides/workflow.md`, `docs/agent-guides/design-system.md`, `design-system/MASTER.md`, `design-system/pages/contact.md`, and `design-system/components/README.md`
- [x] T002 Review existing Contact page and feature-owned card components in `src/features/contact/pages/ContactPage.tsx`, `src/features/contact/components/ContactInfoCard.tsx`, and `src/features/contact/components/ContactPromptCard.tsx`

## Phase 2: Foundational

- [x] T003 Confirm no backend/API dependency is needed for the direct-contact redesign using `specs/004-redesign-contact-direct/spec.md` and `specs/004-redesign-contact-direct/research.md`

## Phase 3: User Story 1 - Choose a direct contact method

**Independent Test**: `/contact` has no message form, no fake submit action, and clear direct email, phone, and location options.

- [x] T004 [US1] Remove form state, submit handling, loading state, toast usage, and form imports from `src/features/contact/pages/ContactPage.tsx`
- [x] T005 [US1] Recompose the hero and contact options around direct email, phone, and location actions in `src/features/contact/pages/ContactPage.tsx`
- [x] T006 [US1] Update `ContactInfoCard` presentation for direct contact methods in `src/features/contact/components/ContactInfoCard.tsx`

## Phase 4: User Story 2 - Understand what to include in an outreach message

**Independent Test**: `/contact` includes concise outreach guidance for blog feedback, frontend/product discussion, and clear expectations without crowding contact methods.

- [x] T007 [US2] Keep and place outreach prompt content in `src/features/contact/pages/ContactPage.tsx`
- [x] T008 [US2] Calm the prompt-card presentation in `src/features/contact/components/ContactPromptCard.tsx`

## Phase 5: Polish & Cross-Cutting

- [x] T009 Verify removed form behavior with `rg -n "useState|useToast|handleSubmit|setTimeout|FormControl|Input|Textarea|Send message|Message sent|Failed to send" src/features/contact`
- [x] T010 Run `rtk yarn lint`
- [x] T011 Record validation outcome in the final handoff

## Dependencies

- T001 through T003 precede code edits.
- T004 must precede T005 because layout composition depends on removing the old form behavior.
- T006 can run after T005 because it supports the direct-contact layout.
- T007 and T008 can run after the contact-method layout is stable.
- T009 and T010 run after code edits.

## MVP Scope

Complete T004 through T006. The feature is useful once the fake form is gone and direct contact methods are clear.

## Parallel Opportunities

- T006 and T008 touch different component files and can be reviewed independently after page composition is known.
- T009 and T010 are sequential validation tasks after edits.

## Implementation Strategy

Remove the fake form first, then rebuild the page around direct contact actions and concise guidance. Keep the change scoped to the Contact feature files and avoid theme, route, dependency, or backend changes.

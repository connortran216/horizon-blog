# Tasks: Profile Editorial Workspace

**Spec**: `specs/022-profile-editorial-workspace/spec.md`
**Plan**: `specs/022-profile-editorial-workspace/plan.md`
**Status**: Complete

## A. Contract and Tests

- [x] Add workspace render expectations before implementation.
- [x] Preserve permission, upload, modal, and semantic-count behavior.

## B. Design-System Patterns

- [x] Add opt-in workspace layout to `ProfileHeader`.
- [x] Add opt-in workspace presentation to `AvatarEditor`.
- [x] Keep all default/public states unchanged.
- [x] Add workspace gallery coverage.

## C. Profile Composition

- [x] Move `Edit profile` beneath the author's name as a text action.
- [x] Leave `Write a blog` as the only dominant CTA.
- [x] Match the approved desktop split and mobile reading order.

## D. Documentation

- [x] Update the profile page contract.
- [x] Record the Storybook MCP capability gap.
- [x] Update component inventory notes if the presentation contract changes.

## E. Verification

- [x] Targeted tests pass.
- [x] TypeScript, lint, formatting, design-system coverage, and build pass.
- [x] Light/dark browser checks pass at required widths.
- [x] Keyboard and console checks pass.
- [x] `design-qa.md` says `final result: passed`.

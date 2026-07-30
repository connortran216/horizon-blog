# Implementation Plan: Scheduled Publishing

**Backend counterpart**: `../../../horizon-blog-be/specs/006-scheduled-publishing/plan.md`

## Technical Context

- React, TypeScript, Chakra UI, React Router.
- Existing repository/service/editor boundaries.
- Existing landing-card visual hierarchy and semantic tokens.

## Design

1. Save the draft before navigating from the editor.
2. Add protected `/blog-editor/publish?id=:id`.
3. Render publishing settings on the left and a non-interactive landing card on the right.
4. Consume backend schedule and immediate-publish contracts through repository and service layers.

## Constitution Check

- Spec-first: pass.
- Contract-aligned: pass; backend owns scheduling.
- Design system: pass; `bg.*`, `border.*`, `text.*`, and `action.*` only.
- Validation: type check, lint, focused tests, production build.

# Crepe Milkdown Migration Plan

## 1) Migration Goal

The goal is to replace the custom Milkdown implementation with Crepe Milkdown so the project relies on a more stable, maintained editor foundation instead of custom editor internals.

This migration is a direct cutover. We will not keep a long-lived fallback path in production. The migration must preserve current UI/UX behavior for create, edit, and update blog flows.

Key decisions already agreed:

- Phase 1 covers full migration of existing editor behavior for create/edit/update.
- Image upload is postponed to Phase 2 (after editor migration stabilizes).
- `content_markdown` is the canonical content source in frontend logic.
- Temporary backend compatibility: send `content_json: ""` until backend is updated.

## 2) Success Criteria

Migration is considered complete when all of the following are true:

1. Create, edit, and update flows work end-to-end with Crepe.
2. No major UI/UX regressions compared to current editor experience.
3. Existing posts can be loaded, edited, saved, and re-opened reliably.
4. Frontend logic treats markdown as source of truth.
5. Old custom Milkdown runtime wiring is removed.
6. Documentation reflects the new editor architecture and temporary backend compatibility rule.

## 3) Scope and Non-Goals

### In scope

- Migrate custom Milkdown editor usage to Crepe on authoring paths.
- Preserve current behavior and UX as much as possible.
- Keep existing architecture boundaries (UI -> service -> repository).
- Maintain API compatibility with `content_json: ""` during transition.

### Out of scope (for Phase 1)

- New editor features (especially image upload).
- Visual redesign of authoring pages.
- Backend contract redesign in this phase.
- Broad refactors not directly needed for migration.

## 4) Phase-by-Phase Execution Plan

## Phase 0 - Alignment and Baseline Lock

Purpose: avoid scope drift and define clear migration guardrails before implementation.

Tasks:

1. Write and confirm migration brief:
   - migration objective
   - direct cutover strategy
   - parity-first rule
   - markdown-first rule
   - temporary `content_json: ""` compatibility
2. Define what counts as blocker vs acceptable issue during cutover.
3. Confirm that image upload is explicitly deferred to Phase 2.

Expected output:

- Approved migration brief with explicit boundaries.

Exit criteria:

- No unresolved scope ambiguity before technical work starts.

## Phase 1 - Current-State Discovery (Behavior Inventory)

Purpose: document what must be preserved so migration does not break hidden behavior.

Tasks:

1. Inventory current editor behaviors in create/edit/update flows:
   - toolbar actions
   - keyboard shortcuts
   - markdown formatting behavior
   - edit/read interaction patterns
2. Document all custom Milkdown plugins/config currently in use.
3. Capture integration points:
   - page-level orchestration
   - service/repository transformations
   - request payload shape today
4. Record known pain points and fragile areas in current editor.

Expected output:

- Current Behavior Matrix (single source of truth for parity).

Exit criteria:

- Every user-visible editor behavior used today is explicitly listed.

## Phase 2 - Parity Mapping from Custom Milkdown to Crepe

Purpose: remove uncertainty before implementation by mapping each behavior to a Crepe path.

Tasks:

1. For each behavior in the matrix, classify:
   - native in Crepe
   - needs adaptation/custom wiring
   - deferred (only if non-critical and explicitly accepted)
2. Resolve high-risk compatibility gaps early.
3. Decide intentional UX differences only when clearly better than current behavior.
4. Define acceptance criteria per behavior.

Expected output:

- Parity Mapping Document with risk labels and acceptance checks.

Exit criteria:

- No unknown/high-risk gap remains for create/edit/update parity scope.

## Phase 3 - Integration Design (Architecture-Safe)

Purpose: design the swap in a way that preserves project architecture and avoids ad-hoc wiring.

Tasks:

1. Define editor component boundaries for Crepe integration.
2. Define data lifecycle:
   - input to editor: `content_markdown`
   - output from editor: `content_markdown`
   - compatibility field: `content_json: ""`
3. Keep transformation/business logic in service/repository layers, not in pages.
4. Preserve Chakra/theme consistency and current layout structure.
5. Define cleanup plan for old editor path after cutover.

Expected output:

- Integration blueprint for implementation.

Exit criteria:

- Team can implement without making architectural compromises.

## Phase 4 - Implementation (Core Migration)

Purpose: replace editor runtime while preserving behavior and UX.

Tasks:

1. Replace custom Milkdown editor instances with Crepe in all authoring entry points.
2. Ensure create/edit/update flows keep existing orchestration and route behavior.
3. Ensure payload compatibility uses markdown + `content_json: ""`.
4. Match UX parity for controls, interactions, and basic editing flow.
5. Keep old editor code only as temporary internal reference during migration.

Expected output:

- Crepe-powered authoring flow in place for all target pages.

Exit criteria:

- All authoring paths run on Crepe and save/load successfully.

## Phase 5 - Regression Hardening and Acceptance Gate

Purpose: block regressions before declaring migration complete.

Tasks:

1. Run manual validation checklist for:
   - create new post
   - edit existing post
   - update and re-open post
   - route/auth behavior around protected authoring pages
2. Validate markdown round-trip stability:
   - load -> edit -> save -> re-open consistency
3. Validate no major UI/UX regressions:
   - layout integrity
   - interaction flow
   - expected keyboard behavior
4. Triage and fix issues by severity:
   - blocker/major fixed before completion
   - minor tracked and scheduled immediately after cutover

Expected output:

- Signed-off acceptance report.

Exit criteria:

- No blocker/major issues remain for core authoring flow.

## Phase 6 - Cutover Cleanup and Documentation Update

Purpose: complete migration cleanly and prevent long-term technical confusion.

Tasks:

1. Remove obsolete custom Milkdown runtime paths and dead references.
2. Keep one active editor implementation (Crepe).
3. Update docs to reflect new reality:
   - editor architecture notes
   - markdown-first data rule
   - temporary JSON compatibility note
4. Confirm there is no hidden dependency on old editor components.

Expected output:

- Clean post-migration codebase with updated documentation.

Exit criteria:

- No active legacy editor path remains.

## Phase 7 - Post-Migration Enhancement (Image Upload)

Purpose: add image upload only after core editor migration is stable.

Tasks:

1. Integrate image upload into Crepe flow using existing upload pipeline conventions.
2. Validate file constraints and insertion behavior in markdown content.
3. Validate create/edit/update with uploaded images end-to-end.
4. Fix integration issues without regressing core editing flow.

Expected output:

- Image upload support in Crepe editor.

Exit criteria:

- Image upload is stable in real authoring scenarios.

## 5) Backend Dependency Retirement Plan

Current transitional rule:

- Frontend sends `content_json: ""` only for compatibility.

Follow-up:

1. Backend update to no longer require/consume `content_json`.
2. Frontend removes compatibility field after backend release.
3. API contract docs updated to prevent reintroducing JSON as authoritative content.

## 6) Delivery Artifacts

Track these artifacts during migration:

1. Migration brief (scope + constraints + success criteria)
2. Current Behavior Matrix
3. Parity Mapping Document
4. Manual acceptance checklist
5. Regression log with severity and resolution status
6. Final documentation update after cutover
7. Phase 2 image upload implementation plan

## 7) Working Principles During Migration

1. Parity first, enhancement second.
2. No unnecessary redesign during editor migration.
3. Keep architecture discipline (repository/service/UI boundaries).
4. Keep markdown as canonical content in frontend.
5. Prefer small, verifiable steps over broad changes.

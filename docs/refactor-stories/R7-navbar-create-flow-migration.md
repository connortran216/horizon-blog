# R7 - Navbar Create Flow Migration

## Header

- Project: Horizon Blog frontend
- Service: App layout blog creation entry
- Dependencies: R3, R6
- Blockers: owner decision may be needed if direct-create behavior should become editor navigation only

## Context

The navbar currently reaches directly into the blog repository to create a post. This story removes that data-access dependency from layout code and aligns the navbar with the service/use-case boundary. See [plan section 5, Phase 7](../clean-architecture-refactor-plan.md#phase-7-migrate-navbar-create-flow).

## Acceptance Criteria

### Functional Requirements

- Navbar action still starts the intended write flow.
  - Verify: `yarn build`
  - Pass: Navbar compiles and the create/write action remains wired.

- If direct creation remains, it uses a service method.
  - Verify: `rg "getBlogRepository|createPost" src/app/layouts/Navbar.tsx`
  - Pass: No direct repository usage remains in `Navbar`.

### Technical Requirements

- Navbar does not generate slug as source of truth unless documented as backend-required.
  - Verify: `rg "slug|replace\\(|toLowerCase" src/app/layouts/Navbar.tsx`
  - Pass: No slug generation remains, or a comment documents why backend still requires it.

- Navbar does not inspect `RepositoryResult`.
  - Verify: `rg "success|RepositoryResult|result\\.data|result\\.error" src/app/layouts/Navbar.tsx`
  - Pass: No repository-result handling remains in `Navbar`.

### Quality Gates

- Lint passes.
  - Verify: `yarn lint`
  - Pass: Command exits `0`.

- Build passes.
  - Verify: `yarn build`
  - Pass: Command exits `0`.

## Error Handling

- Create/write action failures remain user-visible.
  - Verify: `rg "toast|catch|Error" src/app/layouts/Navbar.tsx src/core/services src/features/editor`
  - Pass: Failure path still shows a toast or redirects to the editor without crashing.

## Interface Contracts

Consumes one of:

```ts
export interface IBlogService {
  createDraft(input: BlogServicePostInput): Promise<BlogPost>
}
```

or:

```ts
export interface EditorNavigationContract {
  navigateToNewPostEditor(): void
}
```

## Technical Approach

Focus Area: app shell boundary. Layout should not know repository details because it is shared application chrome, not a data-access owner. If direct creation is not required, navigating to the editor is cleaner and reduces accidental blank posts.

## Non-Goals

- Do not redesign the navbar.
- Do not change auth gating beyond the existing behavior.
- Do not add a new post template system.

## Definition of Done

- Navbar has no direct repository dependency.
- Create/write action behavior is preserved or intentionally simplified with documented owner approval.
- Lint and build pass.

## Execution Notes

- Status: Done
- Navbar fallback publish now calls `getBlogService().publishPost(null, ...)`.
- Removed direct `getBlogRepository().createPost()` usage from `Navbar`.
- Removed navbar-side slug generation from the fallback publish path.
- Navbar no longer inspects `RepositoryResult` success/data/error fields.
- Validation: repository, slug-generation, and result-shape search in `src/app/layouts/Navbar.tsx` returned no matches.
- Validation: `yarn lint` exited `0`.
- Validation: `yarn build` exited `0`; Vite reported chunk-size warnings only.

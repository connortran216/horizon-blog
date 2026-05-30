# Implementation Plan: Query Nine Posts

**Branch**: `main`
**Spec**: [spec.md](./spec.md)
**Constitution**: [.specify/memory/constitution.md](../../.specify/memory/constitution.md)

## Technical Context

- **Stack**: React 18, TypeScript, Vite, Chakra UI.
- **Source area**: `src/features/home/pages/HomePage.tsx`, `src/features/blog/pages/BlogPage.tsx`, `src/features/profile/useProfilePosts.ts`.
- **Data source**: Existing post list service calls and pagination state.
- **Validation**: targeted source search for `limit: 6` / `limit = 6`, and `yarn lint`.
- **Runtime note**: default Node `v25.9.0` currently fails before ESLint with `EBADF`; use the available Node `v22.18.0` runtime for validation.

## Constitution Check

- **Spec-first user value**: Pass. The spec defines the requested list-size behavior and acceptance criteria.
- **Superpowers execution discipline**: Pass. The task is narrow and scoped to existing frontend request values.
- **Contract-aligned frontend boundaries**: Pass. No endpoint, response-field, or backend behavior changes are required.
- **Design system and accessible UI**: Pass. No visual styling or layout contract changes beyond matching loading placeholder count.
- **Focused verification**: Pass. Lint plus targeted source searches prove the requested change.

## Phase 0: Research

See [research.md](./research.md).

## Phase 1: Design & Contracts

- Data model: see [data-model.md](./data-model.md).
- Verification scenario: see [quickstart.md](./quickstart.md).
- External contracts: none. The existing backend query contract is unchanged.

## Implementation Approach

1. Update home published-post loading to request 9 posts.
2. Update blog archive page size to 9 and align its loading placeholder count.
3. Update profile published and draft pagination defaults to 9.
4. Verify no relevant frontend post request/page-size limit remains at 6.
5. Run frontend lint with Node `v22.18.0`.

## Post-Design Constitution Check

- No principle violations remain.
- No backend or API ownership concerns apply.
- The plan keeps changes in the smallest existing page/hook boundaries.

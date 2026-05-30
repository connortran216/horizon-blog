# Implementation Plan: Fix Media Preview Text

**Branch**: `main`
**Spec**: [spec.md](./spec.md)
**Constitution**: [.specify/memory/constitution.md](../../.specify/memory/constitution.md)

## Technical Context

- **Stack**: React 18, TypeScript, Vite, Chakra UI.
- **Source area**: `src/core/utils/markdown-preview.utils.ts`, `src/core/utils/blog-mapping.utils.ts`, `src/features/blog/blog.utils.ts`.
- **Data source**: Existing blog `content_markdown`; no backend contract change.
- **Validation**: targeted markdown-preview sample, `yarn lint`, `yarn tsc --noEmit`.
- **Runtime note**: default Node `v25.9.0` currently fails before ESLint with `EBADF`; use the available Node `v22.18.0` runtime for validation.

## Constitution Check

- **Spec-first user value**: Pass. The spec defines reader-facing preview behavior and acceptance criteria.
- **Superpowers execution discipline**: Pass. Root cause is investigated before implementation.
- **Contract-aligned frontend boundaries**: Pass. No API, endpoint, or backend response changes.
- **Design system and accessible UI**: Pass. No visual token or layout change; content quality only.
- **Focused verification**: Pass. Validation is scoped to preview extraction and TypeScript/lint checks.

## Phase 0: Research

See [research.md](./research.md).

## Phase 1: Design & Contracts

- Data model: see [data-model.md](./data-model.md).
- UI behavior contract: see [contracts/preview-text.md](./contracts/preview-text.md).
- Verification scenario: see [quickstart.md](./quickstart.md).

## Implementation Approach

1. Fix the shared preview-text extractor so images are removed instead of converted into alt text.
2. Make reading-time calculations that are used for archive cards count cleaned preview text rather than raw markdown.
3. Verify the failing samples before and after the change.
4. Run the repo validation commands with Node `v22.18.0`.

## Post-Design Constitution Check

- No principle violations remain.
- No backend or API ownership concerns apply.
- The plan keeps the change in the smallest shared utility boundary that affects all card preview consumers.

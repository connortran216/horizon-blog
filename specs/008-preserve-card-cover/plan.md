# Implementation Plan: Preserve Landing Card Cover

**Branch**: `main`
**Spec**: [spec.md](./spec.md)
**Approved Design**: Option D from the 2026-07-20 prototype review
**Constitution**: [.specify/memory/constitution.md](../../.specify/memory/constitution.md)

## Technical Context

- **Stack**: React 18, TypeScript, Vite, Chakra UI.
- **Source area**: `src/features/home/components/StoryCard.tsx`, `src/features/blog/components/EditorialCard.tsx`, and focused card tests.
- **Data source**: Existing `BlogPostSummary`; no contract changes.
- **Design system**: Standard card surface with a quiet inset media area using existing semantic tokens.
- **Validation**: focused Vitest regressions, `yarn tsc --noEmit`, `yarn lint`, and source diff checks.

## Constitution Check

- **Spec-first user value**: Pass. The approved design and measurable cover-visibility outcome are documented.
- **Superpowers execution discipline**: Pass. Multiple prototypes were reviewed and Option D was explicitly approved before implementation.
- **Contract-aligned frontend boundaries**: Pass. No API, repository, service, or data-contract changes.
- **Design system and accessible UI**: Pass. Existing semantic tokens, alt text, responsive structure, and interaction behavior are retained.
- **Focused verification**: Pass. Validation targets the changed card and frontend static gates.

## Phase 0: Research

See [research.md](./research.md).

## Phase 1: Design & Contracts

- Presentation model: [data-model.md](./data-model.md)
- UI contract: [contracts/story-card-cover.md](./contracts/story-card-cover.md)
- Verification guide: [quickstart.md](./quickstart.md)

## Implementation Approach

1. Add a regression test that renders a recent-blog card with a resolved cover and verifies contained-image styling and existing content.
2. Replace the fill-and-crop cover treatment with a centered, padded media well and contained image.
3. Preserve the existing fallback-cover branch and responsive stacking.
4. Round the standard blog-card cover frame so the image, overlay, and fallback share one clipped shape.
5. Constrain the landing cover to a compact 16:9 frame and move author/read metadata into a full-width footer so preview text cannot stretch the media treatment.
6. Run the focused tests, TypeScript, lint, and diff checks.

## Post-Design Constitution Check

- No principle violations remain.
- No new component, token, dependency, or backend behavior is introduced.
- The correction stays inside the feature-owned home card and its focused test.

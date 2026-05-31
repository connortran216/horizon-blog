# Implementation Plan: Rewrite CV Achievements

**Branch**: `main`
**Spec**: [spec.md](./spec.md)
**Constitution**: [.specify/memory/constitution.md](../../.specify/memory/constitution.md)

## Technical Context

- **Stack**: React 18, TypeScript, Vite, Chakra UI.
- **Source area**: `src/features/cv/cv.data.ts`.
- **Data source**: Existing CV content in the repository; no external resume file was provided in this turn.
- **Validation**: source review, guardrail search for invented metric-style claims, `yarn lint`.
- **Runtime note**: use the available Node `v22.18.0` runtime for validation.

## Constitution Check

- **Spec-first user value**: Pass. The spec defines the reader-facing CV value and acceptance criteria.
- **Superpowers execution discipline**: Pass. The user approved the direction and explicitly requested Spec Kit before implementation.
- **Contract-aligned frontend boundaries**: Pass. The change is static frontend CV data only.
- **Design system and accessible UI**: Pass. No layout, styling, or interaction changes.
- **Focused verification**: Pass. Lint and source guardrail checks cover the narrow content-only change.

## Phase 0: Research

See [research.md](./research.md).

## Phase 1: Design & Contracts

- Data model: see [data-model.md](./data-model.md).
- Verification scenario: see [quickstart.md](./quickstart.md).
- Contracts: none. This change does not alter API, routing, or component interfaces.

## Implementation Approach

1. Rewrite experience highlights in `src/features/cv/cv.data.ts` from task phrasing to achievement/value phrasing.
2. Preserve employers, roles, periods, URLs, technology stacks, projects, and education facts.
3. Keep statements qualitative unless the existing content already contains a verified metric.
4. Run guardrail searches and lint before handoff.

## Post-Design Constitution Check

- No principle violations remain.
- No backend or API ownership concerns apply.
- The plan keeps the change in the smallest content boundary that serves the requested CV improvement.

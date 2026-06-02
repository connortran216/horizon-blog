# Implementation Plan: Redesign Contact Direct

**Branch**: `main`
**Spec**: [spec.md](./spec.md)
**Constitution**: [.specify/memory/constitution.md](../../.specify/memory/constitution.md)

## Technical Context

- **Stack**: React 18, TypeScript, Vite, Chakra UI, React Icons.
- **Source area**: `src/features/contact/`.
- **Design references**: `docs/agent-guides/workflow.md`, `docs/agent-guides/design-system.md`, `design-system/MASTER.md`, `design-system/pages/contact.md`, `design-system/components/README.md`.
- **Current behavior**: Contact page renders direct contact cards, guidance cards, and a local-only form that simulates submission with a timeout and toast.
- **Target behavior**: Contact page renders direct contact actions only, with no form fields or submit behavior.
- **Validation**: source review, static searches for removed form behavior, `rtk yarn lint`. Skip dev server because repo guidance says owner runs it.

## Constitution Check

- **Spec-first user value**: Pass. The spec defines the visitor value, form removal scope, and acceptance criteria.
- **Superpowers execution discipline**: Pass. The user approved the no-form direction before implementation.
- **Contract-aligned frontend boundaries**: Pass. No API or backend behavior is introduced.
- **Design system and accessible UI**: Pass. UI guidance and Contact page design docs were loaded before planning.
- **Focused verification**: Pass. Lint plus static checks directly cover this frontend-only route change.

## Phase 0: Research

See [research.md](./research.md).

## Phase 1: Design & Contracts

- Data model: see [data-model.md](./data-model.md).
- Verification scenario: see [quickstart.md](./quickstart.md).
- Contracts: none. This change does not alter API, route paths, request payloads, or shared backend contracts.

## Implementation Approach

1. Remove form state, submit handling, form imports, fake loading, and toast behavior from `src/features/contact/pages/ContactPage.tsx`.
2. Recompose the page around a direct-contact hero, a primary email action, and secondary phone/location details.
3. Keep outreach prompt content but present it as quiet guidance below or beside the contact methods.
4. Simplify feature-owned cards so surfaces remain distinct and motion stays quiet.
5. Validate that `/contact` no longer contains form controls or fake submit behavior.

## Post-Design Constitution Check

- No principle violations remain.
- The plan does not add dependencies, endpoints, or architecture changes.
- The design uses existing semantic tokens and feature-owned Contact components.

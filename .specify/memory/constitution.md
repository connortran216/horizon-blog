<!--
Sync Impact Report
Version change: none -> 1.0.0
Modified principles: none
Added sections: Core Principles, Development Workflow, Governance
Removed sections: none
Templates requiring updates: pending - .specify/templates are not installed in this repo
Follow-up items: none
-->

# Horizon Blog Frontend Constitution

## Core Principles

### I. Spec-First User Value

Behavior-changing frontend work MUST start from a clear user outcome, acceptance criteria, and scope boundary. Non-trivial features MUST use Spec Kit artifacts before implementation. Narrow maintenance, docs-only edits, and mechanical fixes MAY use the repo workflow directly when the change is already unambiguous.

Rationale: durable specs keep React UI changes aligned with product behavior instead of implementation guesses.

### II. Superpowers Execution Discipline

Relevant Superpowers skills MUST guide brainstorming, planning, TDD, debugging, and verification. Approval gates from those skills MUST be respected before code changes when the task changes behavior or architecture.

Rationale: Superpowers provides the working method; Spec Kit provides the persisted artifacts.

### III. Contract-Aligned Frontend Boundaries

Frontend code MUST preserve the boundary `apiService -> repository/API adapter -> service/use-case -> hook/page -> component`. UI code MUST NOT invent backend endpoints, response fields, or auth behavior. Cross-repo work MUST link to the backend contract or plan that defines the API behavior.

Rationale: API drift creates hidden regressions and pushes business logic into render paths.

### IV. Design System and Accessible UI

UI work MUST load the design-system guidance before changing layout, styling, Chakra components, or page composition. Components MUST maintain readable contrast, distinct surface colors, stable responsive dimensions, and accessible interactive states.

Rationale: the app must remain consistent and usable as feature work grows.

### V. Focused Verification

Every implementation plan MUST identify the narrowest meaningful validation. Code changes MUST run the relevant lint, type, build, or targeted checks before handoff, with `yarn build` reserved for the repo-defined build gates.

Rationale: verification must catch regressions without wasting tokens on unrelated output.

## Development Workflow

Spec Kit feature flow:

1. Use Superpowers to clarify the problem, explore options, and approve the design.
2. Create or update Spec Kit artifacts with `specify -> clarify when needed -> plan -> tasks -> implement`.
3. During planning, check this constitution and the loaded agent guides.
4. For backend/frontend features, keep a matching feature name across repos and link counterpart artifacts.
5. During implementation, follow the frontend architecture boundary and design-system requirements.
6. Before handoff, record validation commands and results in the task or plan notes.

## Governance

This constitution governs Spec Kit planning and Superpowers-assisted implementation in the frontend repo. Amendments MUST update this file and any local workflow guidance that references the changed rule.

Versioning policy:

- MAJOR: backward-incompatible governance changes or principle removals.
- MINOR: new principles, new required gates, or materially expanded workflow rules.
- PATCH: wording clarifications and non-semantic corrections.

Compliance review MUST happen during Spec Kit planning, before implementing cross-repo contract changes, and before final handoff for feature work.

**Version**: 1.0.0
**Ratified**: 2026-05-30
**Last Amended**: 2026-05-30

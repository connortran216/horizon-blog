# Workflow Guide

Use this guide for planning, validation, commits, and token-conscious investigation.

## Required Reference Loading Protocol

This file must be loaded before planning or editing in this repo. It is the baseline workflow contract.

After loading this file:

1. Classify the task by touched area.
2. Load only the matching reference docs before changing files.
3. If a task crosses areas, load all matching docs.
4. Mention the loaded guides in the first work update for non-trivial tasks.
5. Prefer local docs over memory whenever a related reference exists.

Task routing:

- UI, styling, Chakra, layout, components, page composition: load `docs/agent-guides/design-system.md`, then any required `design-system/MASTER.md`, `design-system/components/README.md`, `design-system/pages/README.md`, or page-family doc.
- Architecture, services, repositories, DI, feature boundaries, SOLID/Clean Architecture: load `docs/agent-guides/architecture.md`.
- Blog, auth, editor, API, media, profile, CV/About content rules: load `docs/agent-guides/domain.md`.
- Routes, source tree, config files, repo map: load `docs/agent-guides/project-reference.md`.
- Planning, validation, commit strategy, token use, build policy: this guide is already loaded; reread relevant sections if needed.

The goal is selective loading, not no loading. Do not skip a relevant guide to save tokens; avoid loading unrelated guides.

## Token-Conscious Exploration

- Prefix shell commands with `rtk` whenever available.
- Use `code-review-graph status`, `code-review-graph detect-changes`, and graph reports before broad manual exploration for architecture, dependency, or review tasks.
- Prefer targeted reads over full-file dumps.
- Prefer `git diff --stat` before full `git diff`.
- Prefer `rg -c` or narrow `rg -n` patterns before broad searches.
- Capture only enough output to decide the next step.

## Build Policy

`yarn build` is expensive because Vite emits a large chunk table. Use it deliberately.

Run `rtk yarn build` when:

- Final handoff needs a production-build gate.
- Shared services, DI, routes, Vite config, lazy imports, or build-entry files changed.
- TypeScript correctness cannot be established by lint/static checks.
- A previous build failed and the failure is being verified.

Usually skip build when:

- Only docs changed.
- Only comments or small copy changed.
- Only formatting changed.
- A narrow static check directly covers the acceptance criterion.

When skipping build, say why and list the narrower validation used.

## Lint and Format

- Use `rtk yarn lint` for meaningful code changes.
- Use `rtk yarn format` or `rtk yarn format:fix` only when needed.
- If pre-commit reports formatting, run targeted Prettier/formatting only on affected files where practical.

## Story Planning

For multi-task work, create separate story files. Each story should include:

- Header: Project, Service, Dependencies, Blockers.
- Context: 2-3 sentences with business value and links to PRD/technical sections when available.
- Acceptance Criteria: functional, technical, and quality gates.
- Verify and Pass for every functional and technical criterion.
- Conditional sections when relevant: Error Handling, Data Model Changes, Authentication Context, Performance Requirements.
- Interface Contracts when stories share code-level boundaries.
- Technical Approach explaining why, not step-by-step how.
- Non-Goals when scope creep is likely.
- Definition of Done.

## Refactor Workflow

- For broad architecture, Clean Architecture, SOLID, optimization, or refactor requests, write a concrete findings-and-proposals report before production code changes.
- After approval, implement stories one by one.
- Keep commits separate by story or coherent boundary.
- Update the story file with execution notes and validation results.

## Commit Guidance

- Commit format: `type(scope): short summary`.
- Keep summaries present-tense and concise.
- Use a body only when it adds useful context.
- Before committing, verify staged files match the intended boundary.
- Do not revert unrelated user changes.

## Recent Change Summaries

- Verify from the repo first.
- Use `rtk git status --short`, recent `rtk git log --oneline`, and targeted `rtk git show --stat`.
- Summarize by user-facing feature area when useful.

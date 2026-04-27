# Horizon Blog Agent Guide

This is the short working contract for AI coding agents in this repo. Keep it compact; put stable domain knowledge in linked docs.

## Scope

- Frontend only unless a task explicitly depends on the backend API.
- Owner runs the dev server and backend; do not run `yarn dev` or backend runtime commands.
- Use Yarn only. Do not use npm, and do not update `package-lock.json`.
- Do not edit `dist/`, `node_modules/`, or generated output unless explicitly requested.
- Use ASCII unless a file already requires non-ASCII.

## Token Budget Rules

- Prefer `rtk <command>` for shell commands to reduce output noise.
- Prefer `code-review-graph` for architecture/dependency exploration before broad `rg`, full-file reads, or large diffs.
- Start with low-output commands: `git status --short`, `git diff --stat`, `rg -n`, `rg -c`, and targeted `sed`.
- Avoid dumping full `yarn build` output unless diagnosing a build failure.
- Run `yarn build` only at meaningful gates: before final handoff, after shared dependency/config changes, after route/build-entry changes, or when TypeScript/Vite correctness is uncertain.
- For narrow docs, style, or single-hook changes, prefer `yarn lint` or targeted static checks first; explain when build is intentionally skipped.

## Mandatory Reference Loading

- Always load `docs/agent-guides/workflow.md` before planning or editing; it defines how work is done in this repo.
- After loading workflow, classify the task and load only the related guide(s) from the routing matrix below.
- If a task touches multiple areas, load every matching guide before changing files.
- State which guides were loaded in the first work update when the task is non-trivial.
- Do not rely on memory of these docs when the related file can be read locally.

Routing matrix:

- UI, styling, Chakra, layout, route pages, visual components: `docs/agent-guides/design-system.md`, then the referenced `design-system/` docs.
- Services, repositories, DI, feature boundaries, Clean Architecture, SOLID: `docs/agent-guides/architecture.md`.
- Blog, auth, editor, API, media, profile, CV/About content rules: `docs/agent-guides/domain.md`.
- Routes, source map, config locations, project structure: `docs/agent-guides/project-reference.md`.
- Planning, validation, commits, token use, build policy: `docs/agent-guides/workflow.md`.

## Golden Rules

- Act as a pragmatic senior frontend architect.
- Prefer small scoped changes over speculative rewrites.
- Design system first: read `design-system/MASTER.md` before UI work, then the matching page/component doc.
- Follow SOLID and the boundary `apiService -> repository/API adapter -> service/use-case -> hook/page -> component`.
- Keep UI components small and composable; keep business logic out of render paths.
- Keep logging minimal. Use `console.error` for meaningful failures; avoid production `console.log`.
- Keep frontend and API contracts aligned; do not invent endpoints or backend behavior.
- Ask before adding production dependencies, changing architecture, or adding env files.
- For broad architecture, Clean Architecture, SOLID, optimization, or refactor requests, produce a concrete findings-and-proposals report first and wait for owner discussion before changing production code.
- For multi-task planning, split work into separate story files. Follow `docs/agent-guides/workflow.md`.

## Essential Commands

- Install dependencies: `rtk yarn install`
- Lint: `rtk yarn lint`
- Lint fix: `rtk yarn lint:fix`
- Format: `rtk yarn format`
- Format fix: `rtk yarn format:fix`
- Build, only when justified by Token Budget Rules: `rtk yarn build`
- Graph status: `rtk code-review-graph status`
- Graph update after code changes when useful: `rtk code-review-graph update`
- Change impact: `rtk code-review-graph detect-changes`

## Project Shape

- Stack: React 18, TypeScript, Vite, Chakra UI, React Router, Milkdown/Crepe.
- Source root: `src/`.
- App shell: `src/app/layouts/`.
- Routes: `src/Routes.tsx`.
- Core DI/services/repositories/types: `src/core/`.
- Shared UI: `src/components/`.
- Feature modules: `src/features/`.
- Thin route wrappers: `src/pages/`.
- Static assets: `public/`.
- Backend placeholder: `server/`; do not touch unless explicitly requested.

## When You Touch Code

- First: load `docs/agent-guides/workflow.md`.
- UI: read `docs/agent-guides/design-system.md`, then follow the canonical docs under `design-system/`.
- Business logic: use services/use-cases over direct repositories from UI; read `docs/agent-guides/architecture.md`.
- Blog/auth/editor/API behavior: read `docs/agent-guides/domain.md`.
- Repo map and route list: read `docs/agent-guides/project-reference.md`.

## Reference Docs

- Architecture: `docs/agent-guides/architecture.md`
- Domain/API/editor/auth rules: `docs/agent-guides/domain.md`
- Design system and UI rules: `docs/agent-guides/design-system.md`
- Workflow and validation policy: `docs/agent-guides/workflow.md`
- Repo map and route reference: `docs/agent-guides/project-reference.md`
- Design source of truth: `design-system/MASTER.md`
- API snapshot: `api-docs.json`
- RTK global guide: `/Users/trantuancanh/.codex/RTK.md`

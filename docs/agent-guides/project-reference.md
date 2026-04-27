# Project Reference

Use this guide when you need repo map, route, stack, or configuration facts.

## Summary

- Horizon Blog is a personal playground blog for life, experience, and tech writing.
- The frontend demonstrates DI, repository/service patterns, and SOLID practices.
- Stack: React 18, TypeScript 5, Vite 6, Chakra UI 2, React Router DOM 6, Milkdown/Crepe.
- Design language is Obsidian-inspired and Chakra-based.

## Root Map

- `AGENTS.md`: short agent operating guide.
- `docs/agent-guides/`: deeper agent reference split by topic.
- `README.md`: project overview and quick start.
- `design-system/MASTER.md`: design-system source of truth.
- `DESIGN_SYSTEM.md`: compatibility entry point.
- `api-docs.json`: backend API reference snapshot.
- `index.html`: Vite entry HTML.
- `vite.config.ts`: Vite config.
- `package.json`: scripts and dependencies.
- `package-lock.json`: legacy lockfile; do not update with npm.
- `public/`: static assets.
- `src/`: frontend source.
- `server/`: backend placeholder; do not touch unless requested.

## Source Map

- `src/App.tsx`: app shell and providers.
- `src/Routes.tsx`: route definitions.
- `src/app/layouts/`: app chrome and shell.
- `src/components/`: shared UI, editor, reader, animation, and layout compatibility components.
- `src/config/`: runtime and editor configuration.
- `src/context/`: global React context, including auth.
- `src/core/`: DI, services, repositories, domain types, and core utilities.
- `src/features/`: feature-owned pages, hooks, components, types, and API adapters.
- `src/pages/`: thin route entry points.
- `src/theme/`: Chakra theme.
- `src/utils/`: helper utilities.

## Routes

- `/` -> Home.
- `/blog` -> Blog archive.
- `/blog/:id` -> Blog detail.
- `/authors/:authorName` -> Author archive.
- `/contact` -> Contact.
- `/about` -> About.
- `/login` -> Login.
- `/login/callback` -> Login callback.
- `/register` -> Register.
- `/forgot-password` -> Forgot password.
- `/reset-password` -> Reset password.
- `/blog-editor` -> Blog editor, protected.
- `/profile/:username` -> Profile, protected.
- `/profile/:username/blog/:id` -> Profile blog detail, protected.

## Protected Routes

- `ProtectedRoute` checks auth status and user.
- Loading auth state should show shared `LoadingState`, not a raw spinner.
- Unauthenticated users redirect to `/login` and preserve destination.
- Protected routes cover authoring and profile content.

## Configuration

- `.env.development` and `.env.production` exist.
- Do not add new env files without agreement.
- Runtime API config lives in `src/config/runtime.ts`.
- Editor config lives in `src/config/editor.config.ts`.
- Crepe config lives in `src/config/crepe.config.ts`.


# Storybook MCP component discovery

## Goal

Give coding agents a structured catalog of existing Horizon design-system components so they can evaluate reuse and composition before creating custom UI.

## Scope

- Add Storybook for the existing React/Vite frontend.
- Serve the Storybook MCP docs toolset at `/mcp`.
- Enable the React components manifest required by docs discovery.
- Register the local endpoint in project-scoped Codex configuration.
- Pilot six representative components with semantic docs and meaningful states.
- Preserve `ui-kit.html` as the complete visual and coverage gate.

## Non-goals

- Replacing the v2 gallery or its coverage audit.
- Migrating production page composition.
- Adding Storybook interaction tests, visual hosting, or CI publishing.
- Creating a public `SiteHeader` API during the catalog pilot.

## Acceptance criteria

1. `yarn storybook` serves the catalog on port 6006 and an MCP endpoint at `/mcp`.
2. MCP exposes `docs-list`, `docs-show`, and `docs-show-story` only.
3. The manifest contains Button, Field, PostCard, MediaFrame, ErrorState, and NavItem documentation.
4. Stories render inside the Horizon theme and router context in light and dark modes.
5. The Storybook static build, TypeScript, lint, existing tests, and design-system coverage pass.

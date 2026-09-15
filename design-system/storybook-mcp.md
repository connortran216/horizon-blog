# Storybook MCP catalog

Storybook is Horizon's agent-readable component catalog. The existing `ui-kit.html` gallery remains the visual-review and complete-coverage gate; Storybook adds structured component APIs and named states for discovery before custom UI work.

## Run locally

```sh
yarn storybook
```

- Catalog: `http://localhost:6006`
- MCP endpoint: `http://localhost:6006/mcp`
- Static verification: `yarn storybook:build`

The project-scoped `.codex/config.toml` registers the MCP endpoint for trusted Codex clients. Restart the Codex desktop app or begin a fresh local session after starting Storybook so the host can rebuild its tool catalog.

## Agent decision gate

Before creating or customizing a reusable UI surface:

1. Run `docs-list` to find candidate components.
2. Run `docs-show` for the candidate API, semantics, and usage notes.
3. Run `docs-show-story` for the closest complete state.
4. Reuse the component when it meets the required behavior, states, responsiveness, and accessibility.
5. Compose existing components when the need is a new arrangement rather than new behavior.
6. Document the missing capability before creating a new shared component.

## Pilot scope

The first catalog slice covers `Button`, `Field`, `PostCard`, `MediaFrame`, `ErrorState`, and `NavItem`. `SiteHeader` is not a public v2 design-system export, so the pilot records that as a capability gap instead of inventing a header contract.

Stories use the mounted Horizon v2 Chakra theme, a router context, production-shaped synthetic fixtures, and a light/dark toolbar. The MCP addon exposes only its read-only docs toolset; Storybook test and story-generation tools remain out of scope for this pilot.

## Compatibility note

The frontend currently uses Yarn Plug'n'Play. Storybook 10.6 still runs with it, but prints an upstream deprecation warning and the config must resolve addon preset paths explicitly. Keep the Storybook packages pinned together at 10.6.0; reassess the linker before a future major Storybook upgrade.

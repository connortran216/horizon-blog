# Implementation plan

## Approach

1. Install aligned Storybook 10.6 React/Vite, docs, and MCP development packages.
2. Configure a docs-only MCP server and React components manifest.
3. Mount stories under the v2 Chakra provider and a memory router.
4. Add a representative story slice that reuses existing synthetic fixtures.
5. Document the agent discovery gate and configure the local Codex endpoint.
6. Prove the static catalog, MCP tool list, manifest contents, and existing repository gates.

## Design decisions

- Storybook is additive to `ui-kit.html`, not a replacement.
- The docs toolset is the smallest surface matching the user goal; mutation and test tools remain disabled.
- `NavItem` replaces the originally suggested `SiteHeader` pilot because only the former is a public v2 export today.
- New story/config files do not change production component behavior.
- Storybook packages stay version-aligned and pinned because Storybook 10 warns that Yarn Plug'n'Play support is deprecated for future releases.

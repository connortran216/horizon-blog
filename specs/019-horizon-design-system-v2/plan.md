# Implementation plan

## Repository

- Frontend: `/Users/trantuancanh/Personal/work/horizon-blog/horizon-blog`
- Base: `origin/main` at `536c262`
- Epic branch: `codex/epic-horizon-blog-dsv2`
- Worktree: `.codex/worktrees/dsv2-epic`

## Waves

| Wave | Bundles | Purpose |
| --- | --- | --- |
| 0 | B0 | Governance, complete inventory, source of truth |
| 1 | B1 | Typed tokens and Chakra adapter |
| 2 | B2, B3 | Core primitives plus motion/feedback/media |
| 3 | B4, B5 | Editorial and product domain patterns |
| 4 | B6 | Gallery, coverage audit, migration readiness |

## Integration policy

- Bundles use one isolated worktree/branch each when split from the Epic branch.
- The parent owns dependency state, validation, integration, and Beads updates.
- Production page files may be read and represented in the inventory, but page composition changes are rejected until B6 passes.
- Compatibility adapters may preserve current imports; adapters must be listed in the inventory with a removal target.

## Gates

- G0: every ticket has source-grounded spec and plan; inventory and ownership collisions resolved.
- G1: worktree, branch, dependency base, tooling, and ticket artifacts verified before implementation.
- G2: bundle diff and narrow checks pass; component states and contracts are demonstrated.
- G3: integrated Epic branch passes full tests, lint, typecheck, format, build, and coverage audit.
- G4: B6 visual and accessibility matrix passes and migration readiness is recorded.

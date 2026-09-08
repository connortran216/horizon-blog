# horizon-blog-y2e.1.1 implementation plan

Spec: [spec.md](spec.md)
Design approved: prototype 2026-09-06. This implementation plan is agent-reviewed, not separately human-approved.

## Concrete source ownership
- `design-system/MASTER.md`
- `design-system/components/README.md`

## Technical approach
Reuse Chakra semantic tokens, existing feature components/hooks and service adapters. Approved tokens, motion, coverage, references and QA limits are indexed with hashes; old guidance is explicitly superseded.

## Ordered execution
- [x] S1 Inspect the listed source and matching design-system page guide; compare approved prototype states. (AC1/AC2)
- [x] S2 Implement this ticket in its bundle worktree, keeping service calls and permissions; shared tokens belong only to B1. (AC1/AC2)
- [x] S3 Run targeted regression tests for changed behavior, `rtk yarn lint`, `rtk yarn tsc --noEmit`; run `rtk yarn build` at the bundle handoff. (AC2/AC3)
- [ ] S4 Compare mobile/desktop light/dark and reduced-motion UI; record exact commands, outcomes, changed files and residual gaps. (AC1/AC3)

## Risks and boundaries
Old explicit color/font overrides may outlive theme migration; remove only overrides in owned surfaces. Do not port prototype localStorage auth or demo fixtures. Scheduling is a draft timestamp; preserve owner-only capabilities and SEO/media resolution. Revalidate plans after upstream integration.


Checkpoint: B1-report.md in bundle worktree. Static validation passed; S4 browser comparison pending.

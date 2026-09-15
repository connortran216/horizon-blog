# Plan for horizon-blog-dsv2.7.3

## Spec

[`spec.md`](./spec.md)

## Files and symbols

- `specs/019-horizon-design-system-v2/migration-readiness.md`
- `design-system/coverage-report.md`

## Implementation checklist

- [ ] Run targeted tests, full tests, lint, typecheck, format, build, coverage audit, and graph change detection.
- [ ] Visually inspect representative components at 375, 768, 1024, and 1440 in both themes.
- [ ] Validate keyboard, touch, normal/reduced motion, long content, loading, empty, error, and failed media.
- [ ] Record migration order and outstanding accepted risks.

## Verification

- [ ] All required automated checks pass.
- [ ] Visual matrix has no unresolved P0/P1/P2 issue.
- [ ] Beads page-migration dependency is only cleared after this evidence exists.
- [ ] Run the narrowest relevant tests and TypeScript check.
- [ ] Run `rtk code-review-graph detect-changes --base origin/main --brief` before commit.

## Risks

- Compatibility adapters can hide incomplete migration; every adapter must remain visible in the inventory.
- Component abstraction can erase domain identity; shared primitives own behavior while patterns own content hierarchy.
- Motion can regress accessibility or performance; reduced-motion and cleanup behavior are acceptance criteria.

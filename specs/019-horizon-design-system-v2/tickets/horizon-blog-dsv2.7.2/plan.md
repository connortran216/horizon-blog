# Plan for horizon-blog-dsv2.7.2

## Spec

[`spec.md`](./spec.md)

## Files and symbols

- `scripts/design-system/check-coverage.mjs`
- `design-system/component-inventory.md`
- `design-system/coverage-report.md`

## Implementation checklist

- [ ] Compare filesystem UI inventory with registry exports and gallery examples.
- [ ] Fail on missing, duplicate, or unowned mappings.
- [ ] Document compatibility aliases and removal timing.
- [ ] Reconcile counts after each change.

## Verification

- [ ] Coverage command exits zero.
- [ ] No silently custom component remains.
- [ ] Every compatibility alias has an owner and target.
- [ ] Run the narrowest relevant tests and TypeScript check.
- [ ] Run `rtk code-review-graph detect-changes --base origin/main --brief` before commit.

## Risks

- Compatibility adapters can hide incomplete migration; every adapter must remain visible in the inventory.
- Component abstraction can erase domain identity; shared primitives own behavior while patterns own content hierarchy.
- Motion can regress accessibility or performance; reduced-motion and cleanup behavior are acceptance criteria.

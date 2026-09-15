# Plan for horizon-blog-dsv2.1.1

## Spec

[`spec.md`](./spec.md)

## Files and symbols

- `design-system/component-inventory.md`
- `src/**/*.tsx`
- `src/theme/index.ts`

## Implementation checklist

- [ ] Enumerate implementation, shell, feature component, and page-composition TSX files.
- [ ] Classify each file as replace, adapt, retain behavior, compatibility, or deferred page migration.
- [ ] Assign each visual file to one v2 ticket and record state, theme, responsive, and accessibility obligations.
- [ ] Reconcile inventory counts against filesystem counts.

## Verification

- [ ] No implementation file is unclassified.
- [ ] Inventory count equals source query count.
- [ ] Page-owned surfaces are explicitly deferred rather than omitted.
- [ ] Run the narrowest relevant tests and TypeScript check.
- [ ] Run `rtk code-review-graph detect-changes --base origin/main --brief` before commit.

## Risks

- Compatibility adapters can hide incomplete migration; every adapter must remain visible in the inventory.
- Component abstraction can erase domain identity; shared primitives own behavior while patterns own content hierarchy.
- Motion can regress accessibility or performance; reduced-motion and cleanup behavior are acceptance criteria.

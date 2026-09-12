# Plan for horizon-blog-dsv2.6.3

## Spec

[`spec.md`](./spec.md)

## Files and symbols

- `src/design-system/patterns/data/**`
- `src/features/author-analytics/components/**`
- `src/features/access-management/**`

## Implementation checklist

- [ ] Build Metric, Trend, Funnel, Breakdown, DataTable, DateRange, InsightList, PermissionTable, and destructive-action patterns.
- [ ] Cover zero samples, approximate readers, partial data, overflow, loading, error, denied, and destructive confirmation.
- [ ] Keep charts readable before animation.
- [ ] Provide mobile table and metric adaptations.

## Verification

- [ ] Approximate metrics are labelled.
- [ ] Tables scroll within their container.
- [ ] Permissions and destructive actions retain backend authority.
- [ ] Run the narrowest relevant tests and TypeScript check.
- [ ] Run `rtk code-review-graph detect-changes --base origin/main --brief` before commit.

## Risks

- Compatibility adapters can hide incomplete migration; every adapter must remain visible in the inventory.
- Component abstraction can erase domain identity; shared primitives own behavior while patterns own content hierarchy.
- Motion can regress accessibility or performance; reduced-motion and cleanup behavior are acceptance criteria.

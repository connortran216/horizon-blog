# Plan for horizon-blog-dsv2.5.2

## Spec

[`spec.md`](./spec.md)

## Files and symbols

- `src/design-system/patterns/series/**`
- `src/features/series/components/**`

## Implementation checklist

- [ ] Build SeriesCover, SeriesCard, SeriesRail, RailOverlayControls, SeriesContext, PartList, and ManageSeriesItem.
- [ ] Support snap, drag, click suppression, keyboard controls, touch peek, pagination append, retry, and reduced motion.
- [ ] Keep ordered part connectors and reading context separate from normal post cards.
- [ ] Provide production-shaped fixtures.

## Verification

- [ ] Visible range text is absent when controls already communicate position.
- [ ] Overlay arrows are circular and translucent.
- [ ] All async and interaction paths retain data safely.
- [ ] Run the narrowest relevant tests and TypeScript check.
- [ ] Run `rtk code-review-graph detect-changes --base origin/main --brief` before commit.

## Risks

- Compatibility adapters can hide incomplete migration; every adapter must remain visible in the inventory.
- Component abstraction can erase domain identity; shared primitives own behavior while patterns own content hierarchy.
- Motion can regress accessibility or performance; reduced-motion and cleanup behavior are acceptance criteria.

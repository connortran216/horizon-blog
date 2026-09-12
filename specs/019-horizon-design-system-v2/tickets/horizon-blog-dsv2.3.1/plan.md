# Plan for horizon-blog-dsv2.3.1

## Spec

[`spec.md`](./spec.md)

## Files and symbols

- `src/design-system/components/layout/**`
- `src/design-system/components/surface/**`
- `src/design-system/components/typography/**`

## Implementation checklist

- [ ] Build AppFrame, ContentContainer, Section, responsive Stack/Grid, ProseMeasure, Surface, and Divider.
- [ ] Expose semantic typography recipes for display, page title, section title, card title, body, prose, and metadata.
- [ ] Support polymorphic semantic elements without any types.
- [ ] Add focused component tests.

## Verification

- [ ] Breakpoints match the approved 680/1000 transitions.
- [ ] Surfaces define depth roles rather than hardcoded shadows.
- [ ] Semantic HTML remains available through component APIs.
- [ ] Run the narrowest relevant tests and TypeScript check.
- [ ] Run `rtk code-review-graph detect-changes --base origin/main --brief` before commit.

## Risks

- Compatibility adapters can hide incomplete migration; every adapter must remain visible in the inventory.
- Component abstraction can erase domain identity; shared primitives own behavior while patterns own content hierarchy.
- Motion can regress accessibility or performance; reduced-motion and cleanup behavior are acceptance criteria.

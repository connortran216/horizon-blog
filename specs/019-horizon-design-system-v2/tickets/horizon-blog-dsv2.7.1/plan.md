# Plan for horizon-blog-dsv2.7.1

## Spec

[`spec.md`](./spec.md)

## Files and symbols

- `src/design-system/gallery/**`
- `ui-kit.html`
- `vite.config.ts`

## Implementation checklist

- [ ] Render all components with production-shaped fixtures.
- [ ] Expose light/dark, desktop/tablet/mobile, normal/reduced motion, long content, missing media, and error controls.
- [ ] Keep gallery outside production navigation and service calls.
- [ ] Capture a component-state index.

## Verification

- [ ] Every implemented v2 export appears in the gallery.
- [ ] Gallery works without backend state.
- [ ] Production routes retain legacy composition.
- [ ] Run the narrowest relevant tests and TypeScript check.
- [ ] Run `rtk code-review-graph detect-changes --base origin/main --brief` before commit.

## Risks

- Compatibility adapters can hide incomplete migration; every adapter must remain visible in the inventory.
- Component abstraction can erase domain identity; shared primitives own behavior while patterns own content hierarchy.
- Motion can regress accessibility or performance; reduced-motion and cleanup behavior are acceptance criteria.

# Plan for horizon-blog-dsv2.4.1

## Spec

[`spec.md`](./spec.md)

## Files and symbols

- `src/design-system/motion/**`
- `src/components/core/animations/**`

## Implementation checklist

- [ ] Implement Reveal, Stagger, HoverLift, PressFeedback, LayoutTransition, and ViewTransition helpers.
- [ ] Centralize duration, easing, spring, distance, and sequencing tokens.
- [ ] Use transform and opacity for recurring motion.
- [ ] Provide touch and reduced-motion behavior plus cleanup tests.
- [ ] Keep legacy animation modules as compatibility adapters until migration.

## Verification

- [ ] No infinite decorative animation in reading surfaces.
- [ ] Reduced motion removes translation and ambient movement.
- [ ] Timers, observers, and animation frames clean up.
- [ ] Run the narrowest relevant tests and TypeScript check.
- [ ] Run `rtk code-review-graph detect-changes --base origin/main --brief` before commit.

## Risks

- Compatibility adapters can hide incomplete migration; every adapter must remain visible in the inventory.
- Component abstraction can erase domain identity; shared primitives own behavior while patterns own content hierarchy.
- Motion can regress accessibility or performance; reduced-motion and cleanup behavior are acceptance criteria.

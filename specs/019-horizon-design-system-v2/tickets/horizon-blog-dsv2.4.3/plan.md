# Plan for horizon-blog-dsv2.4.3

## Spec

[`spec.md`](./spec.md)

## Files and symbols

- `src/design-system/components/media/**`
- `src/features/media/components/DefaultPostCover.tsx`

## Implementation checklist

- [ ] Build MediaFrame, ResponsiveImage, MediaPlaceholder, MediaError, and MediaRetry.
- [ ] Preserve layout with explicit aspect ratios.
- [ ] Fade in only after decode and honor reduced motion.
- [ ] Keep durable media resolution behavior outside render components.

## Verification

- [ ] Loading, ready, absent, error, and retry states are covered.
- [ ] Alt and decorative semantics are explicit.
- [ ] Retry can request a fresh signed source.
- [ ] Run the narrowest relevant tests and TypeScript check.
- [ ] Run `rtk code-review-graph detect-changes --base origin/main --brief` before commit.

## Risks

- Compatibility adapters can hide incomplete migration; every adapter must remain visible in the inventory.
- Component abstraction can erase domain identity; shared primitives own behavior while patterns own content hierarchy.
- Motion can regress accessibility or performance; reduced-motion and cleanup behavior are acceptance criteria.

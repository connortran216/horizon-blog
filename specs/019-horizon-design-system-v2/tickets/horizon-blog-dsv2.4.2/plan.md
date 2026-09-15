# Plan for horizon-blog-dsv2.4.2

## Spec

[`spec.md`](./spec.md)

## Files and symbols

- `src/design-system/components/feedback/**`

## Implementation checklist

- [ ] Build PageLoading, PanelLoading, InlineLoading, Skeleton, EmptyState, ErrorState, PermissionState, MissingState, OfflineState, and RetryAction.
- [ ] Separate route loading from content-shaped media loading.
- [ ] Use concise contextual copy and polite live regions.
- [ ] Validate stable dimensions and reduced motion.

## Verification

- [ ] No blank async surface.
- [ ] Feedback actions are keyboard accessible.
- [ ] Skeletons and loaders preserve layout and do not compete.
- [ ] Run the narrowest relevant tests and TypeScript check.
- [ ] Run `rtk code-review-graph detect-changes --base origin/main --brief` before commit.

## Risks

- Compatibility adapters can hide incomplete migration; every adapter must remain visible in the inventory.
- Component abstraction can erase domain identity; shared primitives own behavior while patterns own content hierarchy.
- Motion can regress accessibility or performance; reduced-motion and cleanup behavior are acceptance criteria.

# Plan for horizon-blog-dsv2.5.1

## Spec

[`spec.md`](./spec.md)

## Files and symbols

- `src/design-system/patterns/posts/**`
- `src/features/home/components/**`
- `src/features/blog/components/**`
- `src/features/authors/components/**`

## Implementation checklist

- [ ] Define PostMetadata and AuthorIdentity as shared content contracts.
- [ ] Build SignatureStory, FeaturedStory, PostCard, PostRow, FilterBar, and Pagination composition patterns.
- [ ] Exercise long titles, excerpts, missing media, tags, and real dates.
- [ ] Provide compatibility adapters without replacing pages.

## Verification

- [ ] Signature and normal cards remain distinct.
- [ ] Content does not duplicate hierarchy labels.
- [ ] Hover, focus, touch, loading, empty, and error states are visible.
- [ ] Run the narrowest relevant tests and TypeScript check.
- [ ] Run `rtk code-review-graph detect-changes --base origin/main --brief` before commit.

## Risks

- Compatibility adapters can hide incomplete migration; every adapter must remain visible in the inventory.
- Component abstraction can erase domain identity; shared primitives own behavior while patterns own content hierarchy.
- Motion can regress accessibility or performance; reduced-motion and cleanup behavior are acceptance criteria.

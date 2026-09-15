# Plan for horizon-blog-dsv2.5.3

## Spec

[`spec.md`](./spec.md)

## Files and symbols

- `src/design-system/patterns/reader/**`
- `src/components/reader/**`
- `src/features/comments/components/**`
- `src/features/reader-interactions/components/**`

## Implementation checklist

- [ ] Build ReaderFrame, Prose, CodeBlock, DiagramFrame, TOC, ReadingProgress, ReactionBar, ShareAction, and CommentThread patterns.
- [ ] Keep prose width and motion calm.
- [ ] Cover copy success/failure, render failure, deep links, long tables, and nested comments.
- [ ] Preserve real permission and interaction contracts.

## Verification

- [ ] Code and tables scroll locally.
- [ ] TOC and progress remain accessible.
- [ ] Reader feedback does not move into opening metadata.
- [ ] Run the narrowest relevant tests and TypeScript check.
- [ ] Run `rtk code-review-graph detect-changes --base origin/main --brief` before commit.

## Risks

- Compatibility adapters can hide incomplete migration; every adapter must remain visible in the inventory.
- Component abstraction can erase domain identity; shared primitives own behavior while patterns own content hierarchy.
- Motion can regress accessibility or performance; reduced-motion and cleanup behavior are acceptance criteria.

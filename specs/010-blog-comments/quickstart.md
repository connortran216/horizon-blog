# Verification Guide: Blog Comments Frontend

## Focused tests

```bash
rtk yarn test src/features/comments
rtk yarn test src/features/blog/pages/BlogDetailPage.performance.test.tsx
rtk yarn test src/features/reader-interactions
```

## Static gates

```bash
rtk yarn tsc --noEmit
rtk yarn lint
```

## Production gate

The feature changes shared reader composition and DI-adjacent feature wiring, so run:

```bash
rtk yarn build
```

## 2026-07-27 implementation results

- Focused comments, reader interaction, and article isolation tests: 20 passed.
- Full frontend suite: 46 test files and 165 tests passed.
- `yarn tsc --noEmit`: passed.
- `yarn lint`: passed.
- `yarn build`: passed; existing large-chunk advisory warnings remain.

## Acceptance checks

- Signed-out readers load comments and return from login to `#comments`.
- Signed-in readers can create depth 0, 1, and 2 comments.
- Depth-2 comments have no reply action.
- Script-like input renders as plain text.
- Pagination appends and deduplicates siblings.
- A failed comment request does not hide the article or existing discussion.
- Owner/commenter controls follow server capabilities.
- Removal either deletes the visible leaf or preserves a content-free tombstone.
- Closing comments preserves reads and disables composers.
- Comment control in the reader interaction bar reaches the discussion heading.

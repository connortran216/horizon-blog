# Quickstart: Blog Interaction Analytics Frontend

## Reader Review Scenario

1. Open a published blog anonymously.
2. Confirm a compact icon row appears after the article content, heart/share are usable, and unsupported comment/repost/more actions are visibly muted.
3. Heart, unheart, refresh, and confirm reconciled state.
4. Share through Facebook, X, LinkedIn, and copy-link menu actions.
5. Scroll through milestones, idle, hide the tab, return, and leave.
6. Click internal, external, and same-page links; confirm navigation is never blocked.
7. Confirm retried events keep the same event ID and active-time reports stay cumulative and monotonic.

## Author Review Scenario

1. Authenticate and open `/analytics`.
2. Switch 7, 30, 90 day and custom ranges.
3. Sort and paginate blog metrics.
4. Open `/analytics/blog/:id`.
5. Confirm trend, progress funnel, reactions, links, sources, insights, and freshness.
6. Confirm approximate reader counts are labeled without implying exact precision.
7. Verify loading, empty, error, low-sample, and not-found states.
8. Verify mobile/desktop, keyboard, light/dark, and reduced-motion behavior.

## Static and Build Validation

```sh
rtk yarn lint
rtk yarn format
rtk yarn build
```

## Contract Validation

- Compare frontend types and fixtures with backend generated Swagger and `contracts/api-contracts.md`.
- Confirm no existing blog API fields or endpoint assumptions were invented.
- Confirm active-time sequencing, stable retry event IDs, reaction trends, and approximate-reader formatting match backend fixtures.

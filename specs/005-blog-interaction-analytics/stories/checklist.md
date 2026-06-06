# Blog Interaction Analytics Frontend Story Tracker

## Overall Status

- [x] Story 01: [Freeze fixtures and create frontend foundations](./01-fixtures-foundations.md)
- [x] Story 02: [Implement reader interactions and instrumentation](./02-reader-interactions.md)
- [ ] Story 03: [Implement author analytics data layer](./03-author-data-layer.md)
- [ ] Story 04: [Implement overview and blog-detail analytics UI](./04-overview-detail-ui.md)
- [ ] Story 05: [Implement comparison and insight presentation](./05-comparison-insights.md)
- [ ] Story 06: [Validate cross-repo journeys](./06-cross-repo-validation.md)

## Dependency Tiers

| Tier | Stories | Reason |
| --- | --- | --- |
| 1 | 01 | Freezes fixtures and independent foundations. |
| 2 | 02, 03 | Reader integration and author data layer can proceed independently against stable contracts. |
| 3 | 04 | UI composition depends on stable author display models. |
| 4 | 05 | Comparison and insights depend on page composition and backend insight DTOs. |
| 5 | 06 | Final validation depends on complete reader and author journeys. |

## Sequenced Shared-File Ownership

| File | Sequenced owners |
| --- | --- |
| `src/features/blog/components/BlogReaderFrame.tsx` | Story 02 |
| `src/core/di/container.ts` | Story 03 |
| `src/Routes.tsx` | Story 04 overview route first, then Story 04 detail route in the same branch |
| `src/app/layouts/UserMenu.tsx`, `design-system/pages/analytics.md` | Story 04 |
| `design-system/components/README.md` analytics rules | Story 05 |

## Commit Tracking

| Story | Status | Commit | Validation |
| --- | --- | --- | --- |
| 01 | Complete | `feat(analytics): FE Fixtures + Foundations` | `yarn test src/features/reader-interactions src/features/author-analytics`; `yarn lint`; `yarn format`; `yarn build` |
| 02 | Complete | `feat(analytics): Reader Interactions + Instrumentation` | `yarn test src/features/reader-interactions`; `yarn lint`; `yarn format`; `yarn build`; live backend journey deferred to Story 06 |
| 03 | Pending | | |
| 04 | Pending | | |
| 05 | Pending | | |
| 06 | Pending | | |

# Performance Optimization Frontend Story Tracker

## Overall Status

- [x] Story 01: [Add the summary data boundary](./01-summary-data-boundary.md)
- [x] Story 02: [Switch home and archive to summaries](./02-home-archive-summaries.md)
- [x] Story 03: [Batch analytics delivery](./03-analytics-batching.md)
- [ ] Story 04: [Validate reader independence and cross-repo performance](./04-reader-cross-repo-validation.md)

## Dependency Tiers

| Tier | Stories | Reason |
| --- | --- | --- |
| 1 | 01, 03 | Summary data work depends only on backend contract; analytics batching is independent. |
| 2 | 02 | Requires stable summary repository/service behavior. |
| 3 | 04 | Requires completed frontend stories and deployed backend behavior. |

## Sequenced Shared-File Ownership

| File | Owner |
| --- | --- |
| `src/core/types/blog*.ts`, repository/service interfaces and implementations | Story 01 |
| `src/features/home/**`, `src/features/blog/useBlogArchive.ts`, listing cards/pages | Story 02 |
| `src/features/reader-interactions/analytics-event.transport.ts`, `useReaderSession.ts` | Story 03 |
| article independence tests, build/browser evidence | Story 04 |

## Commit Tracking

| Story | Status | Commit | Validation |
| --- | --- | --- | --- |
| 01 | Complete | Uncommitted | Summary endpoint selection, direct mapping, optional fields, pagination, and cache separation pass |
| 02 | Complete | Uncommitted | Home/archive use summaries; filtered search compatibility and card fallbacks pass |
| 03 | Complete | Uncommitted | Single-flight delivery and 30-second batching pass with 16 reader regression tests |
| 04 | Deployment blocked | Uncommitted | Local gates and current-production browser checks pass; post-change production sample pending deployment |

## Validation Evidence

- Full frontend suite: 24 files and 56 tests pass on Node 22.
- `yarn lint`, `yarn tsc --noEmit`, `yarn format`, and `yarn build` pass.
- Nine-summary backend fixture is 4,323 bytes versus the current deployed nine-post payload of 197,577 bytes.
- Production build: main 546.57 kB / 180.43 kB gzip, home 9.75 / 3.13, archive 15.47 / 4.89, article 14.13 / 5.25.
- Owner analytics endpoints occur only in the protected analytics chunk; main, home, archive, and article chunks contain none.
- Browser checks pass on the deployed home, archive, and article 76 at desktop and 390x844 with no horizontal overflow.
- T030 is blocked until the backend summary route and frontend consumer are deployed; current production returns 400 for `/posts/summaries`.

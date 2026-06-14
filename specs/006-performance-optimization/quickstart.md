# Quickstart: Performance Optimization Frontend

Use Node 22 if the default runtime reports `EBADF`:

```sh
export PATH=/Users/trantuancanh/.nvm/versions/node/v22.18.0/bin:$PATH
```

## Validation Commands

```sh
rtk yarn test src/core/repositories/blog.repository.performance.test.ts
rtk yarn test src/features/reader-interactions
rtk yarn test src/features/blog
rtk yarn lint
rtk yarn tsc --noEmit
rtk yarn format
rtk yarn build
```

The owner runs application servers. Do not start `yarn dev`.

## Manual Journeys

1. Load home and unfiltered archive; verify card content and fallbacks while requests use `/posts/summaries`.
2. Open a full article and editor; verify full content still uses existing post endpoints.
3. Delay reaction state and analytics by at least five seconds; verify article content, scrolling, links, and navigation remain usable.
4. Simulate active reading and progress; verify at most one routine delivery per 30-second interval.
5. Trigger concurrent interval/link/lifecycle flushes; verify one delivery is in flight and queued events are retained.
6. Verify hidden, unfocused, and idle tabs add no active time.
7. Navigate public routes unauthenticated; verify no owner analytics requests and separate analytics chunks in the production build.

## Cross-Repo Gate

- Compare frontend types with backend Swagger.
- Record summary bytes and before/after route chunk sizes.
- After deployment, correlate browser article-visible behavior with the backend 30-sample latency report.

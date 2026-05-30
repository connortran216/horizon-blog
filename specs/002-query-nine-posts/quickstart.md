# Quickstart: Query Nine Posts

## Verify Source Values

```sh
rg -n "limit: 9|const limit = 9|getPublishedPosts\\(\\{ limit: 9 \\}\\)" AGENTS.md docs/agent-guides/workflow.md src/features -S
```

Expected relevant matches:

- `src/features/home/pages/HomePage.tsx` uses `getPublishedPosts({ limit: 9 })`.
- `src/features/blog/pages/BlogPage.tsx` sets `const limit = 9`.
- `src/features/profile/useProfilePosts.ts` initializes published and draft pagination limits to `9`.

## Verify Old Limit Is Removed From Relevant Requests

```sh
rg -n "limit: 6|const limit = 6|getPublishedPosts\\(\\{ limit: 6 \\}\\)" src/features src/core -S
```

Expected result: no matches.

## Run Lint

```sh
PATH=/Users/trantuancanh/.nvm/versions/node/v22.18.0/bin:$PATH yarn lint
```

Expected result: exit code 0.

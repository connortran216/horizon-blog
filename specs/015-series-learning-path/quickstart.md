# Verification: Series Learning Paths Frontend

## Focused tests

```bash
rtk yarn test src/features/series
rtk yarn test src/features/blog/pages/BlogDetailPage.performance.test.tsx
```

## Static and production gates

```bash
rtk yarn tsc --noEmit
rtk yarn lint
rtk yarn build
```

If the default Node runtime returns `EBADF`, retry with the documented Node 22 path.

## Manual layout checks

- Public series at 375px, 768px, 1024px, and 1440px.
- Light and dark mode contrast.
- Keyboard focus through every public and owner action.
- Reduced-motion mode.
- Reader article remains usable when the series request fails.

## Results

- Focused series tests: 5 files and 8 tests passed.
- Full frontend suite: 68 files and 247 tests passed.
- `yarn tsc --noEmit`: passed.
- Scoped ESLint over every changed source file: passed.
- `yarn build`: passed. The existing large-chunk warnings remain unchanged in kind.
- Global `yarn lint`: blocked only by 7 pre-existing/generated `.gitnexus/run.cjs` findings; feature source has no lint findings.
- Responsive Chakra props, keyboard-visible actions, accessible labels, empty/error states, and article failure isolation were reviewed in source. A live responsive pass still needs a running API with seeded series data.

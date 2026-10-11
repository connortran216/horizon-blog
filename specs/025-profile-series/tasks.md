# Tasks: Series on the profile (PR 1)

**Spec**: `specs/025-profile-series/spec.md`
**Plan**: `specs/025-profile-series/plan.md`

## A - Design system

- [x] A-1 `componentTokens.series` mark and composer aliases, token export
- [x] A-2 `spine.logic.ts` + tests
- [x] A-3 `SeriesSpine` + render test
- [x] A-4 `seriesComposer.logic.ts` + tests, `SeriesComposer` + render test
- [x] A-5 `PostSeriesReference.href` + test
- [x] A-6 Barrel exports, gallery registry rows and entries

## B - Profile

- [x] B-1 `useOwnerSeries({ enabled })`
- [x] B-2 `ownerSeries.presentation.ts` + tests
- [x] B-3 `ProfileSeriesSection` + render test
- [x] B-4 Profile page wiring: permission gate, masthead count, card positions

## C - Docs and validation

- [x] C-1 `pages/profile.md`, `pages/series.md`
- [x] C-2 Full suite, lint, format, typecheck, DS coverage, token export, build
- [x] C-3 Browser check of the gallery: narrow cell and full-width row, both themes (the live /profile needs a signed-in backend and was not rendered)

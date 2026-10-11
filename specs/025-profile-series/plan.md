# Plan: Series on the profile (PR 1)

**Spec**: `specs/025-profile-series/spec.md`

## Design system layer

| Addition                                       | Where                               | Notes                                                                            |
| ---------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------- |
| `spine.logic.ts`                               | `src/design-system/patterns/series` | live run, lit extent, marks with spoken labels, tally copy; pure                 |
| `SeriesSpine`                                  | `src/design-system/patterns/series` | title, description, meta, track (`ol` of marks), action slot; lit run draws once |
| `seriesComposer.logic.ts`                      | `src/design-system/patterns/series` | title/description limits, submit gate, the reason a submit is disabled           |
| `SeriesComposer`                               | `src/design-system/patterns/series` | unboxed form under an action rule; caller owns the values                        |
| `PostSeriesReference.href`                     | `patterns/posts/content.logic.ts`   | optional destination for the `Part X of Y` link; default stays `/series/:slug`   |
| `componentTokens.series.mark*`, `composerRule` | `src/theme/tokens/components.ts`    | aliases: `action.primary`, `status.warning`, `border.control`, `bg.page`         |

## Feature layer

- `useOwnerSeries({ enabled })`: skip the request when the viewer cannot manage content.
- `features/series/ownerSeries.presentation.ts`: owner Series -> spine parts (scheduled = draft with
  a publication time), updated label, and post id -> `PostSeriesReference` index.
- `features/series/components/ProfileSeriesSection.tsx`: heading, New Series, composer, spines,
  loading / error / empty states.
- Profile page: gate on `can(profile.authorization, 'content:manage:own')`, pass the count to
  `ProfileHeaderCard`, the index to `ProfilePostsSection` -> `ProfileBlogGrid` ->
  `toOwnerPostSummary`.

## Docs

`design-system/pages/profile.md`, `design-system/pages/series.md`, `design-system/component-inventory.md`
if it lists Series patterns.

## Validation

Logic unit tests, static-markup render tests, gallery rows, full suite, lint, format, typecheck,
DS coverage, token export, build.

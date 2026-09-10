# Series

## Intent

Series helps readers discover connected blogs and read them in an author-defined order without turning Horizon into a course or dashboard product.

## Covered Routes And Surfaces

- Series shelf on `/`
- Series shelf on the default, unfiltered `/blog` view
- `/series`
- `/series/:slug`
- Series context inside `/blog/:id`
- protected `/series/manage`
- Series assignment inside `/blog-editor/publish`

## Primary Actions

- open a Series
- view all Series
- open an ordered Series blog
- move to the previous or next public Series blog
- manage an owned Series
- assign zero or one Series during publication review

## Layout

- Preserve the existing Home hero; the Series shelf follows it and precedes Recent Blogs.
- Keep the Blog shelf compact and show it only on the default unfiltered first page.
- Use a concise editorial intro, one featured Series, and a responsive grid on `/series`.
- Use a loose editorial header and one ordered list on `/series/:slug`.
- Keep Series context compact inside the existing reader helper slot.

## Hierarchy

- Series label
- title
- description
- author and public part count
- total reading time or last-updated metadata where available
- ordered public blogs
- optional topics derived from public blogs

## Core Components

- `SeriesShelf`
- `SeriesCard`
- `SeriesIndexPage`
- `SeriesDetailHeader`
- `SeriesPartList`
- `SeriesContextCard`
- `SeriesManager`

Series discovery and reader components stay feature-owned under `src/features/series/`.

## Content Rules

- Use `Series` as the public product term.
- Use `Part X of Y` for position.
- Do not use `learning path`, `collection`, `course`, `lesson`, enrollment, or completion language.
- Do not label standalone blogs; only add light Series context to member blogs.
- Do not show local opened/completion progress in the public Series UI.

## Motion

- Use only restrained entry and hover transitions.
- Do not animate an ordered timeline continuously.
- Respect reduced-motion preferences.

## Accessibility Notes

- Series cards and ordered parts must be semantic links with visible focus.
- Full-row links must retain a readable title and metadata hierarchy.
- Series membership cannot rely on purple or any color alone.
- Loading, empty, error, and not-found states must preserve route context and recovery actions.

## Failure Isolation

- Home and Blog shelves disappear quietly when their independent Series request fails.
- Blog-reader Series context failure never blocks the article.
- `/series` and `/series/:slug` use explicit loading, retry, empty, and not-found states.

## Reference

The approved screen inventory and captured mockups live in `specs/015-series-learning-path/ui-ux.md`.

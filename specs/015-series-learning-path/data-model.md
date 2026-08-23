# Frontend State Model: Series Discovery and Reading

## Public Series summary

- `id`, `slug`, `title`, optional `description`
- safe public `author`
- `partCount`
- `updatedAt`
- used by Home, Blog, and `/series` discovery

## Public series

- `id`, `slug`, `title`, optional `description`
- safe public `author`
- `updatedAt`
- ordered `parts` with `postId`, `title`, `position`, publication date, excerpt, reading time, and public tags
- `totalReadingTime` and topic labels are derived from the visible parts

## Public series context

- compact `series` identity
- current `position` and visible `total`
- optional `previous` and `next` public parts

## Public blog summary Series context

- optional compact `series` identity
- visible `position` and `total`
- absent for standalone blogs
- used by Home and Blog cards without per-card context requests

## Owner series

- public identity fields plus timestamps
- ordered owner parts with status and optional published/scheduled dates
- mutations always replace state with the latest confirmed server response

## Public list state

- `items`, `loading`, `error`, `retry`
- Home and Blog request at most two items and omit the shelf when empty or unavailable
- `/series` keeps explicit loading, empty, error, current page, and total-page state
- the first item in backend order is the featured Series

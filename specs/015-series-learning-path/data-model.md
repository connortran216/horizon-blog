# Frontend State Model: Series Learning Paths

## Public series

- `id`, `slug`, `title`, optional `description`
- safe public `author`
- ordered `parts` with `postId`, `title`, `position`, and publication date

## Public series context

- compact `series` identity
- current `position` and visible `total`
- optional `previous` and `next` public parts

## Owner series

- public identity fields plus timestamps
- ordered owner parts with status and optional published/scheduled dates
- mutations always replace state with the latest confirmed server response

## Local progress

Versioned storage key: `horizon_series_progress_v1`.

```text
Record<seriesId, { visitedPostIds: number[], updatedAt: string }>
```

Rules:

- malformed data returns empty progress
- duplicate visits remain one ID
- removed blogs do not count toward displayed progress
- storage failures do not block reading
- progress means opened blogs, not completion

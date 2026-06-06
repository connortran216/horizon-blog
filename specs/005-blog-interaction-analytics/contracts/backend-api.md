# Backend Contract Consumption: Blog Interaction Analytics Frontend

**Backend authority**: [Backend API contracts](../../../../horizon-blog-be/specs/001-blog-interaction-analytics/contracts/api-contracts.md)

## Reader Contracts

- `POST /analytics/events/batch`
- `POST /posts/{id}/interactions/state`
- `PUT /posts/{id}/interactions/heart`
- `DELETE /posts/{id}/interactions/heart`

Reader integration rules:

- Send visitor ID in bodies, never URLs.
- Let existing auth headers flow when available.
- Respect backend capabilities.
- Never block navigation while delivering events.
- Treat rejected event entries as terminal for those event IDs.
- Reuse the same `event_id` when retrying an event.
- Send cumulative `active_ms` with a strictly increasing per-session `client_seq` for `active_time`.
- Heart/unheart UI calls the reaction endpoints; temporal reaction analytics are returned later through author analytics APIs.

## Author Contracts

- `GET /users/me/analytics/overview`
- `GET /users/me/analytics/posts`
- `GET /users/me/analytics/posts/{id}`

Author integration rules:

- Send inclusive UTC `from` and `to`.
- Preserve backend ratios and durations as numeric values.
- Render unique-reader values as approximate according to backend contract metadata/copy.
- Display `data_fresh_through`.
- Preserve cautious insight text and evidence.
- Do not add analytics fields to existing blog repository types.

## Fixture Rule

Frontend Story 01 copies approved examples into typed feature fixtures. Frontend UI stories may use those fixtures before live endpoints are available. Story 03 is the only story that replaces fixtures with live repository calls.

# Backend API Contract: Performance Optimization Frontend

**Authority**: `horizon-blog-be/specs/002-performance-optimization/contracts/api-contracts.md`

## Post Summary Listing

`GET /posts/summaries?page=1&limit=9`

```ts
interface ApiPostSummary {
  id: number
  user_id: number
  title: string
  excerpt: string
  reading_time: number
  cover_image?: string | null
  owner: ApiPostOwner
  tags: ApiTag[]
  status: 'published'
  created_at: string
  updated_at: string
  published_at?: string | null
}

interface ApiPostSummaryPage {
  data: ApiPostSummary[]
  page: number
  limit: number
  total: number
}
```

Frontend rules:

- Do not infer excerpt, reading time, or cover from markdown for summary responses.
- Do not require or synthesize `content_markdown`.
- Preserve existing optional image/avatar/tag fallbacks.
- Use this endpoint for home and unfiltered public archive only.

## Unchanged Contracts

- `GET /posts`
- `GET /posts/{id}`
- search/profile/authoring APIs
- analytics ingestion and owner analytics APIs
- reaction state, heart, and unheart APIs

## Performance and Compatibility

- Nine summaries must serialize to at most 50 KB.
- Existing public card content must remain visually and semantically equivalent.
- Full article and editor consumers continue to receive full content from existing endpoints.

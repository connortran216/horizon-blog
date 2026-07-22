# Public Route Contract: Public Post Codes

## Reader routes

| Request | Result | Canonical behavior |
| --- | --- | --- |
| `GET /blog/<valid-code>` | Article shell or crawler-rendered published article | Canonical is the same coded path |
| `HEAD /blog/<valid-code>` | Same status and headers as `GET`, without a body | Canonical is the same coded path |
| `GET /blog/<decimal-id>` | Permanent redirect | `Location: /blog/<code-for-id>` |
| `HEAD /blog/<decimal-id>` | Permanent redirect without a body | `Location: /blog/<code-for-id>` |
| `GET /blog/<malformed-code>` | Not found | No article canonical |

Query parameters on coded article URLs retain the existing duplicate-indexing policy. Legacy numeric redirects target the clean coded path.

## URL producers

The following reader-facing outputs must use the coded path:

- Home, archive, author archive, related-post, search, and post-publish navigation.
- Crawler fallback article links.
- Canonical and Open Graph article URLs.
- Article and blog structured data.
- Sitemap article locations.
- RSS item links and GUIDs.
- Browser share URLs through the current location.

Stable SEO image paths remain `/seo/post-image/<decimal-id>`.

## Backend contract

No backend endpoint changes:

- Public article retrieval remains `GET /posts/<decimal-id>`.
- Related-post retrieval remains numeric.
- Media and analytics identifiers remain numeric.
- Existing response bodies remain unchanged.

# HTTP Response Contract

## Supported Methods

- `GET`: returns headers and body.
- `HEAD`: returns the same status and headers as `GET`, with no body.
- Other methods: `405 Method Not Allowed` with `Allow: GET, HEAD`.

## HTML Routes

### Indexable Public Page

- Status: `200`.
- Content-Type: `text/html; charset=utf-8`.
- Head: one title, description, canonical, robots directive, Open Graph block, Twitter block, RSS alternate, and page-appropriate JSON-LD.
- Body: meaningful semantic fallback inside `#root`.
- Cache: public bounded cache based on page volatility.

### Duplicate or Private Page

- Status: `200` when the interactive route exists.
- Head: explicit `noindex,follow` for public duplicate/filter variants or `noindex,nofollow` for private/utility routes.
- Canonical: clean public canonical for duplicate/filter variants; omitted for private routes.
- Body: application shell or semantic duplicate representation as applicable.

### Missing Page

- Status: `404`.
- Head: `noindex,nofollow`.
- Body: human-readable not-found heading and links to `/` and `/blog`.
- Cache: short public cache or `no-store`.

### Temporarily Unavailable Page

- Status: `503`.
- Header: `Retry-After: 60`.
- Head: `noindex,nofollow`.
- Body: human-readable temporary failure.
- Cache: `no-store`.

## Discovery Routes

### `GET /robots.txt`

- Status: `200`.
- Content-Type: `text/plain; charset=utf-8`.
- Contains `User-agent: *`, `Allow: /`, and one absolute `Sitemap:` directive.
- Contains no HTML.

### `GET /sitemap.xml`

- Status: `200` when published records are available.
- Content-Type: `application/xml; charset=utf-8`.
- Contains canonical static pages, canonical author pages, and each published article exactly once.
- Uses article modification timestamps where valid.
- Contains no private, filtered, draft, analytics, auth, editor, profile, image-proxy, or discovery URLs.
- Returns `503` on uncached upstream failure.

### `GET /feed.xml`

- Status: `200` when published records are available.
- Content-Type: `application/rss+xml; charset=utf-8`.
- Contains recent published articles in newest-first order.
- Entry links and GUIDs are stable canonical URLs.
- Returns `503` on uncached upstream failure.

## Stable Image Route

### `GET /seo/post-image/:id`

- Status: `200` and streamed image when a valid protected source resolves.
- Content-Type: validated `image/*`.
- Cache: public bounded cache.
- Redirect: `302` to `/branding/horizon-app-icon-512.png` when no safe article image exists.
- Status: `404` for invalid/missing post identifier.
- Status: `503` for uncached transient backend/media failure.
- Never redirects to or exposes a signed storage URL in HTML metadata.

## Static Assets

- Existing file: `200` with MIME type.
- Fingerprinted `/assets/*`: one-year immutable cache.
- Other public assets: bounded public cache.
- Missing file-like path: `404`, never the application shell.
- Safe-path containment is mandatory.

## Security Headers

All HTML responses include:

- `X-Content-Type-Options: nosniff`.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Content-Security-Policy` compatible with the built application and JSON-LD.

Discovery and image responses include `X-Content-Type-Options: nosniff`.

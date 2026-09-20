# Backend and infrastructure hand-off: media delivery, excerpts, origin path

Status: proposed, not implemented. Written from measurements taken on 2026-09-16
against production (`blog.connortran.io.vn`, `blog-api.connortran.io.vn`,
`minio.connortran.io.vn`) and against the LAN backend at `192.168.0.30:8080`.
Owner: backend / infrastructure. Frontend counterparts are named per item.

## What was measured

The same production build, two environments:

| | LAN backend | Production, cold browser |
|---|---|---|
| HTML shell time-to-first-byte | 5 ms | 1.0 s (samples of 3.8 s and 8.5 s) |
| `horizon-*.js`, 590 KB raw / 200 KB brotli | 22 ms | 6.9 s, blocking `DOMContentLoaded` |
| one API call (`/auth/refresh`, `/posts/summaries`) | 8–89 ms | 0.9–1.9 s |
| one cover image from MinIO | 1.1 s | 1.6–2.2 s |
| Home fully painted | ~1.8 s | ~13.8 s |

The backend process is fast: `/posts/summaries` answers in 16 ms on the LAN.
The cost is the path - Cloudflare edge, tunnel, home uplink - and it is paid
per request, so anything that removes a request or shrinks a response on that
path is worth more than any CPU work in the browser. The frontend has already
taken its share (precompressed assets, fewer chunks, no guest refresh call,
variants for every cover). The items below need the backend or the
infrastructure.

## 1. Image URLs must be cacheable

`POST /media/resolve` signs every URL per call: `X-Amz-Date` and
`X-Amz-Signature` differ on every page load for the same picture. Cloudflare
and the browser both treat each as a new resource, so every cover is fetched
from MinIO through the tunnel on every visit - the 1.6–2.2 s per image above -
and nothing is ever served from a cache. `X-Amz-Expires=86400` does not help;
the URL is different before it expires.

Any of these works; the first is the simplest:

- Publish cover and article images from a public read-only bucket (the
  avatar already lives in `horizon-blog-public-bucket`) and return plain URLs.
  Private posts keep signed URLs.
- Sign with a fixed window - truncate the signing time to the hour or day - so
  the URL is stable within the window and the edge can cache it.
- Front MinIO with a cache rule on `minio.connortran.io.vn` keyed without the
  query string, and give objects `cache-control: public, max-age=31536000,
  immutable` (object names are already content-hashed).

Frontend counterpart: none needed. `ResponsiveImage` and `postCoverFrom` take
whatever URL the record carries.

## 2. Avatar variants

`owner.avatar_url` on `/posts/{id}` and the summaries is one original JPEG:
measured 270,447 bytes for a picture rendered at 32×32 px. Posts already get
`variants` (320/640/960/1280 WebP) from `/media/resolve`; avatars do not, and
they are not media records, so the frontend has nothing smaller to choose.

Either return the avatar as a media record (`media://<id>`) so `/media/resolve`
supplies variants, or generate a 64 px and 128 px WebP on upload and return
them alongside `avatar_url` (`avatar_variants: [{url,width,height}]`).

Frontend counterpart: `AuthorIdentity` and every avatar renderer already go
through `ResponsiveImage`; give them `sources` and they will use them.

## 3. Excerpt data defects

Found while auditing the archive against the reader:

- 12 published posts have an `excerpt` prefixed with the literal `1.00 `
  (looks like a numeric field concatenated in front of the text).
- Post 84's excerpt is the title concatenated with the word `cover`.
- The test article's cover has `alt="1.00"` - most likely the same field
  leaking into the alt text on upload.

Frontend counterpart: `postExcerptFrom` renders whatever it gets; it does not
try to repair data, deliberately.

## 4. The SEO origin should reach the backend over the LAN

`scripts/seo/server.mjs` renders HTML for crawlers and the initial shell, and
fetches post data from `BE_HOST`. The frontend container is built with
`.env.production`, so `BE_HOST` is `https://blog-api.connortran.io.vn` - the
origin, sitting on the same LAN as the backend, goes out through Cloudflare
and the tunnel and back for every uncached render. That is where the 3.8 s
and 8.5 s shell samples come from.

Set `BE_HOST=http://<backend LAN address>:8080` in the frontend container's
runtime environment (the build-time value in `.env.production` is what the
browser uses and must stay public). `scripts/seo/config.mjs` already reads
`process.env.BE_HOST` at runtime and lists both hosts for the CSP.

## 5. Edge caching

Static assets carry `cache-control: public, max-age=31536000, immutable` and
Cloudflare does cache them (`cf-cache-status: HIT` with `age` seen in DFW and
CDG), but each edge location fills its own cache from the origin, and with
this site's traffic most visitors hit a cold edge (`MISS` in WAW three times
out of four). HTML is `DYNAMIC` - never cached.

- Enable Tiered Cache so edge locations fill from one upper tier instead of
  from the home uplink.
- Add a cache rule for public HTML routes (`/`, `/blog`, `/blog/*`,
  `/series/*`, `/authors/*`) honouring the `max-age=60..300,
  stale-while-revalidate` the origin already sends; authenticated routes
  (`/profile/*`, `/blog-editor*`, `/admin/*`, `/analytics*`) stay bypassed.

## Why the frontend cannot do these

Every item is either a header or a URL shape decided by the backend, or a
setting in the Cloudflare account. The frontend measures them; it cannot change
them.

# SEO Rendering Gateway Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every useful Horizon public page discoverable, accurately described, crawler-readable without JavaScript, and served with truthful HTTP semantics.

**Architecture:** Preserve the React/Vite client and replace the monolithic production server with focused Node ES modules for route policy, public backend data, safe content rendering, metadata, discovery feeds, and HTTP composition. The server injects semantic fallback HTML into the existing root for every client, while React replaces it for interactive browsing.

**Tech Stack:** Node.js ES modules, React 18, Vite 6, Vitest 4, existing `marked` dependency, Node HTTP/URL/path/stream APIs.

---

### Task 1: Canonical URL and Route Policy

**Files:**
- Create: `scripts/seo/config.mjs`
- Create: `scripts/seo/urls.mjs`
- Test: `scripts/seo/urls.test.mjs`

- [ ] **Step 1: Write failing origin and route tests**

Test `firstForwardedValue`, `getRequestOrigin`, `classifyRoute`, canonical pagination, tracking/filter query handling, private routes, file-like missing routes, malformed decoding, and author/article identifiers. Include the production regression header `x-forwarded-proto: "http, https"` and require exactly `https://blog.connortran.io.vn`.

- [ ] **Step 2: Run the test and verify RED**

Run: `rtk yarn test scripts/seo/urls.test.mjs`

Expected: FAIL because `config.mjs` and `urls.mjs` do not exist.

- [ ] **Step 3: Implement configuration and route policy**

Expose:

```js
createSeoConfig(env)
firstForwardedValue(value)
slugify(value)
getRequestOrigin(request, config)
classifyRoute(url)
toCanonicalUrl(origin, canonicalPath)
getSafeAssetPath(distDir, pathname)
```

Use `PUBLIC_SITE_URL` as canonical authority when set; otherwise normalize forwarded values and prefer the configured production URL for ambiguous schemes. Keep only `page` for valid pagination. Mark search/tag/tracking/unsupported query variants `noindex,follow`.

- [ ] **Step 4: Run the test and verify GREEN**

Run: `rtk yarn test scripts/seo/urls.test.mjs`

Expected: PASS.

### Task 2: Metadata and Structured Data

**Files:**
- Create: `scripts/seo/metadata.mjs`
- Test: `scripts/seo/metadata.test.mjs`

- [ ] **Step 1: Write failing metadata tests**

Require escaped title/description attributes, one canonical, robots directives, Open Graph/Twitter metadata, RSS alternate, stable `/seo/post-image/:id`, article timestamps/tags, and parseable escaped JSON-LD for WebSite, Blog, BlogPosting, Person, ProfilePage, and BreadcrumbList.

- [ ] **Step 2: Run the test and verify RED**

Run: `rtk yarn test scripts/seo/metadata.test.mjs`

Expected: FAIL because metadata functions do not exist.

- [ ] **Step 3: Implement metadata generation**

Expose:

```js
escapeHtml(value)
serializeJsonLd(value)
createPageMetadata(input)
renderHead(metadata)
```

Never serialize signed media URLs. Escape `<`, `>`, `&`, U+2028, and U+2029 in JSON-LD. Keep JSON-LD aligned with visible content.

- [ ] **Step 4: Run the test and verify GREEN**

Run: `rtk yarn test scripts/seo/metadata.test.mjs`

Expected: PASS.

### Task 3: Public Backend Adapter

**Files:**
- Create: `scripts/seo/backend.mjs`
- Test: `scripts/seo/backend.test.mjs`

- [ ] **Step 1: Write failing adapter tests**

Use injected `fetchImpl` to test host fallback, timeout mapping, backend 404, published-only normalization, pagination across all records, stale successful cache, author slug resolution, `media://` resolution, unsafe media hosts, and signed source URL containment.

- [ ] **Step 2: Run the test and verify RED**

Run: `rtk yarn test scripts/seo/backend.test.mjs`

Expected: FAIL because the adapter does not exist.

- [ ] **Step 3: Implement the adapter**

Expose `BackendError` and `createBackendClient(config, dependencies)`. Methods:

```js
getPublishedPost(id)
listPublishedPosts({ page, limit })
listAllPublishedPosts()
getAuthorBySlug(slug, { page, limit })
resolvePostImageSource(id)
```

Normalize owner/user fields, tags, dates, and status. Cache only successful values, retain stale values for transient fallback, and bound fetch duration.

- [ ] **Step 4: Run the test and verify GREEN**

Run: `rtk yarn test scripts/seo/backend.test.mjs`

Expected: PASS.

### Task 4: Safe Semantic Content

**Files:**
- Create: `scripts/seo/content.mjs`
- Test: `scripts/seo/content.test.mjs`

- [ ] **Step 1: Write failing content tests**

Cover headings, paragraphs, emphasis, blockquotes, ordered/unordered lists, tables, fenced code, safe links/images, generated heading IDs, raw HTML escaping, `javascript:`/`data:` rejection, excerpts, reading time, first-image extraction, and source readable-text retention.

- [ ] **Step 2: Run the test and verify RED**

Run: `rtk yarn test scripts/seo/content.test.mjs`

Expected: FAIL because content functions do not exist.

- [ ] **Step 3: Implement strict Markdown rendering**

Use a local `Marked` instance and custom `Renderer`. Expose:

```js
stripMarkdown(markdown)
buildExcerpt(markdown, maxLength)
getReadingTime(markdown)
extractFirstImageUrl(markdown)
renderMarkdown(markdown)
```

Raw HTML must be escaped as text. Validate `http:`, `https:`, relative paths, and fragments; reject executable or opaque schemes.

- [ ] **Step 4: Run the test and verify GREEN**

Run: `rtk yarn test scripts/seo/content.test.mjs`

Expected: PASS.

### Task 5: Discovery Documents

**Files:**
- Create: `scripts/seo/feeds.mjs`
- Test: `scripts/seo/feeds.test.mjs`

- [ ] **Step 1: Write failing discovery tests**

Require robots text with one sitemap line and no HTML; sitemap XML with unique canonical public/static/author/article URLs and valid `lastmod`; RSS with stable GUIDs, escaped summaries, authors, dates, categories, and newest-first order.

- [ ] **Step 2: Run the test and verify RED**

Run: `rtk yarn test scripts/seo/feeds.test.mjs`

Expected: FAIL because feed functions do not exist.

- [ ] **Step 3: Implement discovery generators**

Expose:

```js
renderRobots(origin)
renderSitemap({ origin, posts, authors })
renderRss({ origin, posts, config })
```

Never include signed source images, private routes, query variants, or draft records.

- [ ] **Step 4: Run the test and verify GREEN**

Run: `rtk yarn test scripts/seo/feeds.test.mjs`

Expected: PASS.

### Task 6: Semantic HTML Documents

**Files:**
- Create: `scripts/seo/render.mjs`
- Test: `scripts/seo/render.test.mjs`

- [ ] **Step 1: Write failing rendering tests**

Require semantic home/archive lists, full article body/title/author/date/tags/breadcrumbs, author bio/post links, static public pages, noindex private shell, 404/503 pages, exact root injection, one metadata block, and safe backend text.

- [ ] **Step 2: Run the test and verify RED**

Run: `rtk yarn test scripts/seo/render.test.mjs`

Expected: FAIL because render functions do not exist.

- [ ] **Step 3: Implement fragments and injection**

Expose:

```js
renderHome(data)
renderArchive(data)
renderArticle(post)
renderAuthor(author)
renderStaticPage(route)
renderErrorPage(status)
injectDocument(indexHtml, { headHtml, bodyHtml })
```

Fallback content must be visible and ordinary for all clients. Escape every backend text field.

- [ ] **Step 4: Run the test and verify GREEN**

Run: `rtk yarn test scripts/seo/render.test.mjs`

Expected: PASS.

### Task 7: HTTP Gateway and Stable Image Proxy

**Files:**
- Create: `scripts/seo/server.mjs`
- Replace: `scripts/serve-with-meta.mjs`
- Test: `scripts/seo/server.test.mjs`

- [ ] **Step 1: Write failing integration tests**

Start an ephemeral server with a temporary `dist/index.html` and injected backend. Test public HTML, filtered/private noindex, real route/asset 404, discovery MIME/body, post image streaming/fallback, 503 plus Retry-After, 405 plus Allow, HEAD parity, security headers, and immutable hashed assets.

- [ ] **Step 2: Run the test and verify RED**

Run: `rtk yarn test scripts/seo/server.test.mjs`

Expected: FAIL because the server factory does not exist.

- [ ] **Step 3: Implement the composed server**

Expose:

```js
createSeoServer({ config, distDir, backend, fetchImpl, logger })
startSeoServer(options)
```

Make `scripts/serve-with-meta.mjs` load config and call `startSeoServer`. Keep `yarn preview:meta` and Docker unchanged.

- [ ] **Step 4: Run the test and verify GREEN**

Run: `rtk yarn test scripts/seo/server.test.mjs`

Expected: PASS.

### Task 8: Full Verification

**Files:**
- Update: `specs/007-seo-rendering-gateway/tasks.md`

- [ ] **Step 1: Run targeted and full automated gates**

```bash
rtk yarn test scripts/seo
rtk yarn test
rtk yarn lint
rtk yarn tsc --noEmit
rtk yarn format
rtk yarn build
```

- [ ] **Step 2: Run the production response matrix**

Start `PORT=3100 PUBLIC_SITE_URL=http://127.0.0.1:3100 rtk yarn preview:meta`, then execute every `curl` check in `specs/007-seo-rendering-gateway/quickstart.md`.

- [ ] **Step 3: Run browser verification**

Use the in-app browser against `http://127.0.0.1:3100` and verify React takeover, public navigation, article rendering, and author navigation.

- [ ] **Step 4: Record evidence**

Mark completed tasks and append exact test/build/response/browser results to `specs/007-seo-rendering-gateway/tasks.md`.

# Research: SEO Rendering Gateway

## Decision 1: Preserve React/Vite and extend the production gateway

**Decision**: Keep the current client application and production command, but move SEO response generation into focused server modules.

**Rationale**: The existing server already controls production HTML and backend access. Extending it supplies crawler-readable content with materially less migration risk than changing frameworks.

**Alternatives considered**:

- Full framework SSR migration: strongest general rendering model, but rewrites routing, data loading, deployment, and application entry points.
- Metadata-only updates: lower effort, but retains the empty application root and does not satisfy crawler-readable content requirements.

## Decision 2: Render the same semantic fallback for all clients

**Decision**: Inject semantic public content into the React root for every request instead of inspecting crawler user agents.

**Rationale**: User-agent-specific dynamic rendering is brittle and can create cloaking risk. A universal fallback is inspectable, accessible without JavaScript, and replaced by React for interactive clients.

**Alternatives considered**:

- Bot-only HTML: rejected because it creates divergent representations and ongoing crawler detection maintenance.
- Browser-side metadata only: rejected because it delays discovery and leaves non-JavaScript clients without content.

## Decision 3: Use the existing Markdown dependency with a strict renderer

**Decision**: Parse article Markdown with the installed `marked` package and override raw HTML, links, and images with strict escaping and URL allowlists.

**Rationale**: This preserves headings, lists, tables, code, and links without adding a production dependency. Rendering remains server-owned and testable.

**Alternatives considered**:

- Ad hoc Markdown regular expressions: rejected because nested syntax, code blocks, and tables are not safely parseable that way.
- DOM sanitization dependency: not required when the renderer never emits raw HTML and validates all URLs.
- Reusing browser DOMPurify: unavailable in the Node production process without adding a DOM implementation.

## Decision 4: Generate discovery documents at request time with bounded caching

**Decision**: Build sitemap and RSS documents from all published backend records, cache successful results for five minutes, and return 503 on an uncached upstream failure.

**Rationale**: Published content changes independently of frontend builds. Runtime generation keeps discovery current and avoids redeployment for each article.

**Alternatives considered**:

- Build-time generation: stale until the next frontend deployment.
- Manual static files: error-prone and not scalable.
- Backend-owned sitemap: viable later, but the current public contract and deployment boundary already support frontend generation.

## Decision 5: Proxy social images through stable same-origin URLs

**Decision**: Metadata points to `/seo/post-image/:id`; that endpoint resolves and streams the current protected image or redirects to the permanent brand image.

**Rationale**: Signed MinIO URLs expire and should not be persisted in search metadata, feeds, or link previews. Same-origin URLs remain stable while source credentials rotate.

**Alternatives considered**:

- Use signed URLs directly: rejected because previews can fail after expiration.
- Always use the brand image: stable but discards useful article imagery.
- Copy images into the frontend: duplicates storage and requires a publication pipeline change.

## Decision 6: Resolve author slugs from published records

**Decision**: Build a short-lived author index from published post ownership and fetch the matching public profile.

**Rationale**: Browser navigation currently carries the author identifier in route state, but crawlers enter slug URLs directly. Published post records provide the authoritative public author identifier without inventing a new endpoint.

**Alternatives considered**:

- Numeric-only author canonicals: would conflict with existing human-readable links.
- Client session storage: unavailable to first-time crawlers.
- Name-based backend lookup: no verified endpoint exists.

## Decision 7: Treat response status as an SEO contract

**Decision**: Return 404 for missing/invalid resources, 503 plus `Retry-After` for transient required upstream failures, 405 for unsupported methods, and equivalent headers for HEAD.

**Rationale**: Soft 404s and success responses for failures send incorrect crawler signals. Explicit status mapping distinguishes permanent absence from temporary unavailability.

**Alternatives considered**:

- Always serve the SPA with 200: current behavior and the source of soft 404s.
- Convert all backend failures to 404: risks de-indexing valid content during outages.

## Primary References

- Google Search Central: JavaScript SEO basics.
- Google Search Central: Article structured data.
- Google Search Central: canonical URL consolidation.
- Google Search Central: robots meta and `noindex`.
- Google Search Central: sitemap creation and submission.
- Google Search Central: Core Web Vitals.

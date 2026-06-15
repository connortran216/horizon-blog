# Feature Specification: SEO Rendering Gateway

**Feature Branch**: `perf/production-optimization`
**Created**: 2026-06-15
**Status**: Approved for planning
**Input**: Optimize Horizon for search discovery and indexing as much as possible while preserving the existing interactive site.
**Approved Design**: [SEO rendering gateway design](../../docs/superpowers/specs/2026-06-15-seo-rendering-gateway-design.md)

## User Scenarios & Testing

### User Story 1 - Discover every published article (Priority: P1)

As a reader using a search engine or feed reader, I want every published article to be discoverable through canonical site resources so that I can find Horizon content without already knowing its URL.

**Why this priority**: Published writing has limited search value when crawlers cannot reliably discover canonical article URLs.

**Independent Test**: Publish representative articles, fetch the site's crawler resources, and verify that every published canonical article URL appears while drafts and private routes do not.

**Acceptance Scenarios**:

1. **Given** published articles exist, **When** a crawler requests the sitemap, **Then** it receives valid XML containing every canonical published article and public index page.
2. **Given** a feed reader requests the site feed, **When** published articles exist, **Then** it receives valid entries with canonical links, titles, authors, dates, and summaries.
3. **Given** a crawler requests the crawler policy file, **When** the response is read, **Then** it contains valid crawler directives and the canonical sitemap location only.
4. **Given** an article is a draft or owner-only record, **When** discovery resources are generated, **Then** no URL or content from that record is exposed.

### User Story 2 - Understand an article without JavaScript (Priority: P1)

As a reader or crawler with JavaScript unavailable or delayed, I want the article response to contain its meaningful content so that the page remains understandable and indexable.

**Why this priority**: The current response contains an empty application root, which delays or prevents content processing by some crawlers and non-JavaScript clients.

**Independent Test**: Fetch a published article without running JavaScript and verify that its title, author, dates, tags, and full readable body are present as semantic HTML.

**Acceptance Scenarios**:

1. **Given** a published article exists, **When** its URL is fetched without JavaScript, **Then** the response contains the article title, visible body, author, dates, and canonical link.
2. **Given** article Markdown contains headings, lists, links, code, tables, images, or raw HTML, **When** fallback HTML is produced, **Then** meaningful content remains readable and unsafe markup cannot execute.
3. **Given** an interactive browser loads the same article, **When** the application starts, **Then** the existing reader replaces the fallback without duplicate visible content or broken interaction.
4. **Given** the article does not exist or is not public, **When** its URL is requested, **Then** the response is a genuine not-found result and is excluded from indexing.

### User Story 3 - Receive accurate search-result information (Priority: P1)

As a reader reviewing a search result or shared link, I want the title, summary, author, dates, and image to describe the exact page so that I can decide whether it is relevant.

**Why this priority**: Generic or malformed metadata weakens search snippets, link previews, canonicalization, and rich-result eligibility.

**Independent Test**: Fetch each public route family and verify one accurate canonical, unique metadata, stable preview image, indexing directive, and page-appropriate structured data.

**Acceptance Scenarios**:

1. **Given** a public article, archive, author, or static page, **When** its HTML is fetched, **Then** its title, description, canonical URL, social metadata, and indexing directive match that page.
2. **Given** a published article, **When** structured data is inspected, **Then** it represents the visible article, author, dates, image, publisher, and breadcrumb path.
3. **Given** a post uses protected media storage, **When** metadata is generated, **Then** it references a stable site URL rather than an expiring signed URL.
4. **Given** the site is behind one or more proxies, **When** an external URL is constructed, **Then** it contains one valid public scheme and host.

### User Story 4 - Keep private and duplicate pages out of search (Priority: P1)

As the site owner, I want private, authenticated, filtered, malformed, and duplicate URLs excluded or consolidated so that search engines focus on useful public pages.

**Why this priority**: Indexing utility pages and parameter variants wastes crawl attention and can expose inappropriate snippets.

**Independent Test**: Request every route family and representative query variants; verify private pages are non-indexable, duplicates point to the preferred canonical, and only useful public URLs appear in discovery resources.

**Acceptance Scenarios**:

1. **Given** an authentication, editor, profile, OAuth, reset, or analytics route, **When** it is fetched, **Then** it explicitly prevents indexing.
2. **Given** an archive URL contains search, tag, tracking, or unsupported parameters, **When** it is fetched, **Then** it is excluded from indexing and identifies the clean archive as canonical.
3. **Given** a valid paginated archive or author page, **When** it is fetched, **Then** it has a self-canonical and correct previous/next relationships.
4. **Given** an unknown route or missing static asset, **When** it is requested, **Then** it returns a genuine not-found status instead of the application home page.

### User Story 5 - Preserve reliable access during failures (Priority: P2)

As a crawler or reader, I want temporary backend failures distinguished from missing content so that valid pages are not incorrectly removed from indexes.

**Why this priority**: Returning success or not-found for transient failures creates misleading crawler signals.

**Independent Test**: Simulate backend success, not-found, timeout, and server errors; verify each produces the appropriate response category, cache behavior, and indexing directive.

**Acceptance Scenarios**:

1. **Given** required public content cannot be loaded because of a transient upstream failure, **When** the page is requested, **Then** it returns a retryable temporary-failure response and prevents indexing of the error page.
2. **Given** a recent successful representation is cached, **When** a transient upstream failure occurs, **Then** the site may serve the valid cached representation instead of an error.
3. **Given** an unsupported request method, **When** the server receives it, **Then** it rejects the method and advertises the supported methods.
4. **Given** a metadata-only request, **When** a client uses the standard header-only method, **Then** headers and status match the corresponding full response without a body.

## Requirements

### Functional Requirements

- **FR-001**: The site MUST publish a valid crawler policy response that allows public crawling and identifies the canonical sitemap.
- **FR-002**: The site MUST publish a valid XML sitemap containing every canonical indexable public route and published article.
- **FR-003**: The site MUST publish a valid feed containing recent published articles and canonical links.
- **FR-004**: Draft, private, authenticated, and owner-only content MUST NOT appear in crawler discovery resources or public fallback HTML.
- **FR-005**: Every indexable public response MUST contain meaningful visible HTML without requiring JavaScript.
- **FR-006**: Published article fallback HTML MUST include title, body, author, publication date, modification date when available, tags, and navigation.
- **FR-007**: User-authored content MUST be escaped or safely rendered so that scripts and unsafe links cannot execute.
- **FR-008**: Every indexable public URL MUST provide exactly one absolute canonical URL.
- **FR-009**: Public route families MUST provide unique, accurate titles and descriptions.
- **FR-010**: Public route responses MUST provide page-appropriate social-sharing metadata.
- **FR-011**: Published articles MUST provide structured data that describes only content visible on the page.
- **FR-012**: Author pages MUST provide structured author identity and links to their published articles.
- **FR-013**: Preview images for protected media MUST use stable public site URLs rather than expiring signed URLs.
- **FR-014**: Authentication, registration, password, OAuth, editor, profile, and analytics routes MUST explicitly prevent indexing.
- **FR-015**: Search, tag-filtered, tracking, unsupported-query, and other duplicate archive variants MUST be excluded from indexing and identify the preferred clean URL.
- **FR-016**: Valid pagination MUST provide self-canonical, previous, and next relationships.
- **FR-017**: Unknown routes, missing public records, invalid pagination, and missing static assets MUST return a not-found status.
- **FR-018**: Temporary upstream failures on required public content MUST return a temporary-failure status rather than success or not-found.
- **FR-019**: Header-only requests MUST return the same status and headers as full requests without returning a body.
- **FR-020**: The interactive application MUST preserve existing public navigation, reading, author, sharing, reaction, and analytics behavior.
- **FR-021**: Public URL construction MUST correctly normalize trusted proxy scheme and host information.
- **FR-022**: Crawler resources, metadata, and fallback representations MUST use bounded caching and MUST NOT cache transient failures as valid content.
- **FR-023**: The feature MUST add no new runtime dependency.

### Key Entities

- **Canonical page**: The preferred public URL, indexing policy, metadata, structured data, and visible fallback representation for one route.
- **Published article representation**: Public article identity, title, Markdown body, author, dates, tags, image, and canonical URL.
- **Author representation**: Public author identity, biography, image, canonical archive URL, and published article links.
- **Discovery document**: Crawler policy, sitemap, or feed generated only from canonical public content.
- **Stable media URL**: Same-origin preview URL that remains constant while protected source URLs rotate.
- **Route policy**: Classification that determines indexing, canonicalization, required data, response status, and cache behavior.

## Success Criteria

- **SC-001**: Automated validation finds zero malformed URLs, duplicate canonical tags, or missing canonical tags across all indexable route families.
- **SC-002**: Every published article known to the public content source appears exactly once in the sitemap, while zero draft or private records appear.
- **SC-003**: A non-JavaScript fetch of every published article contains at least 95% of its readable article text plus its title, author, and publication date.
- **SC-004**: Structured-data validation reports zero critical errors for representative article, author, archive, and home pages.
- **SC-005**: Every private or utility route tested reports an explicit non-indexing directive, and none appears in the sitemap or feed.
- **SC-006**: Every tested unknown route, missing record, invalid page, and missing asset returns a not-found status.
- **SC-007**: Every tested transient upstream failure returns a retryable temporary-failure response or a previously verified fresh representation.
- **SC-008**: Social metadata for protected post media contains zero expiring storage signatures.
- **SC-009**: Sitemap, feed, crawler policy, metadata, and fallback HTML pass their format and safety test suites.
- **SC-010**: Existing interactive public-route tests, lint, type checking, and the production build pass with no new runtime dependency.
- **SC-011**: After deployment, representative mobile pages remain in the "good" or "needs improvement" Core Web Vitals bands, with no regression caused by fallback HTML.

## Edge Cases

- Forwarded scheme or host headers contain comma-separated proxy hops.
- A request uses an untrusted host, malformed URL encoding, or path traversal.
- An article has no body, image, author name, tags, publication date, or modification date.
- Markdown contains raw HTML, malformed links, protocol-relative URLs, nested lists, tables, diagrams, or very large code blocks.
- An image token cannot be resolved, resolves to a disallowed host, returns a non-image type, or exceeds the response-size limit.
- The public article count spans multiple backend pages.
- A publication is removed between sitemap generation and article fetch.
- An author slug is visited directly without browser navigation state.
- Pagination is zero, negative, non-numeric, or above the final page.
- Multiple query parameters represent the same archive result.
- Cloudflare prepends managed crawler directives to the site's crawler policy.
- The backend times out after a previously successful page was cached.

## Assumptions

- Backend post identifiers remain the source of truth for article URLs.
- Published records returned by public backend endpoints are safe to disclose; drafts remain protected by backend contracts.
- English is the site's current primary language.
- Horizon's existing brand image is the fallback social image.
- The current production proxy continues forwarding the original host and scheme.
- Search Console ownership, sitemap submission, and recrawl requests are post-deployment owner operations because they require external account access.
- The approved implementation preserves React and Vite rather than migrating frameworks.

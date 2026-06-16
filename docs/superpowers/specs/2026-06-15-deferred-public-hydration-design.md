# Deferred Public Hydration Design

## Objective

Improve public-route Core Web Vitals by keeping the gateway-rendered semantic HTML visible and
usable before downloading or executing the full React, Chakra UI, authentication, and router entry
bundle.

## Scope

The SEO gateway controls startup mode per response:

- Public content pages (`/`, `/blog`, published articles, author archives, `/about`, `/contact`,
  and `/cv`) use deferred hydration.
- Private application pages load the SPA immediately.
- Real 404 and 503 pages remain static and do not request the SPA.
- Existing canonical, robots, social, structured-data, sitemap, feed, and image behavior is
  unchanged.

## Document Behavior

For deferred pages, document injection replaces the Vite module entry tag with a small inline
loader. The loader imports the same built entry module once, using the first applicable trigger:

1. An existing `horizon_blog_token` loads the app immediately for a returning authenticated user.
2. `pointerdown`, `keydown`, `touchstart`, or `focusin` loads the app on meaningful interaction.
3. A bounded eight-second fallback timer schedules the import during an idle callback when
   available.

The loader leaves ordinary anchors fully functional. A click can therefore perform a normal
server-rendered navigation even if the entry module has not finished downloading.

For immediate pages, the original Vite module entry remains unchanged. Static error documents
remove the entry module entirely.

## Fallback Presentation

The server-rendered content receives a small inline style block. It provides readable typography,
bounded content width, visible focus states, semantic list/card spacing, and light/dark color
support. The style is scoped to `data-seo-fallback` so it does not affect the React application
after takeover.

## Safety

- Only a same-origin absolute-path module source from the built index may be deferred.
- The import source is serialized with `JSON.stringify`; arbitrary HTML is never interpolated into
  executable JavaScript.
- A global loading flag makes all triggers idempotent.
- Event listeners use `once` and are removed when loading begins.
- The existing CSP already permits the inline loader and same-origin module import.

## Verification

- Unit tests prove deferred, immediate, and omitted entry modes.
- Gateway tests prove public/private/error policy selection.
- A production response check proves the entry module is absent from the initial public network
  path while semantic HTML, metadata, and links remain present.
- Browser/runtime verification proves interaction and timeout takeover.
- Lighthouse is rerun against the exact production build and compared with the current mobile
  baseline: Performance 64, FCP 3.6 seconds, LCP 5.0 seconds, and 0.75 MB transferred.


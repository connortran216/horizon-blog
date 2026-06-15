# Quickstart: SEO Rendering Gateway Verification

## Automated Gates

```bash
rtk yarn test scripts/seo
rtk yarn test
rtk yarn lint
rtk yarn tsc --noEmit
rtk yarn format
rtk yarn build
```

## Start the Production Preview

The build gate must complete first.

```bash
PORT=3100 PUBLIC_SITE_URL=http://127.0.0.1:3100 rtk yarn preview:meta
```

## Response Matrix

```bash
curl -i http://127.0.0.1:3100/
curl -i http://127.0.0.1:3100/blog
curl -i http://127.0.0.1:3100/blog/76
curl -i http://127.0.0.1:3100/authors/connor-tran
curl -i http://127.0.0.1:3100/blog?query=api
curl -i http://127.0.0.1:3100/login
curl -i http://127.0.0.1:3100/definitely-missing
curl -i http://127.0.0.1:3100/missing.png
curl -i http://127.0.0.1:3100/robots.txt
curl -i http://127.0.0.1:3100/sitemap.xml
curl -i http://127.0.0.1:3100/feed.xml
curl -I http://127.0.0.1:3100/blog/76
```

Verify:

- Public HTML contains visible semantic text inside `#root`.
- Every indexable page has exactly one canonical.
- Article metadata contains `/seo/post-image/76` and no `X-Amz-` parameters.
- Private and filtered pages contain the expected `noindex`.
- Missing routes/assets return 404.
- Discovery routes have correct MIME types and contain no `<!doctype html>`.
- HEAD has no body and matches GET status/headers.

## Structured Data

Extract each `application/ld+json` block and parse it as JSON. After deployment, test representative public URLs with Google's Rich Results Test:

- Home page.
- Blog archive.
- One published article.
- One author archive.

## Browser Verification

Open the local production target in the in-app browser:

1. Visit `/`, `/blog`, `/blog/76`, and `/authors/connor-tran`.
2. Verify the React application replaces the fallback without duplicated visible content.
3. Navigate through article, author, sharing, reactions, and back links.
4. Confirm no hydration warning is expected because the application uses `createRoot`, not hydration.
5. Inspect page source separately to confirm fallback HTML remains present in the network response.

## Deployment Verification

After deployment:

```bash
curl -sS https://blog.connortran.io.vn/robots.txt
curl -sS https://blog.connortran.io.vn/sitemap.xml
curl -sS https://blog.connortran.io.vn/feed.xml
curl -sS https://blog.connortran.io.vn/blog/76
```

Then submit `https://blog.connortran.io.vn/sitemap.xml` in Google Search Console and request recrawling for the home, archive, representative article, and author URLs.

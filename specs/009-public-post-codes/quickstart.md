# Verification Guide: Public Post Codes

## Codec

1. Encode representative IDs including `1`, `88`, and the largest supported safe integer.
2. Confirm every result uses the fixed opaque format and is stable across repeated calls.
3. Decode every result and confirm it returns the original decimal ID.
4. Confirm malformed, zero, negative, oversized, and non-canonical values are rejected.

## Frontend navigation

1. Inspect public links on home, blog archive, author archive, related posts, and search.
2. Confirm they use `/blog/<code>` and never `/blog/<decimal-id>`.
3. Open a coded route directly and refresh; confirm the correct published post loads through the existing numeric API.
4. Open a legacy numeric route under client-only routing; confirm the address is replaced with the coded path.
5. Confirm profile and analytics links remain unchanged.

## SEO gateway

1. Request a coded article as a browser and crawler; confirm status `200`, correct content, and coded canonical metadata.
2. Request its legacy numeric URL without following redirects; confirm status `301` and the coded `Location`.
3. Request sitemap and RSS documents; confirm article locations use codes.
4. Confirm `/seo/post-image/<decimal-id>` still responds as before.
5. Confirm malformed codes return `404` and unsupported methods remain `405`.

## Validation commands

```bash
rtk yarn test src/core/utils/public-post-code.test.ts scripts/seo
rtk yarn tsc --noEmit
rtk yarn lint
rtk yarn build
rtk git diff --check
```

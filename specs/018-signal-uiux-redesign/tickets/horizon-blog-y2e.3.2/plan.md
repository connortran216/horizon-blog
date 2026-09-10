# horizon-blog-y2e.3.2 implementation plan

Spec: [spec.md](spec.md)
Design approved: prototype 2026-09-06. This implementation plan is agent-reviewed, not separately human-approved.

## Concrete source ownership
- `src/features/series/pages/SeriesIndexPage.tsx`
- `src/features/series/pages/SeriesPage.tsx`
- `src/features/series/components/SeriesCard.tsx`
- `src/features/series/components/SeriesPartList.tsx`
- reusable Series book presentation shared with Home

## Technical approach
Reuse Chakra semantic tokens, existing hooks and service adapters. Scale the Home book-cover identity
into the public Series index, and make ordered connectors respond to hover, focus and press without
continuous timeline animation. Preserve server order and failure isolation.

## Ordered execution
- [x] S1 Inspect current source, Series guide, approved prototype and Beads behavioral contract. (AC1-AC4)
- [x] S2 Extract reusable book presentation and redesign the public index without changing list services. (AC1-AC4)
- [x] S3 Redesign Series detail and ordered connectors with complete interaction and route states. (AC1-AC4)
- [x] S4 Run targeted regression tests, lint, TypeScript and the bundle build. (AC2-AC5)
- [ ] S5 Compare desktop/mobile light/dark, mouse/keyboard/touch, normal/reduced motion, long content and failure states. (AC1-AC5)

S5 partial evidence: mobile light/dark loading and error states render without horizontal overflow.
Production-shaped Series covers, long titles and ordered-part interactions remain pending because the
production API was not reachable from the visual-QA browser session.

## Risks and boundaries
Old explicit color/font overrides may outlive theme migration; remove only overrides in owned surfaces. Do not port prototype localStorage auth or demo fixtures. Scheduling is a draft timestamp; preserve owner-only capabilities and SEO/media resolution. Revalidate plans after upstream integration.

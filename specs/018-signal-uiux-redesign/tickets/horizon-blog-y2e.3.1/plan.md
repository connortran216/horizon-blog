# horizon-blog-y2e.3.1 implementation plan

Spec: [spec.md](spec.md)
Design approved: prototype 2026-09-06. This implementation plan is agent-reviewed, not separately human-approved.

## Concrete source ownership
- `src/features/blog/pages/BlogPage.tsx`
- `src/features/authors/pages/AuthorArchivePage.tsx`
- `src/features/blog/components/BlogArchiveHero.tsx`
- `src/features/blog/components/BlogFilterToolbar.tsx`
- `src/features/blog/components/FeaturedStory.tsx`
- `src/features/blog/components/EditorialCard.tsx`
- `src/features/authors/components/AuthorArchiveHero.tsx`
- `src/features/authors/components/AuthorArchiveStoryListItem.tsx`
- shared media presentation only where required by the approved component-state contract

## Technical approach
Reuse Chakra semantic tokens, existing hooks and service adapters. Apply the Signal behavioral
contract recorded in Beads decision `horizon-blog-y2e.7`: production-shaped content, distinct
component anatomy, tactile interaction, complete media states, responsive behavior and reduced
motion. Remove fabricated public social counts rather than presenting mock data as real.

## Ordered execution
- [x] S1 Inspect current source, design-system guides, approved prototype and Beads behavioral contract. (AC1-AC4)
- [x] S2 Implement Blog hierarchy, search/filter feedback and image-first cards without changing hooks/services. (AC1-AC4)
- [x] S3 Implement the personal scan-first Author archive and remove fabricated public metrics. (AC1/AC3/AC4)
- [x] S4 Run targeted regression tests, lint, TypeScript and the bundle build. (AC2-AC5)
- [ ] S5 Compare desktop/mobile light/dark, mouse/keyboard/touch, normal/reduced motion, long content and failure states. (AC1-AC5)

S5 partial evidence: desktop light and mobile light/dark failure states render without horizontal
overflow. Production-shaped success/card states remain pending because the production API was not
reachable from the visual-QA browser session.

## Risks and boundaries
Old explicit color/font overrides may outlive theme migration; remove only overrides in owned surfaces. Do not port prototype localStorage auth or demo fixtures. Scheduling is a draft timestamp; preserve owner-only capabilities and SEO/media resolution. Revalidate plans after upstream integration.

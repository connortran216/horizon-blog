# Review revision QA — 2026-09-06

Final result: pass for the requested header, Home and About revision. This is a scoped visual check, not a new audit of all 26 screens.

## Source and comparison

Source visual truth: `qa/home-light-final.png` plus the user's current review, which intentionally supersedes the old header, Latest layout and hero label. Implementation: `qa/review-home-light-1488.png`. Both are 1488 × 1056 pixels at a 1488 × 1056 CSS viewport, density 1. Combined full-view evidence opened and inspected: `qa/review-comparison.png` (before left, after right). Both show Home, light theme, signed-out demo, top of page. The animated hero position can vary slightly between frames.

Focused inspection used the rendered header/hero at 1280 × 720, Latest cards at scroll position, and founder content at desktop and 390 × 844 mobile. Evidence: `qa/review-home-light-desktop.png`, `qa/review-about-founder-light.png`, `qa/review-about-founder-dark.png`, `qa/review-about-dark-mobile.png`, `qa/review-home-dark-mobile.png`, `qa/review-home-light-mobile.png`. Founder identity, avatar URL, biography and external links were checked against the production About source. The existing avatar is an illustration, reused as-is.

## Findings and required surfaces

- Typography: Be Vietnam Pro and the existing heading hierarchy retained. Vietnamese titles wrap legibly on desktop and mobile; excerpts are deliberately clamped in Latest cards.
- Layout: compact grouped navigation replaces the wide distributed bar. Latest becomes a full-width two-column grid, stacked on mobile; Series moves below. These are requested changes, not fidelity drift. Founder image and biography stack on mobile. No horizontal overflow on Home or About at 390px.
- Tokens: existing light/dark semantic colors retained. Scoped layered elevation and extended editorial motion implement the user's requested polish; documented in the design system.
- Imagery: original editorial hero assets retained; production founder avatar loaded successfully with nonzero natural width. No fabricated portrait.
- Copy: Signature replaces Latest Blog; six Latest entries exclude the Signature article. Founder biography and CV/GitHub/LinkedIn destinations match production source.

No actionable P0/P1/P2 visual mismatch found in this scoped comparison. The before/after differences follow the review.

## Validation and limits

- Production build passed; existing bundle-size advisory remains.
- All four Sites packaging/routing tests passed.
- Browser confirmed six Latest cards, loaded founder image, light/dark rendering and 390px mobile widths without horizontal overflow.
- Reduced-motion rules inspected in CSS; OS preference switching was not exercised during this pass.
- The full 26-screen interaction suite was not rerun for this scoped revision.

## Implementation checklist

- [x] Compact navigation
- [x] Signature / Latest / Series hierarchy
- [x] Six nonduplicated Latest cards
- [x] Home and About motion and elevation
- [x] Restore founder section
- [x] Desktop/mobile and theme checks

## Latest pass: interaction motion study

Final result: pass for implemented interactions and preserved layout, with the test gaps below.

Source: `qa/review-home-light-1488.png` (provisionally approved prototype). Render: `qa/motion-home-light-desktop.png`. Combined evidence opened and visually compared: `qa/motion-comparison.png`. Both images are 1488 × 1056 pixels, same CSS viewport, density 1, light Home at the top. Typography, spacing, semantic colors, artwork quality and copy remain consistent; tiny hero-position differences are expected from its existing ambient motion. No new P0/P1/P2 visual drift found. Focused Reader/TOC, filtered Blog dark, Series connector dark and mobile reduced-motion views were inspected in browser.

Browser checks: Signature opens Reader; clicking TLS heading sets active TOC location; progress updates on scroll; Like changes to Unlike; copying code reports Copied to clipboard; python filter yields two cards; light/dark switch renders; Series connector appears between the two parts. At 390 × 844 mobile, reduced-motion preference reports hero animation none and document scroll width equals viewport width. Screenshot: `qa/motion-home-reduced-mobile.png`. Preference returned to full motion and viewport override reset after checks.

Build and four Sites checks passed. Browser snapshot automation waits through short transitions, so intermediate card morph/pop frames were not captured; animation timing and pointer-light behavior were additionally checked in implementation. OS-level preference switching, unsupported-browser fallback and the unrelated 26-screen suite were not rerun.

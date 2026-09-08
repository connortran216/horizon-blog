# Release 1 local validation — 2026-09-08

Scope: Signal foundations, compact shared navigation, Home. Branch: `codex/horizon-blog-y2e-B1-foundations`. No commit, push, merge, or deployment performed.

## Implemented

- Approved paired semantic tokens, local Be Vietnam Pro fonts and reduced-motion support. Signal theme applies to Home; legacy theme remains on other routes.
- Compact Blog/Series/About navigation, guest theme toggle and mobile collapse; existing authenticated actions retained.
- Signature uses newest published summary; Latest displays up to six distinct subsequent posts. Real empty, loading, error and retry states.
- Existing `getPublishedArchivePosts` service supplies Home: failures propagate instead of being mistaken for empty content. Existing media resolution and Series service retained.
- Soft surfaces, hover lift, hero float and pointer glow with reduced-motion handling.

## Evidence

- Full suite: 281 tests / 79 files passed. Localhost socket tests required sandbox escalation.
- After final whitespace/test-fixture cleanup: ESLint, TypeScript, Vite production build and 7 Home tests passed. No dependencies added.
- Browser: 390px dark Home, theme toggle, mobile navigation and automatic collapse on navigation to legacy About inspected.
- Populated desktop Home inspected at 1488px using a static rendering of real components with sanitized public text and fallback artwork. Six Latest cards asserted by tests. This is visual sample evidence, not a live API integration pass.
- Fixed mobile intro word spacing. Removed Node-only visual-artifact generation from app tests after typecheck caught unsupported Node imports; test fixtures now use a normal JSON import.

## Remaining release gates

- Local backend is unavailable. Verify successful loading, real resolved covers, Series and signed-in navigation against a running backend before release. Error presentation was observed in the real build.
- Existing large-bundle build warning remains; performance certification not performed.
- Full shared motion/navigation marker work remains R4; other pages remain subsequent releases.
- Release grouping is recorded in release-plan; future bundle/dependency metadata must be reconciled before starting R2.

R1 is implemented with local checks, not production-certified. Retain open Home ticket until backend-connected acceptance is complete.

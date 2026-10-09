# Design QA: Profile Editorial Workspace

## Source and implementation

- approved reference: `specs/022-profile-editorial-workspace/assets/profile-editorial-workspace-reference.png`
- implementation preview: `http://127.0.0.1:4174/ui-kit.html?build=profile-final6#gallery-entry-ProfileHeader`
- behavior contract: `specs/022-profile-editorial-workspace/spec.md`
- production composition: `src/features/profile/components/ProfileHeaderCard.tsx`

## Visual comparison

- the workspace matches the selected split hierarchy: a 30/70 identity rail and writing region on desktop, with the portrait and identity content moving ahead of the writing context on narrow screens
- the portrait is a large square frame with the `Change picture` action clipped inside its lower edge; the overlay keeps a light foreground over the scrim in both themes
- `Connor Tran` uses the display face, with the small `Edit profile` text action directly beneath it
- `Write a blog` is the only dominant CTA in the header and retains its permission gate
- the biography remains the visual focus of the right region and is constrained to a comfortable measure
- Blogs and Drafts are unboxed typographic facts separated by rules, not KPI cards
- the default/public `ProfileHeader` and compact `AvatarEditor` states remain visually unchanged

## Responsive and theme checks

Checked at 320, 375, 768, 1024, and 1440 CSS pixels, with focused comparison in light and dark themes.

- 320/375: one-column reading order is portrait, portrait actions, name, edit action, metadata, workspace label, writing CTA, biography, then stats; copy wraps within the component boundary
- 768: the one-column composition remains readable with the full-size portrait and comfortable text measure
- 1024/1440: the desktop split activates, the identity rail remains subordinate, and the biography and stats retain their hierarchy
- both themes preserve the selected blue action, lime accent, readable portrait overlay, surface separation, and visible focus treatment
- the gallery shell itself adds review padding around the component; the production pattern is explicitly constrained to `width: 100%`, `max-width: 100%`, and zero minimum width so its content does not create horizontal overflow

## Interaction and accessibility checks

- the workspace has one `h1`; Blogs and Drafts remain semantic `dt`/`dd` pairs
- the avatar chooser remains a named file input driven by a visible button and keeps uploading, error, retry, and disabled behavior
- the `Edit profile` button still opens the existing editor callback, and `View full size` still uses the existing preview callback
- keyboard focus from `Edit profile` advances to the email link, followed by the remaining metadata and writing action in DOM order
- protected `/profile/:username` still redirects an unauthenticated visitor to login
- no browser console errors or warnings were observed during desktop dark, desktop light, or mobile checks

## Automated gates

- targeted profile and account-pattern tests: 9 files, 122 tests passed
- TypeScript, ESLint, Prettier, design-system coverage, and production build: passed
- design-system coverage: 126 legacy files, 126 ledger rows, 107/107 exports represented in the gallery
- the full Vitest assertion set passed, but one broad run reported 10 fork-worker startup timeouts from local pool saturation; the targeted changed surface is clean

## Final result

final result: passed

---

# Analytics Visual Fidelity QA

- Source visual truth: `/Users/trantuancanh/.codex/visualizations/2026/09/29/01a0eb1a-0d5e-7c80-88a9-ccee00a2e1f9/horizon-analytics-journey-map-demo/public/qa/analytics-detail-option-3.png` and the approved overview/detail demo in the same project.
- Implementation under review: production `ReaderJourney`, `ReachDepthMap`, `SelectedBlogEvidence`, and `BlogDiagnosticWorkspace` rendered with representative production-shaped fixtures in Storybook.
- Comparison states: overview and retention detail; desktop dark, desktop light, and 375 px mobile dark.
- Screenshot evidence: browser-rendered captures were inspected in the Codex in-app browser. The browser exposed screenshot bytes for visual review but did not persist a local screenshot path.
- Final result: passed

## Fidelity findings

### Pass 1

- [P2] Narrow-screen reach/depth labels could overlap even when their point centers passed the desktop collision threshold.
  - Evidence: the high-completion CORS label overlapped the selected Chatbot label at 375 px.
  - Impact: the map lost the concise scan hierarchy approved in the demo.
  - Fix: wide screens keep the selected and collision-checked high-signal labels; narrow screens show only the selected label. Every other title remains available through the point tooltip and accessible name.

### Pass 2

- Desktop overview presents one connected reader route with visible nodes and directional connectors rather than four independent KPI columns.
- Reach/depth labels remain sparse, readable, and aligned within the plot in both themes.
- Mobile journey becomes a connected vertical sequence without page-level horizontal overflow.
- Detail retention restores the approved three-metric hierarchy and plots the remaining session counts (`17 → 15 → 13 → 12 → 11`) instead of percentages.
- The contextual rail keeps the previously approved duplicate-suppression behavior.
- No actionable P0, P1, or P2 mismatch remains.

## Required fidelity surfaces

- Typography: semantic `h2`/`h3` headings use the existing compact analytics scale; numeric emphasis and muted labels match the approved hierarchy.
- Spacing: page gaps, journey padding, overview section rhythm, metric spacing, chart height, and rail separation were tightened without adding card chrome.
- Colors and tokens: all new lines, nodes, labels, fills, borders, and focus states use existing Horizon semantic tokens in light and dark mode.
- Images and assets: no raster assets are involved. Existing `react-icons` arrows and feature-owned data visualizations are used.
- Copy: visible text stays limited to labels, values, selected titles, and backend insight copy. Definitions remain in hover/focus tooltips.

## Interaction and technical checks

- Map points remain native buttons with complete accessible names and pressed state.
- Selected blog navigation remains a normal hyperlink with the active date range.
- Tooltips remain pointer- and keyboard-reachable.
- Desktop light/dark and mobile 375 px rendered without component console errors; only existing Storybook/React Router development warnings were present.
- Analytics-focused tests: 9 files, 35 tests passed.
- Full regression suite: 189 files, 1,936 tests passed outside the sandbox; the sandbox-only attempt could not bind the SEO test server to localhost.
- Type check, repository lint, and production build passed.

final result: passed

---

# Analytics Monitoring Report QA (spec 024)

- Visual truth: `specs/024-analytics-monitoring-report/approved-mockup.png`.
- Implementation under review: `AnalyticsOverviewPage` and `BlogAnalyticsPage` composed from `AnalyticsReportSection`, `AnalyticsReportSummary`, `AnalyticsDailyViews`, `BlogPerformanceReport`, `BlogReadingReport`, `ReadingRetentionChart` and `AnalyticsDateRangeFilter`, rendered with labelled fixtures in Storybook `Author/Analytics monitoring`.
- Evidence: `specs/024-analytics-monitoring-report/evidence/`. `date-mobile.png`, `overview-light.png`, `overview-mobile-light.png` and `detail-light.png` show the final date wording and the stacked custom-date inputs at 375 px; the `*-dark.png` captures predate the date-format change and otherwise match.

## Fidelity findings

- Date disclosure reads "Sep 9 – Oct 8, 2026 · UTC" as in the mockup; the chart subtitle uses the same wording.
- The mockup's "low sample" badges are stated as "Based on N opens": the spec asks for the actual view denominator rather than a significance threshold.
- The mockup's "View all" is the existing paginated table: the spec keeps pagination and deep links.
- Views are counts without a meter; completion is a 0–100% track with its denominator; retention says "did not reach"; source bars are labelled as share of attributed views and source quality columns are omitted.

## Interaction and technical checks

- Custom date inputs stack to full width at 375 px (observed); above the `sm` breakpoint they share the row with a `space[24]` minimum, through tokens only.
- Storybook rendered desktop and 375 px without console errors.
- Analytics-focused tests: 9 files, 34 tests passed.
- Full suite: 189 files, 1,935 tests passed.
- Type check, repository lint, Prettier check and production build passed.
- The legacy map/journey/tab analytics components and their helpers were removed; no route, story or test referenced them.

final result: passed

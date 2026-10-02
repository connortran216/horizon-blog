# Analytics Pages

## Intent

Analytics is an owner-only writing feedback surface. It helps an author understand reach, reading depth, sources, and reader actions without making Horizon feel like a dashboard product.

## Covered Routes

- `/analytics`
- `/analytics/blog/:id`

## Primary Actions

- Change the inclusive UTC analytics range.
- Select a blog on the reach × reading-depth map.
- Follow the selected blog title to its diagnostic route.
- Switch the detail page's active diagnostic question.
- Return from blog diagnostics to the overview.

## Overview Hierarchy

1. Compact route header, readable freshness, and the v2 `DateRange` controls.
2. One aggregate reader journey: views, readers, estimated completion, and action events.
3. One reach × completion map for the current page of blogs.
4. One contextual evidence strip for the selected blog.
5. Pagination when the backend result spans multiple pages.

Rules:

- Use the v2 report shell: `ContentContainer`, `Section`, `Stack`, typography recipes, and feedback states.
- Do not reintroduce a KPI-card grid, generic trend panel, or comparison table.
- Actions are event totals, not unique readers and not a strict funnel stage.
- The journey is a connected route on desktop and a connected vertical sequence on narrow screens; the directional relationship must not collapse into four unrelated KPI columns.
- The reach × completion map labels the selected blog plus a small collision-checked set of reach/depth outliers on wider screens. Narrow screens show only the selected label. Full titles remain available from each point's tooltip and accessible name.
- The selected title is the diagnostics action; do not repeat an `Open` or `Details` button per blog.
- Fetch blog points in stable `views desc` order. Sorting is intentionally absent from this visual comparison.

## Detail Hierarchy

1. Back link, blog title, compact summary, freshness, and date range.
2. Three question tabs:
   - `Do they keep reading?`
   - `Where do they come from?`
   - `What do they act on?`
3. One main diagnostic panel for the active question.
4. One narrow contextual evidence rail.

The rail must not repeat the primary signal already visible in the active panel:

- Retention: sources, clicked link, reactions, insight.
- Sources: clicked link, reactions, insight.
- Actions: source signal, insight.

Retention foregrounds three reading signals before the curve: estimated readers, completion, and active reading time. The curve plots remaining session counts at each reading-depth marker; percentages remain supporting context rather than the plotted value.

## Core Components

- `AnalyticsDateRangeFilter`: adapter over the v2 date-range pattern with presets and custom UTC dates.
- `AnalyticsInfoTooltip`: keyboard-focusable definitions for metrics and diagrams.
- `ReaderJourney`: aggregate reach-to-reading path with actions identified as events.
- `ReachDepthMap`: accessible blog selection by views and completion.
- `SelectedBlogEvidence`: selected summary and direct title link.
- `BlogDiagnosticWorkspace`: question tabs, active diagnostic, and contextual evidence rail.

## Visual Rules

- Treat the page as an editorial report: whitespace and hairline dividers, not nested cards.
- Use semantic tokens and v2 typography recipes; do not restore legacy aliases.
- Use `action.*` for active points, lines, bars, tabs, and focus emphasis.
- Keep plots dependency-free and feature-owned.
- Label the selected state textually; color, size, and position are supporting encodings.
- Use semantic `h2` section titles and `h3` journey-stage titles while preserving the compact report typography.

## Content Rules

- Keep visible explanations short; put definitions in tooltips.
- Preserve backend insight `message`, `sample_size`, and `evidence`.
- Do not invent recommendations, causal explanations, or precision.
- Label approximate readers and derived completion estimates.
- Format evidence and freshness in author-readable units, never raw backend keys or timestamps.

## Accessibility

- Every map point is a focusable button with title, views, and completion in its accessible name.
- Question tabs use native tab semantics and visible focus.
- Tooltips work on hover and keyboard focus.
- Diagram meaning is repeated through text and values.
- Loading, empty, error, unauthorized, not-found, and unavailable states use the v2 feedback patterns.

## Responsive Behavior

- The report header and date controls stack naturally on narrow screens.
- The journey becomes a vertical sequence.
- The map retains bounded height and selected evidence appears below it.
- Detail tabs scroll horizontally when needed.
- The evidence rail stacks below the main diagnostic before desktop width.

## Motion

- Keep analytics mostly static.
- Small hover/focus transitions are allowed; do not animate data paths or point positions.
- Reduced motion keeps all values and selected states present without travel.

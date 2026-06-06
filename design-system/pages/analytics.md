# Analytics Page

## Intent

Analytics is an owner-only writing feedback surface. It should help an author understand reach, completion, reactions, links, sources, and data freshness without making Horizon feel like a dashboard product.

## Covered Routes

- `/analytics`
- `/analytics/blog/:id`

## Primary Actions

- Change the inclusive UTC analytics range.
- Sort blog metrics.
- Open a blog diagnostics view.
- Return from blog diagnostics to the overview.

## Layout

- Use a calm protected-page shell with one action-token halo behind the page header.
- Keep metric cards compact and readable.
- Keep chart and funnel primitives feature-owned under `src/features/author-analytics/components`.
- Prefer one card surface per component; avoid nested dashboard chrome.

## Hierarchy

- Header explains what the analytics route is for.
- Date range control follows the header.
- Primary metrics appear before trend and blog lists.
- Blog diagnostics prioritize summary metrics, progress funnel, reactions, links, and sources.

## Core Components

- `AnalyticsDateRangeFilter`: range presets and custom UTC dates.
- `AnalyticsMetricCard`: compact metric with optional approximate label.
- `AnalyticsTrendChart`: dependency-free SVG line chart.
- `ReaderProgressFunnel`: accessible progress bars for reader drop-off.
- `AnalyticsReactionTrend`: hearts added/removed summary.
- `LinkPerformanceTable`: clicked links in the selected range.
- `TrafficSourceBreakdown`: source category and host quality.

## Motion

- Keep analytics surfaces mostly static.
- Do not add animated charts unless reduced-motion behavior is defined.

## Accessibility Notes

- Approximate unique-reader counts must be labeled.
- Charts need accessible labels and must not be the only source of metric meaning.
- Sorting controls must remain keyboard reachable and have visible active state.
- Empty, error, unauthorized, not-found, and unavailable states should explain what the author can do next.

## Content Notes

- Prefer "blogs", "writing", "readers", "completion", and "fresh through".
- Do not imply exact unique-reader precision when the backend marks the number approximate.
- Do not expose backend system names in user-facing copy except when explaining freshness cautiously.

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

A reading report, not a dashboard - nothing on the page is boxed.

- The header is the display-face title (typeset), one sentence, and "Fresh through" stated as a
  readable UTC time; the date range sits directly under it as a line of controls.
- The summary figures stand on one rule (`MetricGrid` is a `SignalRoute`): Views, Readers and
  Completion lead on the display face in the action colour, the rest follow at page-title size.
- Trend, reading progress, reactions, sources and notes each open on a hairline
  (`ReportSection`) with their own heading; tables are unframed (`DataTable framed={false}`),
  only the rules between rows.
- Keep chart and funnel primitives feature-owned under `src/features/author-analytics/components`.

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

- Mostly static. Two arrivals, once each: the summary rule writes the figures as it draws, and the
  trend line draws itself left to right the first time it is seen, a signal riding its edge at the
  line's own height (transform only).
- Reduced motion: the rule is drawn, the figures are present, the trend is drawn - no travel.
- A later range change crossfades the trend rather than redrawing it.

## Accessibility Notes

- Approximate unique-reader counts must be labeled.
- Charts need accessible labels and must not be the only source of metric meaning.
- Sorting controls must remain keyboard reachable and have visible active state.
- Empty, error, unauthorized, not-found, and unavailable states should explain what the author can do next.

## Content Notes

- Prefer "blogs", "writing", "readers", "completion", and "fresh through".
- Do not imply exact unique-reader precision when the backend marks the number approximate.
- Do not expose backend system names in user-facing copy except when explaining freshness cautiously.
- Insight evidence names metrics as an author reads them ("Completion", "Active read") and states
  values in their own unit ("62%", "5m 44s"), never the raw key.
- On a blog's diagnostics, descriptions speak of that blog ("Current hearts on this blog").

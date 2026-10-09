# Analytics Pages

## Intent and approved direction

Owner-only monitoring report, based on the compact numbered report approved for spec 024. This supersedes the previous reach/depth map and question-tab layout. Preserve editorial typography, inline summary, whitespace and hairline dividers; do not introduce a KPI-card grid.

## Routes and hierarchy

- `/analytics`: compact title and UTC date disclosure; inline summary and freshness; **01 Audience over time** daily views; **02 Blog performance** searchable, sortable, paginated table.
- `/analytics/blog/:id`: back link and title; inline summary and date disclosure; **01 Where reading stops**, **02 Traffic sources**, **03 Reader actions**, all visible in one reading flow.

## Metric contracts

- Raw Views are unbounded counts. Table cells show numbers only, with no progress track, fill or implied maximum.
- Completion is a session ratio with a fixed 0–100% track. Zero has no decorative minimum fill. Show the observed opens denominator; do not invent completed counts from rounded percentages.
- Daily views use a numeric axis that scales to the observed data. Missing dates remain gaps, not invented zero measurements.
- Retention plots session counts, with readable values and an accessible data disclosure. The early observation requires real opened and 25% stages. Say "did not reach", without inferring that someone left or why.
- Traffic bars encode the bounded share of attributed views. Source completion and active-time metrics are omitted until their data semantics can be verified.
- Readers remain explicitly approximate. Actions are events, not unique people or funnel stages.
- Preserve backend insight messages, sample sizes and evidence in the supplementary disclosure.

## Controls and data

- Existing v2 `DateRange` presets/custom inclusive UTC dates live in a compact keyboard-accessible popover whose trigger reads "Sep 9 – Oct 8, 2026 · UTC".
- Collect all pages of the existing metrics API before searching or sorting, then paginate locally. Incomplete, duplicate, failed or changing pagination results produce retryable errors; cancellation prevents further page requests.
- Title search ignores case and Vietnamese diacritics. Sort by views, completion or active read time, in either direction.
- Range, search, sort, order and current page are carried into detail links and restored by the Analytics back link. Search and sort reset pagination.
- Keep loading, empty, error, permission and not-found states through existing feedback primitives.

## Components

- `AnalyticsReportSection`, `AnalyticsReportSummary`: numbered semantic sections and compact summary.
- `AnalyticsDailyViews`, `BlogPerformanceReport`: overview trend and comparison table.
- `BlogReadingReport`, `ReadingRetentionChart`: continuous detail report.
- `AnalyticsDateRangeFilter`: compact adapter over v2 DateRange.

## Accessibility, responsive behavior and motion

Use semantic h1/h2/h3 headings, labelled controls, visible keyboard focus, textual values and accessible tables for charts. Use semantic tokens and existing v2 primitives. Do not animate data paths. Narrow screens stack controls and detail sections; charts and the table scroll within labelled, keyboard-focusable regions rather than overflowing the document. Keep numbered section labels on one line.

## Evidence

See `specs/024-analytics-monitoring-report/approved-mockup.png`, ticket plans and `design-qa.md`. Storybook: `Author/Analytics monitoring`. Preview fixtures are visibly labelled and are not production measurements.

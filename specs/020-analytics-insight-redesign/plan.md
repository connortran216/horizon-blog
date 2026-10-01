# Implementation Plan: Analytics Insight Redesign

**Spec**: [spec.md](./spec.md)
**Constitution**: [.specify/memory/constitution.md](../../.specify/memory/constitution.md)

## Technical Context

- **Stack**: React 18, TypeScript, Chakra UI, React Router, Vitest.
- **Scope**: `src/features/author-analytics` plus analytics design-system documentation.
- **Data**: Existing overview, post-metrics, and blog-detail responses remain authoritative.
- **Dependencies**: No new production dependency; diagrams use HTML/CSS/SVG and existing `react-icons`.
- **Validation**: Visualization helper tests, focused feature tests, type check, lint, build, and rendered visual QA when an existing preview is available.

## Constitution Check

- **Spec-first**: Pass. User-approved overview and detail behavior is captured before implementation.
- **Contract alignment**: Pass. No backend or DTO change.
- **Architecture**: Pass. Analytics transforms remain outside page render paths and visual components stay feature-owned.
- **Design system**: Pass. Existing semantic tokens and protected-page shell remain in use.
- **Focused verification**: Pass. New derived display behavior receives regression tests before page replacement.

## Design Direction

### Overview

1. Compact header and date-range control.
2. Reader journey: `Views → Readers → Completed` with `Actions` as a related event signal, not a strict unique-reader funnel stage.
3. Reach × reading-depth map with keyboard-selectable points.
4. Selected-blog evidence strip with one title hyperlink and concise values.
5. Pagination for the existing metrics endpoint.

### Detail

1. Back link, blog title, freshness, and date range.
2. Question tabs controlling one main diagnostic:
   - retention curve/progress,
   - source quality,
   - actions.
3. Narrow contextual evidence rail that excludes evidence already promoted by the active tab.
4. Backend insight copy remains intact and evidence is disclosed compactly.

## Component Boundaries

- `AnalyticsInfoTooltip`: shared accessible definition trigger.
- `AnalyticsDateRangeFilter`: compact popover preserving presets and custom UTC dates.
- `ReaderJourney`: aggregate journey with derived completion/action labels.
- `ReachDepthMap`: map points, selection, axes, and accessible point list semantics.
- `SelectedBlogEvidence`: selected summary and direct detail link.
- `BlogDiagnosticTabs`: question-led tab navigation and main panels.
- `AnalyticsEvidenceRail`: tab-aware supporting evidence with duplicate suppression.

## Risks and Mitigations

- **Derived values imply false precision**: Label estimated completion and approximate readers explicitly.
- **Scatter plot is inaccessible**: Every point is a button with a complete accessible label and selection is repeated textually below.
- **Dense labels collide**: Label only the selected point in-plot; expose all titles through focus/tooltip.
- **Small data sets distort position**: Clamp plot positions and handle equal/zero maxima deterministically.
- **Responsive diagrams collapse**: Use bounded plot aspect ratios and stack diagnostic/rail below desktop width.
- **Information duplicates across tabs**: Centralize rail section selection in a tested helper.

## Verification Sequence

1. Add failing helper tests for journey, plot positions, and contextual rail sections.
2. Implement helpers and feature components.
3. Replace overview and detail composition while preserving data hooks and state handling.
4. Update analytics design-system documentation.
5. Run focused tests, type check, lint, build, and targeted rendered inspection.

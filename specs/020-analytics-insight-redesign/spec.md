# Feature Specification: Analytics Insight Redesign

**Created**: 2026-09-30
**Status**: Implemented
**Routes**: `/analytics`, `/analytics/blog/:id`

## Intent

Turn analytics from a dense dashboard into a calm writing-feedback surface. The overview should answer how the audience moves from reach to meaningful reading and which blogs combine reach with depth. The detail page should answer one diagnostic question at a time without repeating the same evidence in several panels.

## User Stories

### User Story 1 - Understand the audience journey (Priority: P1)

As an author, I can scan one reader journey from views through readers and completion to actions without decoding a grid of scorecards.

**Independent Test**: Given overview data, the page presents views, readers, estimated completions, and action events in one labeled journey; every metric definition is available by keyboard-focusable tooltip.

### User Story 2 - Find blogs with reach and depth (Priority: P1)

As an author, I can compare blogs on a reach × completion map and select a point to inspect concise evidence.

**Independent Test**: Given several blog rows, every blog appears as a focusable point, selection updates one evidence strip, and the blog title is a normal link to its diagnostic route.

### User Story 3 - Diagnose one question at a time (Priority: P1)

As an author, I can switch among retention, source, and action questions while keeping only supporting evidence beside the active diagnostic.

**Independent Test**: Switching tabs changes the main diagnostic and removes duplicate evidence from the side rail: source evidence is absent on the source tab; link and reaction evidence are absent on the action tab.

## Functional Requirements

- **FR-001**: The redesign MUST preserve current analytics API contracts, route contracts, inclusive UTC range behavior, protected access, loading, error, and empty states.
- **FR-002**: The overview MUST replace the KPI-card grid, trend panel, and comparison table with one reader journey, one reach × completion map, and one selected-blog evidence strip.
- **FR-003**: Overview journey values MUST use backend summary data. Estimated completions MAY be derived as `views × completionRate` and MUST be identified as an estimate.
- **FR-004**: Actions MUST equal the displayed event total of hearts received, shares, and link clicks; the UI MUST NOT imply these are unique readers or a strict funnel stage.
- **FR-005**: Map x-position MUST represent views and y-position MUST represent completion rate. Point size MAY represent estimated unique readers and MUST remain operable without relying on size or color alone.
- **FR-006**: Each map point MUST have an accessible name containing the blog title, views, and completion rate.
- **FR-007**: The selected blog title MUST be a hyperlink to `/analytics/blog/:id` carrying the current analytics range. The page MUST NOT render a repeated per-row `Open` or `Details` button.
- **FR-008**: Blog metrics MUST remain paginated and fetched in stable `views desc` order. Pagination MAY remain beneath the map; sort controls are intentionally retired from the overview UI.
- **FR-009**: The detail page MUST expose three question tabs: `Do they keep reading?`, `Where do they come from?`, and `What do they act on?`.
- **FR-010**: The retention tab MUST use progress-funnel sessions and rates. The source tab MUST use source views, completion, and active reading. The action tab MUST use link clicks, reactions, and shares from existing response data.
- **FR-011**: The detail side rail MUST be contextual. Retention shows sources, top clicked link, reactions, and insight; sources shows top clicked link, reactions, and insight; actions shows source signal and insight.
- **FR-012**: Backend insight messages, sample size, and evidence MUST be preserved. The frontend MUST NOT invent recommendations, causality, or confidence.
- **FR-013**: Visible explanatory text MUST be concise. Metric and diagram definitions MUST be available through hover and keyboard-focus tooltips.
- **FR-014**: The interface MUST use existing Horizon semantic tokens, remain legible in light and dark mode, and add no production dependency.
- **FR-015**: Question tabs, map points, links, range controls, pagination, and tooltips MUST be keyboard operable with visible focus.
- **FR-016**: At small widths, diagrams MUST remain understandable without horizontal page scrolling; map points MUST have a readable selected summary below the plot.

## Success Criteria

- **SC-001**: The overview contains no analytics metric-card grid and no blog comparison table.
- **SC-002**: Selecting each rendered blog point updates the evidence strip and leaves one direct title link to the correct detail route.
- **SC-003**: The active detail diagnostic never duplicates its primary source/link/reaction signal in the contextual rail.
- **SC-004**: All analytics definitions used only as helper copy are reachable through focusable tooltips.
- **SC-005**: Focused tests cover journey derivation, map positioning, contextual evidence selection, and existing range/error behavior.
- **SC-006**: Type check, focused tests, lint, and production build pass, or any repository-wide pre-existing blocker is recorded precisely.

## Edge Cases

- No blogs or no measurable activity in the selected range.
- One blog only, equal view counts, zero views, or zero completion.
- More map points than can be labeled simultaneously.
- Approximate unique-reader contract.
- Missing sources, links, reactions, or backend insights.
- Long Vietnamese or English blog titles.
- Direct/unknown source hosts.

## Non-Goals

- Changing analytics endpoints, DTOs, aggregation logic, or freshness semantics.
- Adding a chart library or a new design-system package.
- Introducing AI-generated recommendations.
- Rebuilding unrelated author-management surfaces.

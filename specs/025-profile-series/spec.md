# Feature Specification: Series on the profile ("Spines")

**Feature Branch**: `claude/profile-series`
**Created**: 2026-10-11
**Status**: PR 1 implemented and verified locally
**Input**: The author profile has no way to see, create or reach the management of Series. Owner
approved the "Spines" concept (`mockup.html`) and the recommended decisions, delivered in two PRs.

## Review summary

- `/profile/:username` shows nothing about Series: no count, no section, no entry point.
- `/series/manage` is reachable only from the "Manage Series" link in publication review, and its
  back link returns to the editor.
- `/series/manage` is the boxed screen from the spec-015 mockup (a create card, one card per Series).
  This spec reopens that screen; PR 2 replaces it.

## Decision: _Spines_

- **A Series section under Blogs**, a sibling rather than a fourth tab: the tabs filter blogs by
  status, a Series groups them.
- **A fourth masthead count**, `Series`, written by the masthead's existing `SignalRoute` rule.
- **Each Series is a spine**: a hairline with one mark per part, in reading order. A published part is
  a filled mark, a scheduled part a ringed mark, a draft a dashed mark. The line is lit through the
  unbroken run of published parts from Part 1, so a gap shows where readers stop. Text carries the
  same facts (tally line, visually hidden part list), so nothing depends on colour or shape alone.
- **Create in place**: `New Series` opens an unboxed composer at the top of the section. A created
  Series appears as the first spine, empty, with its Manage action.
- **Blog cards say where they belong**: an owner card in a Series shows `Part X of Y` through the
  existing post metadata slot, using the owner's order (drafts included) and linking to management.

## Scope of PR 1

- Masthead count, Series section, spines, composer, card position.
- Manage actions point at the existing `/series/manage` until PR 2 ships the per-Series page.

PR 2 (separate spec update): `/profile/:username/series/:id` owner page, unboxed manager with
"Move here" via `PUT /posts/:id/series`, `/series/manage` redirect, publication-review link.

## Requirements

- **FR-001** The Series section, the composer and the masthead count render only when the profile
  grants `content:manage:own`; without it no owner Series request is made.
- **FR-002** The owner Series request is independent: while it loads the section shows a panel
  loading state, a failure shows an in-section error with retry, and neither blocks the masthead or
  the Blogs section. The masthead count is omitted until the list has loaded.
- **FR-003** A spine states its part count, live count and not-yet-live count in text, and lists its
  parts (position, title, state) to assistive technology in order.
- **FR-004** An empty Series reads "No parts yet" and says it is not shown to readers.
- **FR-005** The composer requires a non-blank title (max 160 characters) and accepts an optional
  description (max 1000), matching the backend contract. A disabled submit explains why; a create
  failure is shown under the composer and keeps what was typed.
- **FR-006** Owner cards of blogs that belong to a Series show `Part X of Y`; the Series title is
  spoken with it.
- **FR-007** No backend contract, data model or dependency change. Token additions are component
  aliases of existing semantic roles.
- **FR-008** Every new design-system export has a tested logic module, a render test, a gallery
  registry row and an entry.
- **FR-009** Motion: the lit run draws once on arrival; under reduced motion it is drawn at rest.
  Nothing ambient.

## Non-Goals

- Series cover artwork (no field exists; a cover would be a data-model change).
- Drag-to-reorder.
- Changing `/series/manage` itself (PR 2).

## Acceptance

- `yarn vitest run`, `yarn lint`, `yarn prettier --check .`, `yarn tsc --noEmit`,
  `yarn coverage:design-system` and `yarn tokens:export` pass.
- The gallery renders `SeriesSpine` and `SeriesComposer` in every registered state, both themes.

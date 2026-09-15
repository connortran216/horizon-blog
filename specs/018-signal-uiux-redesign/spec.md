# Signal UIUX migration

Goal: move every current product route onto the Horizon Design System v2 without changing APIs,
auth, routing or architecture.

Rewritten 2026-09-11. The original spec described building the Signal design while migrating pages.
That is no longer the work: `horizon-blog-dsv2` built the system first, so this epic is now purely a
composition swap.

## Source

- [design handoff](design-handoff/README.md) — the approved Signal baseline.
- `DESIGN.md` — the design contract, and the authority above this document on any visual question.
- `design-system/component-inventory.md` — the ledger mapping each legacy file to its v2 owner.
- `specs/019-horizon-design-system-v2/migration-readiness.md` — the evidence and the release order.

## Scope

All current product routes. Each page stops defining its own visual values and starts composing the
v2 primitives and patterns, then drops the legacy imports it no longer needs.

The screen map and the component gallery (`ui-kit.html`) are review tools, not public product routes.

## Non-goals

- Backend, API, auth, session, OAuth, scheduling, media-storage or routing changes.
- Replacing Chakra, React Router, Milkdown, Crepe or Framer Motion.
- Building new components. If a page needs something the system lacks, that is a design-system
  change with its own review, not a page edit.
- New production dependencies, env files, commits or external delivery without explicit approval.

## Precondition

`horizon-blog-dsv2.7.3` must pass. It has not: the `SeriesManager` inventory row is only partially
discharged, and the `PostCard` full-bleed cover question is unresolved.

## Acceptance criteria

1. Every migrated page composes design-system exports and introduces no raw colour, shadow, radius,
   spacing or motion value.
2. Existing behaviour is preserved exactly: services, data lifecycles, permissions, error handling
   and route contracts are untouched.
3. Each page passes in both themes at 375, 768, 1024 and 1440, with keyboard, touch, reduced motion,
   long Vietnamese and English content, missing and broken media, and its real loading, empty, error
   and denied states.
4. The full suite, lint, types, format, build and `yarn coverage:design-system` are green at the end
   of every release.
5. The compatibility layer is gone by the final release, and the ledger is empty.

## What changed from the original spec

- **Route-based theme selection is dropped.** The original plan enabled Signal on `/` only and kept
  every other route on the old theme. v2 is a separate app-wide Chakra theme; per-route theming is
  not supported, and the attempt at it is what commit `536c262` reverted.
- **Tokens and the design handoff moved out of this epic.** `y2e.1.1` and `y2e.1.2` are superseded
  by `dsv2.1.x` and `dsv2.2.x`.
- **`y2e.2.1` is reopened.** Its code was reverted with the rest of R1; the navigation and Home
  patterns now exist in the design system, so the ticket is a composition task.
- **`y2e.6.2` was split.** Profile and Manage Series stay in `y2e.6.2`; analytics and access
  management moved to `y2e.6.3`, because they migrate on different evidence.
- **Two tickets were added.** `y2e.0.1` mounts the theme app-wide; `y2e.9.1` removes the
  compatibility layer.

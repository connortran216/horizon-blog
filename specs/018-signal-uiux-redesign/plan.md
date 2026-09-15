# Implementation plan

Beads epic: `horizon-blog-y2e` (authoritative operational store).
Release order and scope: [release-plan.md](release-plan.md).

Rewritten 2026-09-11. The original plan ran six serial waves that each built shared theme, shell and
card code, and staged them to avoid collisions on those shared files. Those collisions no longer
exist: `horizon-blog-dsv2` owns the theme, the shell primitives and the cards, and every one of them
is built, tested and demonstrated in the gallery.

## What a release is now

One release swaps a group of pages from legacy composition to design-system composition. For each
page:

1. Read its row in `design-system/component-inventory.md` for the v2 target.
2. Replace its markup with the corresponding primitives and patterns from `src/design-system`.
3. Leave services, hooks, permissions, data lifecycles and route contracts untouched.
4. Delete the legacy imports the page no longer uses, and update its ledger row.
5. Verify in both themes at 375, 768, 1024 and 1440, with keyboard, touch and reduced motion, and
   with the page's real loading, empty, error and denied states.

## Sequence

`M1 → M2 → M3 → M4 → M5 → M6 → M7 → M8`, as set out in the release plan. M1 stands alone because it
changes every route's appearance at once. M6 is additionally blocked on the `SeriesManager` gap.

Releases are serial, but the pages inside one release are independent and can be done in any order.

## Base and integration

- Base branch: `main`.
- The design system is on `codex/epic-horizon-blog-dsv2` and is **uncommitted**. Migration cannot
  start until that work has a recorded integration base — either committed, or captured as a patch —
  because every release depends on it and it currently exists only in a worktree.
- Nothing in this epic may be committed, pushed or deployed without explicit authorization.

## Gates

- **G0 — precondition.** `horizon-blog-dsv2.7.3` passes. It does not yet: `SeriesManager` is
  partially discharged and the `PostCard` cover question is open.
- **G1 — per release.** A clean worktree on a known base, with the design system present.
- **G2 — per page.** Targeted tests, types and lint for the pages touched.
- **G3 — per release.** Full suite, lint, types, format, build and `yarn coverage:design-system` all
  green, plus the responsive and accessibility pass for the pages in that release.
- **G4 — final.** M8 removes the compatibility layer; the ledger is empty and no legacy import
  remains.

## Risks specific to migration

- **A page carries behaviour its ledger row does not mention.** Read the page before replacing it;
  the ledger records visual ownership, not every service call.
- **Composition drift.** A page that "almost" fits a pattern invites a one-off variant. That is a
  design-system change with its own review, never an inline exception in a page.
- **The compatibility layer hides progress.** Six files still read the `obsidian.*` palette
  directly. They must be tracked down before M8 can delete it, and the dev-time adapter warnings are
  how they announce themselves.
- **M1 is visually the largest single change in the epic** and touches no page. Review it on its own
  evidence, not bundled with a composition change.

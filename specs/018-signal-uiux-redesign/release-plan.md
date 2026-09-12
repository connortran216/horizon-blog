# Migration release plan

Rewritten 2026-09-11, after `horizon-blog-dsv2` built the component system. Supersedes the
R1–R6 grouping approved on 2026-09-08.

## Why this was rewritten

The previous plan assumed each release would build its own components as it migrated its pages, and
it isolated risk with **route-based theme selection** — Signal on `/` only, every other route on the
old theme. That mechanism no longer exists, and the plan cannot be followed as written:

- **The components already exist.** `src/design-system/` now holds 68 exported components and
  patterns with 796 tests, plus a gallery at `ui-kit.html`. A release is no longer "build and
  compose"; it is "compose from what exists and delete the legacy imports".
- **Theme selection is app-wide, not per route.** v2 lives in a separate Chakra theme
  (`src/theme/horizon.ts`) that keeps the clean token names while the legacy theme keeps its own
  values. There is no supported way to run both on different routes, and the previous attempt at
  that is what commit `536c262` reverted.
- **Two of the old tickets are done by another epic.** `y2e.1.1` (design handoff) and `y2e.1.2`
  (tokens and typography) were delivered properly by `dsv2.1.x` and `dsv2.2.x`.

The order below comes from `specs/019-horizon-design-system-v2/migration-readiness.md`, derived from
real dependencies rather than from page grouping.

## Precondition

**`horizon-blog-dsv2.7.3` must pass first.** It has not. Two items block it: the `SeriesManager`
inventory row is only partially discharged, and the `PostCard` full-bleed cover question is
unresolved. M6 additionally depends on the first of those.

## Releases

Each release swaps one group of pages to v2 components and removes the legacy imports it no longer
needs. Every release ends green on the full suite, lint, types, format and build.

| Release | Scope | Tickets |
| --- | --- | --- |
| **M1** | Mount `horizonTheme` app-wide in `src/main.tsx` | `y2e.0.1` |
| **M2** | Contact, CV, About | `y2e.5.2`, `y2e.2.2` |
| **M3** | Home, Blog, author archive, Series index and detail | `y2e.2.1`, `y2e.3.1`, `y2e.3.2` |
| **M4** | Blog detail, comments, reactions, reader motion | `y2e.4.1`, `y2e.4.2` |
| **M5** | Login, register, verification, reset, OAuth authorize | `y2e.5.1` |
| **M6** | Editor, publish, schedule, profile, Manage Series | `y2e.6.1`, `y2e.6.2` |
| **M7** | Analytics and access management | `y2e.6.3` |
| **M8** | Delete the compatibility layer and the legacy theme | `y2e.9.1` |

### M1 — provider swap

The one release that changes every route's appearance at once, which is why it stands alone. Nothing
else in it: no composition changes, no page edits. Review is a full visual pass over the existing
pages under the new theme, and the point is to see exactly what the theme alone changes before any
composition moves.

Three legacy re-exports under `src/components/layout/` and the whole `obsidian.*` palette stay in
place through this release; six files still read that palette directly and they are M2–M7's problem,
not M1's.

### M2 — leaf identity surfaces

Least behaviour, most presentation, so they are the cheapest place to find out whether the patterns
survive contact with real content. CV print output is part of acceptance here — it is asserted as
CSS today but has never been printed.

### M3 — discovery

Home first inside the release, then Blog and the author archive, then Series. Series depends on the
post patterns being proven, not the other way round.

### M4 — reader

Highest content risk: real articles, code, diagrams, tables, Vietnamese text, nested comments.
Migrate only after M3 has proven the post patterns against real data.

### M5 — account

Presentation only. Auth, session and OAuth contracts are non-goals and must not move — no token
persistence changes, no fabricated consent, no altered authorization shape.

### M6 — workspace

**Blocked** until the `SeriesManager` gap is discharged or explicitly descoped: `ManageSeriesItem`
exists, but the surrounding form (title, description, add-a-blog, save, delete) was never built, so
Manage Series has nothing complete to migrate to.

The editor libraries do not change. `WorkspaceShell` and `EditorToolbar` are chrome around the
existing editor surface. Scheduling copy must keep saying what the backend means: a scheduled
publication is a draft with a timestamp, not a published post.

### M7 — analytics and administration

Approximate metrics stay labelled as approximate. Permission changes and destructive actions keep
backend authority — the UI asks and reflects, it never decides or optimistically shows a change as
done.

### M8 — remove the compatibility layer

Delete the three `src/components/layout/` re-exports, the legacy `src/theme/index.ts` and the
`obsidian.*` palette once no import remains, then empty the ledger in
`design-system/component-inventory.md`. Adapters warn once per adapter in development naming their
v2 replacement, so anything still on the old path announces itself while M1–M7 run.

## Constraints that carry across every release

- No API, auth, routing, scheduling, media-storage or editor-library changes. Presentation only.
- No new production dependency without explicit approval.
- No raw colour, shadow, radius, spacing or motion value may enter a page. Everything comes from
  `src/theme/tokens` through the design system.
- Real content in acceptance: long Vietnamese and English text, missing and broken media, failures,
  permission denial, partial data.
- Reduced motion, keyboard and touch are acceptance criteria, not follow-ups.
- No commit, push or deploy without explicit authorization.

## Motion direction — carried forward from 2026-09-08

The site should feel alive, and motion is part of each release's acceptance rather than deferred
wholesale to one of them. The design system already implements this: `Reveal`, `Stagger`,
`HoverLift`, `PressFeedback` and `LayoutTransition` exist, with one central reduced-motion policy
that collapses duration and delay to zero while keeping colour, opacity and focus feedback. Each
release checks hover, press, focus, reveal and navigation feedback on desktop and touch in both
themes, and keeps reading text stable.

## Known gaps to resolve during migration

- `SCHEDULE_GRACE_MS` is duplicated because the design system may not import from `features`. Two
  places to change if the worker window moves — reconcile in M6.
- Copy confirmation resets on `pointerleave`/`blur` rather than a timer; a timed hold needs a
  confirmation-hold duration token.
- `Button`/`IconButton` use Chakra's default spinner speed; no spin-duration token exists.
- Control size `sm` sits below the 44px touch floor. `meetsTouchTarget` reports it; each `sm` usage
  needs a review call as its page migrates.
- Component-level responsive collapse at 375 and 768 is still unverified — the gallery's own chrome
  does not collapse. Each release owns the responsive pass for the pages it touches.

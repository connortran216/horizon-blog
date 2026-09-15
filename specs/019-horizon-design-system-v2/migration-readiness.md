# Page-migration readiness gate — `horizon-blog-dsv2.7.3`

Date: 2026-09-12. Branch: `codex/epic-horizon-blog-dsv2`. Nothing committed or pushed.

## Verdict

**Passed.** Both blockers from the 2026-09-11 run are closed, and every automated check is green.
Page migration may begin, subject to the integration-base note at the end.

### What closed the two blockers

1. **`SeriesManager` is discharged.** The owner ruled: build it. `SeriesManagerForm` now covers
   title, description, add-a-blog, save and delete, composing the existing `ManageSeriesItem` rows
   and the existing `moveItem` / `removeItemAt` / `orderIsDirty` logic rather than reimplementing
   them. Ten form statuses, each with its own label, icon and tone — no branch conveys state by
   colour alone. Two contract points are structural rather than conventional: an in-flight delete
   reports removal in exactly one branch (`deletedByServer`), so a pending delete never empties the
   screen; and the save button is `isLoading` rather than disabled, so it keeps focus, announces
   "Saving this Series", and swallows a second click. The ledger row is updated.

2. **`PostCard` is full-bleed.** The owner ruled: match the approved prototype. The resolution keeps
   a single visual owner rather than overriding one from outside. A media frame can now say it does
   not own its corners (`radius="container"`, resolving to an absence, not a design value), and
   clipping was promoted out of an undeclared `overflow="hidden"` literal — which any caller could
   have overridden invisibly — into the tested `surfaceStyle()` contract. `PostCard` then composes
   honestly: Surface draws the card radius and clips to it, the cover declines and renders square.

   A `clipsContent` toggle on `Surface` was considered and deliberately rejected: a surface that
   draws a radius but does not clip is exactly the broken state the single-owner rule forbids, and a
   toggle would have made that state reachable. Clipping travels with the radius.

   Measured in the built gallery: card radius 20px with `overflow: hidden` and zero padding, frame
   radius 0px, and 1px of inset on each side — the card's border, not padding. The cover reaches the
   edge and the card clips it.

Everything else below is evidence, including what is still unverified.

## Automated checks

Run from the worktree, real exit codes, on the final state of this wave:

| Check | Command | Result |
| --- | --- | --- |
| Unit tests | `yarn test` | 1184 passing, 0 failing, 0 skipped |
| Types | `yarn tsc --noEmit` | exit 0 |
| Lint | `yarn lint` | exit 0 |
| Format | `yarn format` | exit 0 |
| Build | `yarn build` | exit 0; emits both `dist/index.html` and `dist/ui-kit.html` |
| Coverage audit | `yarn coverage:design-system` | exit 0 — 138 legacy files / 138 ledger rows, 69/69 exports in the gallery, 0 findings |

The production entry is unchanged: `dist/index.html` still carries its `<!--app-meta-->` block, and
no file under `src/features/`, `src/pages/` or `src/components/` was modified during this epic.

## Visual and accessibility matrix

Measured in a browser against the built gallery at `http://localhost:4179/ui-kit.html`, not asserted
from code. Numbers below are what the browser actually computed.

### Responsive

| Width | Media queries | Type ramp | Document overflow |
| --- | --- | --- | ---: |
| 375 | `max-width:680` fires | pageTitle 32, sectionTitle 25, cardTitle 22, display 40, meta 13 | see note |
| 1440 | `sm`/`lg`/`xl` all fire | pageTitle 44, sectionTitle 28, cardTitle 22, display 64, meta 13 | 0px |

The type ramp flips at the right boundary in both directions, which is the first live confirmation
of the breakpoint correction made during wave 2 (the breakpoints had been set to DESIGN.md's *review
widths*, 375/768/1024/1440, rather than the prototype's real layout transitions at 680 and 1000).
The `sectionTitle` step added in wave 3 renders at 25/28 as intended.

**Note on 375.** The page scrolls horizontally by 691px at that width, and the origin is a single
element: the gallery's own outer shell. No design-system component is an origin. This is the gallery
chrome, which does not collapse, combined with its fixed-width preview frame — the gallery author
documented it. The consequence for this gate is real and is recorded under Not verified: the gallery
cannot demonstrate component-level responsive collapse, even though window-level media queries were
confirmed directly.

### Contrast, both themes

Every rendered text node was sampled with its background layers composited (an earlier sweep that
did not composite alpha reported 24 false failures against translucent status tints; those were a
measurement error, not a defect).

| Theme | Text failures | Busy-control failures | Inactive-control failures |
| --- | ---: | ---: | ---: |
| Light | 0 | 0 | 2 |
| Dark | 0 | 0 | 2 |

Zero ordinary text failures in either theme. This is the evidence DESIGN.md's remaining open
question asked for on the derived roles — overlay, disabled, code, media and the status tints all
hold up as rendered, not merely as arithmetic.

The two remaining failures per theme are genuinely `disabled` controls, which WCAG 1.4.3 exempts as
inactive components. Recorded as an accepted, deliberate exemption rather than silently excluded.

### Focus

Real `Tab` presses, not programmatic focus (which does not trigger `:focus-visible`):

| Theme | `:focus-visible` | Ring | Contrast vs page |
| --- | --- | --- | ---: |
| Light | matches | 2px solid `#3158D4`, 3px offset | 5.63:1 |
| Dark | matches | 2px solid `#ABC0FF`, 3px offset | 10.42:1 |

Both match the approved `focus.ring`, `focus.width` and `focus.offset` exactly, and both clear the
3:1 floor for non-text UI.

## Defect found and fixed at this gate

**A busy control painted itself as a disabled one.** A loading control carries `aria-disabled="true"`
so it stops accepting clicks while keeping focus — correct — but Chakra styles `_disabled` on
`[aria-disabled=true]` as well as `[disabled]`, so a button that was merely working took the
disabled fill. Measured: "Publishing post" at **1.81:1** in light and **1.64:1** in dark, against a
4.5:1 floor. WCAG exempts inactive components, not busy ones, and a progress label is precisely the
text a reader needs while waiting.

Fixed in `src/theme/horizon.ts`: a busy control keeps its resting fill, with the spinner and label
carrying the state. Both routes into the state are covered — our own `controlState` sets
`aria-busy`, Chakra's `isLoading` sets `data-loading`; matching only the first left the retry buttons
at 3.23:1. A test in `src/theme/horizon.test.ts` locks it.

Rendered failures went 18 → 6 → 2 across the two fixes, with the final 2 being the WCAG-exempt
disabled controls.

This defect was invisible to every unit test in the epic and to both bundle agents. It was only
findable by rendering, which is the argument for this gate existing.

## Not verified

Stated plainly rather than implied by omission:

- **Component-level responsive collapse.** Window-level media queries and the type ramp are
  confirmed; how each card, table, rail and split workspace *reflows* at 375 and 768 is not, because
  the gallery's own shell does not collapse and its viewport control constrains a frame rather than
  firing media queries. Closing this needs either a gallery whose chrome collapses, or per-component
  review in a real browser at real widths.
- **Screen-reader output.** Every `role`, `aria-live`, `aria-current`, `aria-describedby` and
  `aria-invalid` is unit-tested as an attribute decision, and the live regions render. What an
  actual screen reader announces, and in what order, is untested.
- **Print.** `CVEntry`'s print styles are asserted as CSS properties; no page was printed.
- **The rail's gestures end-to-end.** Drag-vs-click discrimination, snap and peek are unit-tested as
  arithmetic; real touch was not exercised.
- **`prefers-reduced-motion` from the OS.** The gallery simulates it by wrapping `matchMedia`. The
  policy and its collapse-to-zero behaviour are tested; the browser honouring the real query is not.

## Accepted risks carried into migration

- `SCHEDULE_GRACE_MS` duplicates the five-minute constant in
  `src/features/profile/schedule-display.utils.ts`. The design system may not import from
  `features`, so it is a documented default citing its source. Two places to change if the worker
  window moves — resolve during migration.
- Copy confirmation has no auto-reset timer; it resets on `pointerleave`/`blur`. A timed hold needs a
  confirmation-hold duration token, which is a token decision.
- `Button`/`IconButton` use Chakra's default spinner speed: no spin-duration token exists.
- `Divider` forwards no ref; its two branches render `hr` and `div` and one ref type cannot describe
  both honestly.
- `Radio` ships without a `RadioGroup`; callers pair it with `Field control="group"` and Chakra's own.
- Control size `sm` sits below the 44px touch floor. `meetsTouchTarget` records this rather than
  hiding it; whether each `sm` usage genuinely lacks space is a per-use review call.
- Chakra ships `Input` variants the system does not offer (`filled`, `flushed`) that still carry its
  grey and focus blue. Fields pin `variant: outline`; the form primitives are the real containment.
- `ShareAction`'s menu trigger widens `Button` to `ElementType` for Chakra's polymorphic `as`.
- No charting library: `Trend`, `Funnel` and `Breakdown` are inline SVG, so there are no axis ticks
  or hover tooltips. A text summary serves as the figure's accessible name and the full series is in
  a `details` table.

## Migration order, once the gate passes

Dependency order, safest first. Each step is a separate change that swaps a page's composition to v2
components and deletes the legacy imports it no longer needs.

1. **Provider swap.** Mount `horizonTheme` in `src/main.tsx` in place of the legacy theme. This is
   the step that changes every route's appearance at once, so it wants its own review.
2. **Leaf identity surfaces** — Contact, CV, About. Least behaviour, most presentation.
3. **Discovery** — Home, Blog, author archive. Then Series index and Series detail.
4. **Reader** — blog detail, comments, reactions. Highest content risk; migrate after discovery has
   proven the post patterns.
5. **Account** — login, register, verification, reset, OAuth authorize. Auth contracts are non-goals;
   presentation only.
6. **Workspace** — editor, publish, schedule, profile, Manage Series. Requires item 1 of the Verdict
   to be closed first.
7. **Data** — analytics and access management.
8. **Remove the compatibility layer.** Delete the three `src/components/layout/` re-exports and the
   legacy theme once no import remains, and empty the ledger.

Adapters warn once per adapter in development, naming their v2 replacement, so anything still on the
old path announces itself while the migration runs.

## Clearing the dependency

The page-migration epic (`horizon-blog-y2e`) is **unblocked as of 2026-09-12**: both gate blockers
are closed and this document records the evidence.

One precondition remains before release M1 can start, and it is not a gate finding — it is a fact
about where the work lives. The design system is **uncommitted**, existing only in the worktree
`.codex/worktrees/dsv2-epic` on branch `codex/epic-horizon-blog-dsv2`. Every release depends on it,
so it needs a recorded integration base — committed, or captured as a patch — before the first page
is migrated.

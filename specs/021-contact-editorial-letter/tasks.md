# Tasks: Contact Editorial Letter

**Spec**: `specs/021-contact-editorial-letter/spec.md`
**Plan**: `specs/021-contact-editorial-letter/plan.md`
**Status**: Complete and verified on 2026-09-15. Workstream C stayed closed because the start of the shared footer is visible at 1440x1024.

Ordering rule: G before everything. Within A, tests (A-1) before composition.
B and C are separate review units and MUST NOT be folded into an A commit.

`[gate: DS-001]` marks work that cannot start until the Storybook discovery gate
is resolved (plan section 2).

---

## G - Gate

### G-1. Resolve the Storybook MCP discovery gate
**Blocks**: A-2, A-3, A-4, B-1
**Completed with the live Codex Storybook MCP.**

`docs-list` and `docs-show` confirmed the six-component pilot and the Contact
capability gap. The result is recorded in `design-system/storybook-mcp.md`.

- **Verify**: `docs-list` returns a catalog in the implementing session, OR a
  pasted transcript of it exists in this task, OR the fallback is recorded.
- **Pass**: the choice is written down before any component decision is made.

### G-2. Record the discovery outcome and the capability gap
**Depends on**: G-1

Run `docs-list` / `docs-show` / `docs-show-story` for `ActionLink`, `IconButton`,
`Divider`, `ContactCard`. The pilot slice covers none of them, so the expected
outcome is a documented gap, not a reuse decision.

- **Verify**: DS-003 note appended to `design-system/storybook-mcp.md` naming
  which contact-rail candidates are absent from the catalog.
- **Pass**: the note exists and DS-004 is answered explicitly - compose, do not
  create a global component.

---

## A - Contact page (feature-local)

### A-1. Targeted tests, written first
**Depends on**: none. Start here; it needs no component decision.

Cover, per planning constraint 4:
- copy success -> `copied` state and announcement
- copy failure (clipboard absent, and `writeText` rejecting) -> `failed`, no navigation
- stale-result guard: a resolved copy after reset does not revive `copied`
- `mailto:canhtran210699@gmail.com` and `tel:+84963452909` exactly
- location renders as text with no anchor and no control
- reasons section removed: no three-column `A few helpful reasons` block
- exactly one `h1`; heading levels do not skip
- accessible name of the email action is the full address

- **Verify**: `rtk yarn test src/features/contact`
- **Pass**: every test fails for the right reason before A-3, and passes after.

### A-2. Promote the copy-state reducer to a shared module `[gate: DS-001]`
**Depends on**: G-1
**Shared-code change - review separately from the page composition.**

Move `CopyStatus`, `CopyState`, `copyState`, `idleCopyState`, `copyLabel` out of
`src/design-system/patterns/reader/code.logic.ts` into a domain-neutral module;
re-export from the old path so `CodeBlock` and `ShareAction` are untouched.

- **Verify**: `rtk yarn test src/design-system/patterns/reader` unchanged and green;
  `rtk yarn tsc --noEmit`; no call-site edits in `CodeBlock.tsx` / `ShareAction.tsx`.
- **Pass**: one reducer exists in the tree, reachable from both domains, and
  Contact does not import from `patterns/reader`.

### A-3. Compose the Editorial Letter layout `[gate: DS-001]`
**Depends on**: A-1, A-2

Asymmetric two-column at desktop (VR-001): invitation left, contact rail right,
at most one subtle divider. Approved content contract verbatim. Rail is a
feature-owned composition in `src/features/contact/components/`.

- **Verify**: browser at 1440 - invitation column, rail, one cobalt primary
  action, restrained lime mark, no reason-card grid (SC-003).
- **Pass**: VR-001..VR-006 hold and no raw color/spacing/radius/shadow/type/motion
  value is introduced (VR-006).

### A-4. Email value, copy control, and the break rule `[gate: DS-001]`
**Depends on**: A-3

The email must not break inside `gmail.com` (RR-003). Reproduced today at 320 as
`canhtran210699@gmail.c` / `om`, caused by the global `overflow-wrap: anywhere`
guard. Fix locally on this value - opt out of the guard and give one intentional
break opportunity after `@`. Do not change the global guard.

- **Verify**: at 320, measure the rendered break position; assert the first line
  ends at `@` or the address is unbroken.
- **Pass**: no break inside the domain at any of the five widths, accessible name
  is still the full address, and the copy control is >= 44x44.

### A-5. Copy state, live region, reduced motion
**Depends on**: A-4

Idle / busy / success / failure, announced through a `role="status"` region that
does not steal focus (FR-003, FR-004, AR-003, AR-006).

- **Verify**: A-1 tests pass; keyboard check that focus stays on the control.
- **Pass**: success and failure are both visible and announced; neither relies on
  color or icon alone.

### A-6. Secondary rows
**Depends on**: A-3

Phone and location as quiet rows with aligned label, value, icon, divider
(VR-004). Location is text, no invented link (FR-006).

- **Pass**: lower emphasis does not rely on color alone (US3 AC3).

### A-7. Narrow-width reflow
**Depends on**: A-3

Single stack in order: invitation, topics, email, phone, location (RR-002).

- **Verify**: 320, 375, 768 - reading order matches; no horizontal overflow; also
  at 200% zoom on desktop (RR-005).

### A-8. Contact documentation
**Depends on**: A-3

Rewrite `design-system/pages/contact.md` - its form-shell, form-control,
`ContactInfoCard` and `ContactPromptCard` guidance is stale (DOC-001). Update
`design-system/component-inventory.md` if ownership changed (DOC-002). Do not
touch `specs/004-redesign-contact-direct/spec.md` (DOC-003).

- **Pass**: no instruction to build a form or the obsolete card composition remains.

### A-9. Measure VR-009 and decide whether workstream C opens
**Depends on**: A-3..A-7

Measure the composed page at 1440x1024.

- **Verify**: does the main contact experience, including the start of the footer,
  fit the viewport?
- **Pass**: either it fits and C stays closed, or the measured shortfall is
  recorded and C opens with that number as its justification.

---

## B - Shared Navbar (every route)

### B-1. Fix `Sign in` wrapping at 320 `[gate: DS-001]`
**Independent of A. Separate commit. Shared-shell risk: HIGH.**

Measured today: `Sign in` renders on 2 lines in a 66x44 box at 320.

Try in order, stopping at the first that works (plan section 4):
1. brand mark drops to icon-only below `sm`
2. one step less header inline padding at the narrowest width
3. `Sign in` moves into the expanded menu - IA change, needs its own review

- **Verify**: 320x800 - single line, no control overlapping or clipped, every
  header control >= 44x44 (SC-001).
- **Pass**: option used is recorded, with why the earlier options were insufficient.

### B-2. Header brand link width
**Depends on**: B-1

Measured 32x44 - short on width against the 44px contract (RR-006). Not named in
the spec; found while reproducing.

- **Pass**: >= 44x44, or a written reason it is exempt.

### B-3. Shell regression check
**Depends on**: B-1, B-2

- **Verify**: header renders correctly on a public route, a reader route, and a
  protected route, at 320 / 768 / 1440, both themes; mobile menu opens, closes on
  trigger, on item select, and on Escape, with predictable focus (US4 AC5).
- **Pass**: no route regressed; existing shell tests green.

---

## C - Shared Footer (CONDITIONAL - do not start unless A-9 opens it)

### C-1. Footer adjustment for VR-009
**Depends on**: A-9 proving a shortfall.

- **Pass**: the change is separately identified, justified by A-9's measurement,
  and regression-checked on public, reader and protected routes.

---

## Final gate

### Z-1. Full validation
**Depends on**: all A, B, and C if opened

- **Verify**: `rtk yarn test`, `rtk yarn tsc --noEmit`, `rtk yarn lint`,
  `rtk yarn format`, `yarn coverage:design-system`, `rtk yarn build` (SC-008).
- **Pass**: all exit 0.

### Z-2. Visual and keyboard verification
**Depends on**: Z-1

- **Verify**: the plan's section 6 matrix - 5 widths x 2 themes, plus the keyboard
  traversal in SC-007 and the exact 320px reproduction in SC-001.
- **Pass**: SC-001..SC-007 each have a recorded measurement, not an assertion.

### Z-3. Hand back
- No commit or push unless explicitly requested (planning constraint 6).
- Unrelated worktree changes preserved - another session owns `.storybook/**` and
  `src/design-system/stories/**`; commits list files explicitly rather than `add -A`.

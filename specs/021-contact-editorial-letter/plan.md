# Implementation Plan: Contact Editorial Letter

**Spec**: `specs/021-contact-editorial-letter/spec.md`
**Status**: Awaiting owner review. No production code changed.
**Branch**: `codex/epic-horizon-blog-dsv2`

## Guides Loaded

Per `AGENTS.md` mandatory reference loading, this plan was written after reading
`docs/agent-guides/workflow.md` (planning and validation policy),
`docs/agent-guides/design-system.md` (UI routing, non-negotiable rules, component
discovery), and `design-system/storybook-mcp.md` (the discovery gate).

## 1. Evidence Gathered Before Planning

Reproduced against the running worktree build at 320x800, so the plan is grounded
in measurement rather than in the spec's prose.

| Spec item | Measured now | Verdict |
| --- | --- | --- |
| SC-001 `Sign in` one line | renders on **2 lines**, box 66x44 | defect confirmed |
| RR-003 email break | breaks after index 22: `canhtran210699@gmail.c` / `om` | defect confirmed, exactly as described |
| RR-005 no horizontal overflow at 320 | `scrollWidth` 320 = `clientWidth` 320 | already passing |
| RR-006 44px targets | header brand link is **32x44** (width short) | new finding, not in the spec |

Two notes the spec could not have known:

- The email break is caused by the global `overflow-wrap: anywhere` guard added in
  `src/theme/horizon.ts` (commit `9e57ce5`). That guard is correct and must stay -
  it is what stops unbreakable strings bursting the layout - so the fix is a local,
  documented opt-out on this one value, not a change to the guard.
- `/contact` was rebuilt earlier in this worktree and no longer matches the spec's
  "Problem Statement" verbatim: the three-column reasons section still exists, but
  the hero is already single-column and the duplicated hero actions are already
  gone. The plan targets the current file, not the version the spec describes.

## 2. Storybook MCP Discovery Gate (DS-001) - BLOCKED

**This gate cannot be executed from this session, and that is a wiring fact, not a
judgement call.**

`.codex/config.toml` registers the catalog for **Codex** clients only:

```toml
[mcp_servers.horizon_storybook]
url = "http://localhost:6006/mcp"
enabled_tools = ["docs-list", "docs-show", "docs-show-story"]
```

No Storybook MCP server is registered for Claude Code, and `docs-list`,
`docs-show` and `docs-show-story` are absent from this session's tool catalog.
DS-001 says the implementing agent MUST use them.

Three ways forward; the owner picks one before implementation starts:

1. **Wire the MCP into Claude Code** (`claude mcp add`, or a project `.mcp.json`
   mirroring the Codex entry), start `yarn storybook`, then the gate runs as written.
   Preferred, because it is what DS-001 asks for.
2. **Run the gate from Codex** and paste the `docs-list` / `docs-show` output into
   this task, so the discovery evidence exists even though a different client
   produced it.
3. **Use the documented fallback.** DS-003 already anticipates a gap: inspect the
   `ContactCard` gallery states in `ui-kit.html` and record the capability gap.
   This is weaker, because the pilot catalog covers only `Button`, `Field`,
   `PostCard`, `MediaFrame`, `ErrorState`, `NavItem` - none of the contact-rail
   candidates - so the gate would return nothing useful for this feature anyway.

**Recommendation: option 1, with option 3 as the recorded fallback.** Note that
even a working gate would not answer the contact-rail question, because the rail's
candidates (`ActionLink`, `Divider`, `ContactCard`) are outside the pilot slice.
That is itself a capability-gap finding worth writing down under DS-003.

Implementation MUST NOT begin on any task marked `[gate: DS-001]` until this is
resolved.

## 3. Component Ownership Decisions

Taken against planning constraint 3 and DS-004 ("prefer composition or a
feature-owned Contact component unless reusable behavior is genuinely missing").

### 3.1 Copy-to-clipboard: promote, do not import across domains

A complete, pure copy-state machine already exists - and it is already generic:

```
src/design-system/patterns/reader/code.logic.ts
  type CopyStatus = 'idle' | 'copying' | 'copied' | 'failed'
  copyState(state, action)          // reducer, ignores stale results
  copyLabel(status, subject = 'code')   // subject is already parameterised
```

`ShareAction.tsx` and `CodeBlock.tsx` both consume it. The `subject` default is
the only thing tying it to code blocks.

Contact importing from `patterns/reader/code.logic` would be exactly the silent
cross-domain coupling the spec's planning constraint 3 forbids. So:

- **Move** the copy-state reducer, its types, and `copyLabel` into a shared,
  domain-neutral module (proposal: `src/design-system/components/actions/copy.logic.ts`).
- **Re-export** from `code.logic.ts` so `CodeBlock` and `ShareAction` keep working
  with no call-site churn and no duplicated reducer.
- Contact consumes the shared module.

This is a refactor of shared code, so it is its own workstream item with its own
regression check, not a side effect of a page change.

### 3.2 Contact rail: feature-owned composition, no new global component

The rail is a **new arrangement of existing primitives**, not new behavior:
`Stack`, `Divider`, `Eyebrow`, `Text`, `ActionLink`, `IconButton`. DS-004 says
prefer composition. The rail lives in `src/features/contact/components/`.

`ContactCard` / `ContactPrompt` (in `patterns/account`) are **retired from this
page** by VR-004 and VR-005. They stay exported for now; DOC-002 covers the
inventory update.

### 3.3 Live region: feature-owned, following the existing precedent

`CodeBlock`, `ShareAction` and `DiagramFrame` each own their own `role="status"`
region. There is no shared announcer primitive. Contact follows the same
precedent rather than inventing one; if a fourth consumer appears, that is the
moment to extract one.

## 4. Workstream Separation

The spec requires shared-shell risk to be explicit. Three separate workstreams,
separately reviewable and separately revertable.

### Workstream A - Contact page (feature-local, no shared-shell risk)

Touches only `src/features/contact/**` and the Contact design docs. Cannot
regress any other route.

Covers FR-001..FR-008, VR-001..VR-009, RR-001..RR-003, RR-005..RR-006,
AR-001..AR-006, DOC-001, DOC-003.

### Workstream B - Shared Navbar at 320px (shared-shell risk: HIGH)

Touches `src/app/layouts/Navbar.tsx`, which renders on **every route**.

Covers RR-004 and SC-001 only. RR-004 explicitly permits either a compact
composition or moving `Sign in` into the expanded menu.

Preferred approach, least invasive first:
1. Let the brand mark drop to its icon-only variant below `sm` (it already has
   `variant="icon"`; the current switch is at `sm`). This is the cheapest width
   saving and touches one prop.
2. If that is not enough at 320, reduce the header's inline padding one step at
   the narrowest width.
3. Only if both fail, move `Sign in` into the mobile menu - this changes
   information architecture on every route and needs its own review.

Note the header brand link measured 32x44 - under the 44px contract on width.
Fixing (1) must not make that worse; it is tracked as its own task.

### Workstream C - Shared Footer (shared-shell risk: HIGH, CONDITIONAL)

The spec permits a footer change **only if planning proves it necessary** for
VR-009 (the page fitting 1440x1024).

**Planning finding: not yet proven.** VR-009 is measured after the Contact
composition lands, because the composition is what changes page height. This
workstream stays closed unless task A-9 measures a fail.

If it opens, it is regression-checked on a public route, a reader route, and a
protected route, per the spec's conditional-scope clause.

## 5. Risks

| Risk | Mitigation |
| --- | --- |
| DS-001 gate unavailable blocks start | Section 2, resolved before any `[gate: DS-001]` task |
| Copy-logic move breaks `CodeBlock` / `ShareAction` | Re-export shim, plus their existing tests run unchanged as the regression check |
| Navbar change regresses every route | Isolated workstream; smallest viable option first; shell render tests |
| Global `overflow-wrap` guard vs RR-003 | Local opt-out on the email value only; guard untouched; assert both in tests |
| Concurrent Storybook work in this worktree | Another session owns `.storybook/**` and `src/design-system/stories/**`; no task here touches those paths, and commits list files explicitly |
| Spec's problem statement partly stale | Section 1; plan targets the current file |

## 6. Verification Matrix

Widths 320, 375, 768, 1024, 1440 (RR-001), each in light and dark (VR-007).

| Check | Where |
| --- | --- |
| `Sign in` single line; no header control under 44px | B |
| Email never breaks inside `gmail.com`; any break is after `@` | A |
| No horizontal overflow; also at 200% zoom on desktop | A, B |
| Stack order invitation, topics, email, phone, location | A |
| Contrast AA for rendered size; focus/boundaries >= 3:1 | A, B |
| Keyboard order: skip link, header, email, copy, phone, footer | A, B |
| Copy success and failure announced, focus not stolen | A |
| `mailto:` / `tel:` / location-as-text semantics | A |
| Reduced motion respected | A |
| Page fits 1440x1024 (decides whether C opens) | A |

Automated where the harness allows: this repo renders with
`renderToStaticMarkup` and has no layout engine in tests, so width, overlap and
contrast are browser-measured, while semantics, content removal and copy-state
transitions are unit-tested.

## 7. Out of Scope

Everything in the spec's Non-Goals, plus: no change to the global
`overflow-wrap` guard, no new shared announcer primitive, no removal of
`ContactCard` / `ContactPrompt` exports, and no commits or pushes unless asked.

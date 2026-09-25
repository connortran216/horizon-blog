# Plan: Dawn, carried

**Spec**: `specs/023-dawn-carried/spec.md`

## Design system layer

| Addition                        | Where                                     | Notes                                                                                                                              |
| ------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `signalRoute.logic.ts`          | `src/design-system/motion`                | projection, stops, timing, line frame; pure                                                                                        |
| `SignalRoute`, `SignalLine`     | `src/design-system/motion`                | route provides the field's anchor context; line reads route progress, or draws on `[data-signal-host]` hover/focus when standalone |
| `gatherTowards`, `focus` prop   | `synapse.logic.ts`, `SynapseField`        | nodes drift towards a unit point, signals prefer it                                                                                |
| `NavTrack`, `navTrack.logic.ts` | `src/design-system/components/navigation` | one travelling indicator; `NavItem` hides its own bar inside a track                                                               |
| `componentTokens.signal`        | `src/theme/tokens/components.ts`          | aliases only: rail, active rail, spark, halo roles; spark size, halo blur                                                          |

## Pages

- **Blog**: hero in a `SignalRoute` (rail under the hero, `order` pace) with a typeset display title;
  results grid three columns; page size 10 so the featured story plus nine cards fill three rows.
- **About**: hero shell becomes `SynapseField` (surface) with thread focus points; headline typeset by
  the field; Signals rules become one `SignalRoute` rail; duplicated chips removed; glow scene and its
  logic removed.
- **Contact**: typeset title with cobalt emphasis; the column divider becomes a vertical `SignalLine`
  in a route whose anchors are the rail's icons, so no content waits on it.
- **Home**: post limit 10 (Signature plus nine).
- **Shell**: desktop nav wrapped in `NavTrack`.
- **PostCard**: standalone `SignalLine` at the cover seam.

## Docs

`DESIGN.md` (Motion, settled About question), `design-system/MASTER.md`, `pages/{blog,about,contact}.md`,
`src/design-system/CONVENTIONS.md` (sanctioned artwork list).

## Validation

Unit tests for every logic module, static-markup render tests for the new components, gallery rows,
full suite, lint, format, typecheck, DS coverage, token export, browser check at 375/1440 both themes.

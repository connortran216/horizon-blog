# Approved Signal design handoff

Approved 2026-09-06; consolidated 2026-09-07. Prototype: /Users/trantuancanh/Personal/work/horizon-blog/prototypes/horizon-uiux

- [Exact 46 tokens](approved-tokens.md) and [machine export](tokens.json)
- [System and all approved motion](design-system.md)
- [26-screen coverage](screen-coverage.md)
- [Prototype QA and limitations](prototype-qa.md)
- [Source hashes](sources.json)

Beads: horizon-prototype-approved-2026-09-06; horizon-design-system-v0.2; horizon-design-motion-approved-v1.

Precedence: final user approval > exact token values and documented motion extensions > approved prototype > older page guidance. Preserve production domain contracts over prototype simulations. Fonts: self-host approved licensed files; no new production package. Legacy bg.secondary/bg.tertiary/text.tertiary names map to surface/subtle/muted.

This is design approval, not production QA approval.

## Status — 2026-09-11

This handoff has been implemented. It is now a **historical record of what was approved**, not a set
of instructions; the living contract is [`DESIGN.md`](../../../DESIGN.md), which takes precedence on
any visual question.

- The 46 tokens are implemented as the typed source in `src/theme/tokens/`, with the 19 approved
  colour roles asserted byte for byte by a test that keeps its own independent copy of this table.
  Twenty further roles were derived for states this handoff did not enumerate — overlays, disabled,
  selection, code, loading, media and status tints — each composited from an approved colour rather
  than introduced as a new pigment.
- The type ramp gained one step this handoff omitted: `sectionTitle` at 25/34 mobile and 28/38
  desktop, taken from the prototype's own `h2` declarations. Without it a section heading rendered
  at the same size as the cards beneath it.
- Fonts are self-hosted from the prototype's own woff2 files under `public/fonts/be-vietnam-pro/`.
  No package was added.
- Approved motion is implemented in `src/design-system/motion/` under one central reduced-motion
  policy.
- The legacy `bg.secondary` / `bg.tertiary` / `text.tertiary` names are **not** aliased onto the new
  roles. v2 lives in a separate Chakra theme that keeps the clean names, while the legacy theme keeps
  its own values untouched, so no shipped page changed appearance. The mapping to surface / subtle /
  muted applies when a page migrates.
- The "first bundle introduces foundations, subsequent bundles replace route overrides" sequencing
  is retired along with route-based theming. See [`../release-plan.md`](../release-plan.md).


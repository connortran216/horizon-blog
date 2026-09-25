# Feature Specification: Dawn, carried

**Feature Branch**: `claude/dawn-across-pages`
**Created**: 2026-09-24
**Status**: Implemented and verified locally
**Input**: Compare Home with Blog, About and Contact, review the UI/UX, and bring the inner pages up to
Home with creative motion designed through the design system. Owner approved the full scope, including
replacing About's glow scene with a synapse panel.

## Review summary

Home speaks one language - _Dawn_, light arriving along a line: a synapse field that writes the
headline, a drawn cobalt rule under the phrase that matters, a field that answers the pointer. Leaving
Home, that language stops:

|          | Home                                 | Blog                          | About                                                | Contact                                      |
| -------- | ------------------------------------ | ----------------------------- | ---------------------------------------------------- | -------------------------------------------- |
| Artwork  | Synapse field writes the copy        | none                          | faint glow pools in a box, nearly invisible in light | none                                         |
| Headline | Bitter display, typeset word by word | body-face `pageTitle`, static | display, static                                      | display, static                              |
| Emphasis | cobalt rule draws itself             | none                          | none                                                 | static lime underline, low contrast on light |
| Entry    | choreographed                        | grid appears at once          | generic reveal                                       | none                                         |

Other defects found:

1. Blog renders results two to a row while Home renders three - the archive, which `pages/blog.md`
   asks to be tighter than Home, is looser.
2. Home's "Keep reading" grid shows eight cards in three columns, leaving an orphan row; Blog would do
   the same at three columns with nine per page.
3. About's hero leaves its right half empty (the scene is too faint to register in light), and the
   three principle chips repeat the three principles printed beside them.
4. Excerpts begin with `1.00` and end in a broken character - a backend defect, tracked separately.

## Decision: _Dawn, carried_

Home's light travels to the other pages along the lines they already have.

- **SignalRoute / SignalLine** (motion primitives). A hairline that draws itself; its leading tip is a
  signal; copy the route owns (`Typeset` words, `SignalTarget`s) is written as the tip passes it. The
  route reuses the field's anchor contract, so the two copy primitives need no new API.
- **SignalLine on a host.** Standalone, a line draws beneath a card's cover when the card is hovered or
  holds focus - a horizon under the picture, replacing nothing, costing no layout.
- **Page titles typeset.** Blog, About and Contact titles use `Typeset` with an emphasis rule in the
  action colour. Blog's title moves to the `display` recipe so every public page title shares a face.
  Contact's lime underline becomes the cobalt rule.
- **NavTrack** (navigation). One indicator for a set of `NavItem`s that travels to the current item
  when the route changes (transform only), with a signal at its tip while it moves. Approved in
  `DESIGN.md` as "sliding nav indication".
- **About synapse band.** The About hero becomes a full-bleed `SynapseField` band with no box (a
  follow-up owner request), under a header without its bar at the top of the page. Its three editorial threads
  are three places on the plate; choosing one draws the network towards it and sends signals there.
  The field writes the About headline the way Home's writes its own.

## Requirements

- **FR-001** Every new primitive is transform/opacity only, cleans up every observer, frame and timer,
  and has its decisions in a tested `*.logic.ts`.
- **FR-002** Under reduced motion lines are drawn, anchors are present, the nav indicator moves without
  travel, and the About field is one still frame.
- **FR-003** Decoration never gates content: every anchor appears by the route's fallback, and a route
  whose line is not laid out (a divider hidden at this width) writes its anchors at once.
- **FR-004** No new colour roles and no new dependencies. Token additions are component aliases only.
- **FR-005** Every new barrel export has a gallery registry row and an entry.
- **FR-006** Assistive technology output is unchanged: one `h1` per page, `aria-current` still drives
  the current nav item, typeset headlines are read once, whole.
- **FR-007** Blog and Home grids render three columns at the grid breakpoint with no orphan row on a
  full page; About drops the duplicated chips.

## Acceptance

- `yarn vitest run`, `yarn lint`, `yarn prettier --check`, `yarn tsc --noEmit`,
  `yarn coverage:design-system` and `yarn tokens:export` pass.
- Blog, About and Contact render correctly at 375 and 1440 in both themes, with and without reduced
  motion, with no console errors.

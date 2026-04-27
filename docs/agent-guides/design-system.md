# Design System Agent Guide

This guide only tells agents how to use the canonical design-system docs. The source of truth is `design-system/MASTER.md`; do not duplicate or override it here.

## Read Order

Before changing UI, layout, theme usage, reusable components, or page composition:

1. Read `design-system/MASTER.md` for foundations, product direction, tokens, surface model, governance, anti-patterns, and UI definition of done.
2. Read `design-system/components/README.md` when touching shared components or deciding shared vs feature-owned UI.
3. Read `design-system/pages/README.md` when touching route-level UI.
4. Read the matching page-family doc when applicable:
   - Home: `design-system/pages/home.md`
   - Blog index/discovery: `design-system/pages/blog.md`
   - Blog reader/detail surfaces: `design-system/pages/reader.md`
   - Author archive: `design-system/pages/author-archive.md`
   - Auth pages: `design-system/pages/auth.md`
   - Editor: `design-system/pages/editor.md`
   - Profile and owner blog management: `design-system/pages/profile.md`
   - About: `design-system/pages/about.md`
   - Contact: `design-system/pages/contact.md`
   - CV: `design-system/pages/cv.md`

Override order is:

1. `design-system/MASTER.md`
2. Matching page-family or component doc
3. Implementation in `src/theme/`, `src/app/layouts/`, `src/components/`, and `src/features/`

## Non-Negotiable Rules From MASTER

- Horizon is a personal blog, not an archive product, notebook product, or dashboard-heavy publishing SaaS.
- UI should support comfortable reading and confident publishing above all else.
- Tone should be thoughtful, calm, modern, editorial, and personal rather than corporate.
- Use semantic tokens before raw palette values.
- `action.*` is for interaction; `accent.*` is for atmosphere. Purple should not become the default button/control fill.
- One visual surface should own its border, halo, and glow. Avoid fake nested borders and clipped inner glows.
- Public blog cards do not need a `published` badge; draft status belongs in owner/profile/editor contexts.
- Prefer `blog`, `blogs`, `writing`, `read`, and `write` in user-facing copy. Avoid public-facing `post`, `posts`, archive-product, and notebook-product language.
- Reading surfaces should be calm and almost static once loaded; motion must respect reduced-motion preferences.
- New route layouts should map to a documented shell concept before inventing a new layout.

## Token Model

Implemented semantic tokens live in `src/theme/index.ts`. Use semantic tokens first; only add or change tokens when a repeated visual role appears across places or interaction/decorative roles are getting mixed.

### Surface Tokens

- `bg.page`: route canvas and quiet inset surfaces.
- `bg.secondary`: standard panels, cards, and everyday content blocks.
- `bg.tertiary`: muted chips, hover states, and inset contrast.
- `bg.elevated`: menus, modals, popovers, and overlay surfaces.
- `bg.glass`: premium hero shells and editorial glass panels only.
- `border.default`: standard card/input border.
- `border.subtle`: quiet separators and low-emphasis framing.

### Text Tokens

- `text.primary`: headlines, body text, key labels.
- `text.secondary`: supporting copy and secondary labels.
- `text.tertiary`: metadata, helper text, placeholders.
- Public metadata order should stay author, date, reading time.

### Action, Accent, Link, Loading

- `action.primary`, `action.hover`, `action.active`: primary interactive controls and CTA emphasis.
- `action.subtle`: active/hover backing for subtle controls.
- `action.glow`: blue-slate glow behind major action shells and loading signals.
- `accent.primary`, `accent.hover`, `accent.glow`: decorative atmosphere, rare emphasis chips, fallback-cover atmosphere, and halos.
- `link.default`, `link.hover`: inline prose links. CTA-like links may use `action.primary`.
- `loading.base`, `loading.highlight`, `loading.track`, `loading.stroke`, `loading.glow`: skeletons and shared loading surfaces.

### Token Decisions

- Buttons, navbar actions, profile actions, CTA links, reader progress accents, and About icons use `action.*`, not purple accent defaults.
- Purple via `accent.*` is rare and decorative. It should not become the default solid button/control fill.
- A premium shell may use `bg.glass`, `border.subtle`, and one controlled halo. Do not stack competing glows.
- Standard cards and panels should usually use `bg.secondary` plus `border.subtle` or `border.default`.
- Inset panels should use `bg.page` or `bg.tertiary` with subtle borders.
- Whole-page or blocked-panel loading should use `LoadingState`; content-shaped placeholders should use `ShimmerLoader`.

## Page-Specific Token Notes

- Home: one premium hero shell is acceptable; real blog preview content should dominate decorative layers.
- Blog index: tighter and more utilitarian than home; search is the utility focus; no redundant `published` badges.
- Reader: loose editorial shell, stable prose width, no nested boxed-card reading layout, nearly static after load.
- Author archive: quiet scan-first list, ambient halo behind the author rail only, no owner-management styling.
- Auth: one calm form card, no loud promotional side content, minimal motion.
- Editor: writing surface dominates; no decorative motion near cursor/editor flow.
- Profile: one dominant profile header shell; owner controls use action tokens; draft/live distinction cannot rely on color alone.
- CV: document-like flow; no glass, chip clouds, decorative stat blocks, notes sidebar, or card-heavy resume layout.
- About/Contact: calm editorial cards; icons and actions use action family; no dashboard or sales tone.

## Implementation Mapping

- Theme tokens and component variants: `src/theme/index.ts`
- App shell and chrome: `src/app/layouts/`
- Shared components: `src/components/`
- Feature-owned UI: `src/features/<feature>/components`
- Feature pages: `src/features/<feature>/pages`

Design docs follow the feature-first implementation shape. Do not document or reason as if `src/pages/` owns the UI.

## When To Update `design-system/`

Update canonical design docs when:

- A semantic token is added or its meaning changes.
- A reusable component family is introduced.
- A route family changes information architecture.
- System-level copy conventions change.
- A repeated UI pattern becomes a shared design rule.

Do not add design-system docs for one-off color, spacing, or animation experiments.

## Validation For UI Work

A UI change is not done until:

- The relevant design-system docs were consulted.
- Code uses the right semantic tokens.
- The route matches feature-first structure.
- Light and dark modes are considered.
- Reduced-motion behavior is considered when motion exists.
- Design-system docs are updated when reusable rules changed.

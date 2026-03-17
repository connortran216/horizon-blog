# Horizon Blog Design System

This directory is the canonical source of truth for the Horizon Blog design system.

Implementation still lives in:
- `src/theme/index.ts` for tokens and Chakra overrides
- `src/components/` for reusable UI
- `src/pages/` for route composition

The legacy root file `DESIGN_SYSTEM.md` is now a compatibility index that points here.

## Document Map

- `MASTER.md`: foundations, governance, and system-wide rules
- `components/README.md`: shared component recipes and ownership
- `pages/README.md`: page-level override model
- `pages/home.md`: landing page rules
- `pages/blog.md`: blog listing and discovery rules
- `pages/auth.md`: login, register, forgot-password, reset-password rules
- `pages/editor.md`: writing and editing experience rules
- `pages/reader.md`: article detail and profile detail reading rules

## Product Intent

Horizon Blog is a reading-first, writing-first product. The interface should feel:
- calm
- literary
- structured
- accessible
- understated rather than flashy

The current implementation already carries an Obsidian-inspired visual language. Keep that foundation, but use it with more editorial restraint:
- fewer decorative effects
- stronger typography hierarchy
- consistent surfaces
- more disciplined page layouts

## Core Principles

### 1. Content First

- Reading and writing are the primary product actions.
- Visual decoration must not compete with article titles, metadata, or prose.
- Search, browse, and author actions should always be easy to locate.

### 2. Token First

- Prefer semantic tokens over raw color values.
- Prefer Chakra component variants over page-level one-off styling.
- Do not introduce hardcoded page colors when a theme role already exists.

### 3. Composable UI

- Build from small shared recipes.
- Keep page files focused on composition, not design invention.
- Promote repeated UI into shared components once it appears twice.

### 4. Accessible by Default

- Focus states must remain visible.
- Light-mode contrast must stay strong.
- Motion should support `prefers-reduced-motion`.
- Hover should never be the only affordance.

### 5. Consistency Over Novelty

- Home, blog listing, reader, and auth should feel related.
- Experimental effects are allowed only when they support narrative or feedback.
- Reuse spacing, radii, line lengths, and metadata patterns across pages.

## Brand Direction

### Experience

- Base tone: thoughtful editorial product
- Mood: modern notebook meets literary magazine
- Primary interaction style: quiet, confident, responsive

### Visual Language

- Use the existing Obsidian-inspired surfaces as the base.
- Keep accent usage selective; accent color is for action, focus, and small highlights.
- Prefer clean sections, subtle borders, and readable long-form rhythm over heavy gradients and glass effects.

## Foundations

### Color Roles

Current implemented semantic roles in `src/theme/index.ts`:
- `bg.page`
- `bg.secondary`
- `bg.tertiary`
- `bg.elevated`
- `border.default`
- `border.subtle`
- `text.primary`
- `text.secondary`
- `text.tertiary`
- `accent.primary`
- `accent.hover`
- `link.default`
- `link.hover`

Approved usage:
- `bg.page`: page canvas
- `bg.secondary`: cards, panels, secondary sections
- `bg.tertiary`: hover, muted highlights, subtle tag backgrounds
- `bg.elevated`: menus, modals, overlays
- `border.default`: input and card borders
- `border.subtle`: separators and quiet dividers
- `text.primary`: headings, body, primary labels
- `text.secondary`: supporting copy
- `text.tertiary`: metadata and placeholders
- `accent.primary`: primary CTA, selected state, active emphasis
- `link.default`: inline links and navigation links

Next approved token expansion for future implementation:
- `surface.panel`
- `surface.panelMuted`
- `feedback.success`
- `feedback.warning`
- `feedback.error`
- `focus.ring`

Do not add new page-level hex values before checking whether a missing role should become a semantic token instead.

### Typography

Current theme implementation:
- Heading: Inter
- Body: Inter
- Mono: Monaco, Menlo, Ubuntu Mono

System rule:
- UI typography stays sans-serif and neutral.
- Prose typography and hero display may become more editorial later, but only through deliberate theme-level adoption.
- Do not hardcode page-specific font families for one screen unless the design system explicitly allows it.

Typography scale guidance:
- Hero display: `5xl` to `8xl`
- Page heading: `3xl` to `5xl`
- Section heading: `xl` to `2xl`
- Card title: `lg` to `xl`
- Body: `md`
- Metadata: `sm` or `xs`

Readable defaults:
- Body line height: `base` or `tall`
- Long-form prose line length target: 65 to 75 characters
- Avoid dense text blocks without section spacing

### Spacing

Spacing should follow deliberate rhythm:
- Tight cluster: `2` to `3`
- Default stack: `4` to `6`
- Section stack: `8` to `12`
- Page section spacing: `16` to `24`

Rules:
- Use the same section spacing language across Home, Blog, and About.
- Cards should not mix unrelated padding values unless the size difference is intentional.

### Radius and Shadow

Current theme already defines soft radii and subtle shadows.

Rules:
- Default interactive card radius: `lg` or `xl`
- Forms and content panels: `xl`
- Pills and tags: `full`
- Avoid mixing sharp and very rounded surfaces on the same screen

Shadow usage:
- `sm` for resting cards
- `md` for hover or elevated surfaces
- `lg` only for overlays and strong separation

### Motion

Motion exists to communicate:
- entry
- state change
- async feedback

Rules:
- Default duration range: 0.2s to 0.3s
- Use scale sparingly; do not make cards feel unstable
- Infinite decorative animations should be avoided
- Parallax and particle effects are optional accents, not default page behavior

## Layout System

The current global layout wraps every page in the same `container.xl` shell. That is acceptable for now, but the design system should distinguish between layout intents:

- `AppShell`: global navbar + footer + default content bounds
- `MarketingSection`: optional full-bleed or wide content section
- `ReadingContainer`: narrower prose width
- `FormShell`: centered auth and contact forms
- `EditorShell`: wide authoring workspace with strong focus on input areas

Implementation note:
- These are design-system layout concepts first.
- They do not all need to exist as code immediately, but new page work should align to them.

## Component Recipes

Shared recipes that should define most of the UI:

- `PageHeader`
- `SectionHeader`
- `ArticleListItem`
- `ArticleCard`
- `AuthorMeta`
- `TagPill`
- `SearchBar`
- `StatusBadge`
- `FormCard`
- `EmptyState`
- `LoadingState`
- `ContentProse`

Ownership rules:
- Reusable building blocks belong in `src/components/`
- Feature-specific composites belong in `src/features/<feature>/components/`
- Theme styles belong in `src/theme/index.ts`

## Current Drift To Reduce

These patterns should be removed over time:
- hardcoded page hex colors when semantic tokens already cover the role
- page-local font family overrides for one-off editorial styling
- ad hoc gradients unrelated to the established palette
- heavy glassmorphism on content-first surfaces
- repeating auth and form layouts without a shared shell

## Page Pattern Rules

Detailed rules live under `pages/`.

System-wide page expectations:
- Every page should declare a clear primary action.
- Hero sections should not invent a new spacing system.
- Article previews should use one consistent metadata pattern.
- Empty states should guide the next action.
- Search and discovery UI should feel shared between Home and Blog.

## Content Rules

### Titles

- Prioritize readable line breaks over maximum density.
- Card titles should clamp consistently.
- Avoid mixing title treatments between Home and Blog unless intentional and documented.

### Metadata

- Author, date, and reading time should follow one shared order.
- Metadata style should use `text.secondary` or `text.tertiary`.
- Badges and tags should not overpower article titles.

### Excerpts

- Keep excerpts concise and scannable.
- Preserve enough whitespace so cards do not become dense blocks.

## Governance

### Non-Negotiable Rules

- No hardcoded hex values in page files when a semantic token exists.
- No new reusable component without documenting its role here or in `components/README.md`.
- No new page pattern without checking `pages/README.md`.
- Reusable design changes should update docs and implementation together.

### Review Checklist

- Does the UI use semantic tokens instead of raw values?
- Does the page align with an existing page pattern?
- Are focus, hover, and active states visible?
- Is the text hierarchy obvious in under 3 seconds?
- Is motion supportive rather than decorative?
- Would the same component feel at home on another page?

## Migration Priorities

### Priority 1

- Standardize auth pages with a shared `FormCard` and `FormShell`
- Remove undefined or undocumented surface tokens
- Reduce page-level color drift on Home, Blog, and Contact

### Priority 2

- Unify article preview UI between Home and Blog
- Add shared content-prose styles for reader and editor previews
- Formalize layout primitives for full-bleed vs bounded sections

### Priority 3

- Expand token set for feedback, focus, and panel roles
- Introduce stronger page-specific documentation for About and Profile
- Decide whether editorial display typography should become a first-class theme concern

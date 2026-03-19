# Horizon Blog Design System

This folder is the canonical source of truth for Horizon Blog UI rules.

Use this documentation before changing:
- `src/theme/index.ts`
- `src/app/layouts/`
- `src/components/`
- `src/features/*/components`
- `src/features/*/pages`

Implementation lives in code. This folder defines the intent, language, and constraints that code should follow.

## Document Map

- `MASTER.md`: foundations, governance, and system-wide rules
- `components/README.md`: shared component recipes and ownership
- `pages/README.md`: page-family overrides and route guidance
- `pages/home.md`: landing page rules
- `pages/blog.md`: blog index and discovery rules
- `pages/auth.md`: login, register, forgot-password, reset-password rules
- `pages/editor.md`: writing and editing rules
- `pages/reader.md`: public and profile blog reading rules
- `pages/author-archive.md`: public author archive rules
- `pages/about.md`: about page rules
- `pages/contact.md`: contact page rules
- `pages/profile.md`: author profile rules

## Product Definition

Horizon is a personal blog.

It is not:
- an archive product
- a notebook product
- a dashboard-heavy publishing SaaS

The UI should support two things above all else:
- reading blogs comfortably
- publishing blogs confidently

The visual system should feel:
- thoughtful
- calm
- modern
- editorial
- personal rather than corporate

## Implementation Map

The design system is implemented across these layers:

- `src/theme/index.ts`: Chakra semantic tokens and component variants
- `src/app/layouts/`: app shell, navbar, footer, nav actions
- `src/components/`: shared motion, reader, editor, pagination, and route utilities
- `src/features/home/`: landing page compositions
- `src/features/blog/`: blog index and blog detail compositions
- `src/features/authors/`: public author archive composition
- `src/features/auth/`: auth shells and auth routes
- `src/features/about/`: about page compositions
- `src/features/contact/`: contact page compositions
- `src/features/profile/`: author profile and owner-only blog management surfaces
- `src/features/media/`: fallback cover and media display logic
- `src/features/editor/`: editor workspace and authoring flow

Design docs must follow the feature-first implementation shape. Do not document the app as if `src/pages/` still owns the UI.

## Brand Direction

### Tone

- blog-first, not product-marketing-first
- restrained, not flashy
- designed, not decorative
- credible, not startup-generic

### Visual Language

- dark/light dual-mode editorial UI
- soft glass and halo treatments only when they improve depth
- restrained blue-slate actions
- purple reserved for limited decorative accent use, not primary controls
- generous spacing and clean reading rhythm

### Content Language

User-facing copy should prefer:
- `blog`
- `blogs`
- `writing`
- `read`
- `write`

Avoid on public-facing surfaces:
- `post`
- `posts`
- `archive product`
- `notebook product`

Status language:
- public routes should not label every visible blog as `published`
- draft status only matters in owner/profile/editor contexts

## Core Principles

### 1. Reading Comes First

- Long-form content is the most important surface in the product.
- Card design, motion, and decorative effects must never overpower titles, excerpts, or prose.
- Reading comfort is more important than novelty.

### 2. Token First, Not Hex First

- Use semantic tokens before raw palette values.
- Extend `src/theme/index.ts` when a visual role is missing.
- Avoid hardcoded page colors unless a one-off art treatment is explicitly documented here.

### 3. One Surface, One Owner

- The same element should own a card's border, halo, and glow.
- Do not split one visual surface across nested wrappers unless strictly necessary.
- Avoid inner clipping containers that create fake second borders or hard glow cutoffs.

### 4. Component Composition Over Page Invention

- Repeated UI belongs in shared or feature-owned components.
- Page files should orchestrate layout and data, not carry large blocks of custom UI markup.
- If a pattern appears twice, extract it.

### 5. Accessible By Default

- Focus states must remain visible in both color modes.
- Hover cannot be the only cue for clickability.
- Motion must respect reduced-motion preferences.
- Decorative contrast must never weaken text readability.

### 6. Consistency Over Cleverness

- Home, Blog, Reader, About, Contact, and Profile should feel like one product.
- Shared metadata patterns should stay shared.
- Search, CTA, card, and prose systems should not drift route by route.

## Foundations

### Color System

Current implemented semantic tokens in `src/theme/index.ts`:

#### Backgrounds

- `bg.page`
- `bg.secondary`
- `bg.tertiary`
- `bg.elevated`
- `bg.glass`

Usage:
- `bg.page`: root page canvas
- `bg.secondary`: standard panels and cards
- `bg.tertiary`: muted chips, hover states, inset contrast
- `bg.elevated`: overlays, menus, popovers, modal surfaces
- `bg.glass`: premium hero shells and editorial glass panels

#### Borders

- `border.default`
- `border.subtle`

Usage:
- `border.default`: standard card and input border
- `border.subtle`: quiet separators and low-emphasis framing

#### Text

- `text.primary`
- `text.secondary`
- `text.tertiary`

Usage:
- `text.primary`: headlines, body, key labels
- `text.secondary`: supporting copy
- `text.tertiary`: metadata, helper text, placeholders

#### Accent

- `accent.primary`
- `accent.hover`
- `accent.glow`

Rule:
- `accent.*` is decorative or occasional emphasis
- do not use `accent.primary` as the default solid button fill

Typical uses:
- decorative halos
- selected cosmetic accents
- rare emphasis chips when intentional
- internal fallback-cover atmosphere

#### Action

- `action.primary`
- `action.hover`
- `action.active`
- `action.subtle`
- `action.glow`

Rule:
- `action.*` is the interactive system
- buttons, action links, focus-adjacent UI, and CTA emphasis should use action tokens first

Typical uses:
- primary buttons
- outline buttons
- CTA links
- subtle active surfaces
- blue-slate glow behind major action shells

#### Links

- `link.default`
- `link.hover`

Rule:
- inline text links use link tokens
- CTA-style links may use `action.primary` when they are acting like actions rather than prose links

### Action vs Accent Rule

This distinction must stay explicit:

- `action.*` = interaction
- `accent.*` = atmosphere

If a purple control appears, it should be intentional and rare. Standard controls should stay in the blue-slate action family.

### Typography

Current theme implementation:
- heading: `Inter`
- body: `Inter`
- mono: `Monaco`, `Menlo`, `Ubuntu Mono`

System rules:
- keep UI typography neutral and highly readable
- let scale, weight, spacing, and layout provide personality before changing fonts
- do not introduce one-off page font families without an explicit system decision

Recommended hierarchy:
- hero display: `5xl` to `7xl`
- page title: `3xl` to `5xl`
- section title: `xl` to `2xl`
- card title: `lg` to `2xl`
- body: `md` to `lg`
- metadata: `xs` to `sm`

Typography behavior:
- use tight tracking on major hero headlines
- use uppercased metadata labels sparingly
- prefer readable line breaks over maximum headline density

### Spacing

Use a deliberate editorial rhythm:

- tight cluster: `2` to `3`
- standard stack: `4` to `6`
- section stack: `8` to `12`
- large section separation: `16` to `24`

Rules:
- keep one spacing language across public pages
- avoid random `7`, `11`, `13` spacing unless truly required
- cards with similar roles should share padding values

### Radius

Default guidance:
- pills and chips: `full`
- standard cards: `xl`
- premium hero shells: `2xl` or `3xl`
- menus and overlays: `xl`

Rules:
- avoid mixing sharp geometry with very soft geometry on the same screen
- roundness should feel deliberate, not arbitrary

### Shadow and Halo

Use depth sparingly.

Default behavior:
- resting card: subtle border plus soft shadow
- hover card: slightly stronger shadow, not dramatic lift
- premium shell: one soft halo, not multiple competing glows

Rules:
- halos should fade into the outer surface cleanly
- never mount a glow in a smaller inner wrapper if the border lives on the outer card
- avoid strong top-edge chrome lines unless intentional

### Motion

Motion exists for:
- page entry
- hover feedback
- async state change
- decorative atmosphere when it is subtle and optional

Rules:
- default duration: 150ms to 300ms for interaction
- use opacity and transform before layout-changing animation
- no important information should rely on continuous motion
- fallback covers and decorative particles must respect reduced motion
- reading surfaces should be almost static once loaded

## Surface Model

Use these surface roles consistently.

### 1. Page Canvas

- full route background
- usually `bg.page`
- may include a soft halo wash in one corner

### 2. Glass Hero Shell

- large framing shell for a premium section
- use `bg.glass`
- use subtle border and one controlled halo
- applies to hero sections, not all cards

### 3. Standard Panel

- everyday card or content block
- use `bg.secondary`
- border: `border.subtle` or `border.default`

### 4. Inset Panel

- quieter nested content inside a larger shell
- use `bg.page` or `bg.tertiary`
- keep borders subtle

### 5. Decorative Cover

- visual entry point for a blog card or featured blog
- purely decorative
- must not duplicate the blog title or status too heavily
- motion should be ambient, never distracting

## Layout Concepts

These are design-system concepts that the implementation should map to:

- `AppShell`: navbar + footer + shared route framing
- `HeroShell`: large premium entry section
- `DiscoveryShell`: search + listing + pagination surfaces
- `ReadingShell`: looser editorial frame for blog detail
- `FormShell`: centered auth/contact composition
- `EditorShell`: wide, focused authoring workspace
- `ProfileShell`: author identity + owned writing management

Map new work to one of these shells before inventing a new layout.

## Page Families

### Public

- Home
- Blog
- Author archive
- Blog detail
- About
- Contact

### Auth

- Login
- Register
- Forgot password
- Reset password

### Protected Author

- Blog editor
- Profile
- Profile blog detail

Each family may refine the global system, but it should not break it.

## Component Families

Detailed component guidance lives in `components/README.md`.

At the system level, the key families are:

- app shell: navbar, footer, layout
- motion primitives: animated buttons, animated cards, motion wrappers
- blog discovery: hero, featured card, editorial card, story card
- reading: reader frame, prose renderer
- auth: auth shell
- profile: profile header, profile blog list/grid, profile section controls
- media: fallback blog cover system

## Content Rules

### Blogs and Metadata

- public blog cards do not need a `published` badge
- draft indicators belong in owner-only contexts
- metadata order should stay stable across preview surfaces
- author/date/reading-time should remain visually secondary to the title

### Headlines

- keep them punchy and readable
- avoid product-slogan language on editorial surfaces
- prefer blog and writing language over archive/notebook language

### Excerpts

- excerpts should be plain readable text
- no raw HTML leakage
- clamp consistently by surface type

### Empty States

- explain what is missing
- suggest the next real action
- keep copy short and helpful

## Accessibility Rules

- color-mode switching must preserve contrast on every major surface
- visible focus treatment is mandatory
- CTA rows must remain understandable on mobile
- search inputs need strong accessible names
- hover overlays on avatars/cards must stay clipped to the intended target
- decorative motion must respect `prefers-reduced-motion`

## Governance

### When To Add A Token

Add or expand semantic tokens when:
- the same visual role appears in multiple places
- a page is reaching for repeated one-off RGBA values
- interaction and decorative color roles are getting mixed

Do not add tokens for single-use visual experiments.

### When To Extract A Component

Extract a component when:
- the same structure appears twice
- a page file is becoming layout plus design plus behavior
- the same copy and metadata structure is repeated

### When To Update Docs

Update `design-system/` whenever:
- a new semantic token is added
- a reusable component family is introduced
- a route family changes its information architecture
- copy conventions change at a system level

## Anti-Patterns

- page files acting as giant component files
- hardcoded light-only surfaces in dark mode
- purple as the default button fill
- decorative glows mounted inside smaller clipping wrappers
- repeated hero copy that says the same thing three times
- duplicated blog title inside both cover art and content body
- public blog cards labeled `published` everywhere
- copy that treats the product like an archive or notebook system instead of a blog

## Definition Of Done For UI Work

A UI change is not done until:
- the code uses the right semantic tokens
- the route matches the feature-first structure
- the design-system docs reflect the new reusable rules
- light and dark mode both hold up
- reduced-motion behavior is considered when motion exists

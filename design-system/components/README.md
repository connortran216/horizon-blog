# Component Recipes

This file defines the reusable component system for Horizon Blog.

Use this document to decide:
- what should stay shared
- what should stay feature-owned
- how repeated UI should behave visually

## Ownership Model

### Shared App Shell

Lives in:
- `src/app/layouts/`
- compatibility re-exports may still exist in `src/components/layout/`

Includes:
- `AppLayout`
- `Navbar`
- `Footer`
- `NavLinkButton`
- `UserMenu`

Rules:
- navigation should stay consistent across public and protected routes
- navbar actions should use the action token family
- shell chrome should not compete with content

### Shared Core Components

Lives in:
- `src/components/`

Includes:
- `ProtectedRoute`
- `Pagination`
- `PaginationControls`
- reader and editor primitives
- animation primitives

Use shared components when the UI is not tied to one domain concept.

### Feature Components

Lives in:
- `src/features/<feature>/components`

Use feature ownership when the component understands the domain:
- blog cards
- blog hero
- profile header
- auth shell
- contact cards
- about stat cards

## Shared Visual Primitives

### AnimatedCard

Implementation:
- `src/components/core/animations/AnimatedCard.tsx`

Purpose:
- base interactive or premium card surface

Rules:
- one card surface should own its border, shadow, and halo
- prefer subtle hover feedback
- allow per-surface overrides when a page needs calmer chrome
- do not create fake nested borders unless intentionally documented

### AnimatedButton

Implementation:
- `src/components/core/animations/AnimatedButton.tsx`

Purpose:
- expressive CTA wrapper over the Chakra button system

Rules:
- primary fill uses `action.*`
- use purple accent only for rare decorative emphasis, not default action styling
- button sizing should feel calm and premium, not oversized by default

### MotionWrapper

Implementation:
- `src/components/core/animations/MotionWrapper.tsx`

Purpose:
- standardized reveal and motion orchestration

Rules:
- prefer opacity and translate
- avoid stacking motion wrappers without purpose

### ShimmerLoader

Implementation:
- `src/components/core/animations/ShimmerLoader.tsx`

Purpose:
- skeleton-style loading treatment

Rules:
- use it for content-shaped placeholders that should preserve the final layout
- keep cards, lists, and prose blocks recognizable while data is loading
- use `LoadingState` instead of raw spinners when a whole page, panel, or route is blocked

### LoadingState

Implementation:
- `src/components/core/animations/LoadingState.tsx`

Purpose:
- shared loading surface for screen, page, panel, and inline blocking states

Rules:
- use it for route suspense, auth hydration, editor boot, and other full-surface loading moments
- keep copy concise and specific to the task being prepared
- prefer the calm signal animation and action-token glow over ad hoc animated icons
- use inline actions with raw spinners only when the UI is too compact for a loading surface

## Blog Discovery Components

### BlogArchiveHero

Implementation:
- `src/features/blog/components/BlogArchiveHero.tsx`

Purpose:
- top-level blog index hero

Contains:
- page label
- headline
- short supporting copy
- search
- compact state summary

Rules:
- keep it simpler than a landing page hero
- do not repeat metadata in multiple rows
- search is the utility focus of the right column

### FeaturedStory

Implementation:
- `src/features/blog/components/FeaturedStory.tsx`

Purpose:
- high-emphasis blog preview on the blog index

Rules:
- feature only one dominant blog at a time
- public visible blogs do not need a `published` badge
- cover, title, excerpt, and action must read as one coherent unit

### EditorialCard

Implementation:
- `src/features/blog/components/EditorialCard.tsx`

Purpose:
- standard blog discovery card

Rules:
- use shared metadata order
- excerpts should be plain readable text
- action links use the action token family

### StoryCard

Implementation:
- `src/features/home/components/StoryCard.tsx`

Purpose:
- home-page blog preview card

Rules:
- same content model as blog cards
- may vary in layout, not in metadata meaning

### HeroArchivePreview

Implementation:
- `src/features/home/components/HeroArchivePreview.tsx`

Purpose:
- home hero companion preview

Rules:
- show a real blog preview, not abstract marketing feature blocks
- keep the decorative layer secondary to the content

## Reading Components

### BlogReaderFrame

Implementation:
- `src/features/blog/components/BlogReaderFrame.tsx`

Purpose:
- shared reader shell for public and profile blog detail routes

Rules:
- avoid box-in-box claustrophobic layouts
- keep header and prose separated without over-framing
- progress accents use action tokens, not purple defaults

### MarkdownReader

Implementation:
- `src/components/reader/MarkdownReader.tsx`

Purpose:
- lightweight read path for blog content

Rules:
- stable prose width
- strong heading rhythm
- code blocks, blockquotes, tables, and lists remain legible in both color modes
- the prose component should not add an unnecessary second card shell

## Form and Auth Components

### AuthShell

Implementation:
- `src/features/auth/components/AuthShell.tsx`

Purpose:
- shared structure for login, register, forgot-password, and reset-password pages

Rules:
- trustworthy, quiet, minimal
- no heavy hero marketing language
- one consistent spacing, border, and action pattern across auth routes

## Profile Components

### ProfileHeaderCard

Implementation:
- `src/features/profile/components/ProfileHeaderCard.tsx`

Purpose:
- author identity and owner actions

Rules:
- reads as one outer surface, not nested framed cards
- avatar interactions stay clipped to the avatar target
- use action tokens for primary author actions
- drafts may be shown here because this is an owner surface

### ProfilePostsSection

Implementation:
- `src/features/profile/components/ProfilePostsSection.tsx`

Purpose:
- section shell for owned blogs and drafts

Rules:
- distinguish live blogs and drafts clearly
- do not use public-surface copy patterns blindly here

### ProfileBlogGrid

Implementation:
- `src/features/profile/components/ProfileBlogGrid.tsx`

Purpose:
- owner-facing grid of blogs and drafts

Rules:
- draft state can be explicit here
- menus and poppers must not widen the page horizontally

## About and Contact Components

### AboutStatCard

Implementation:
- `src/features/about/components/AboutStatCard.tsx`

Purpose:
- quiet signal/metric card for About

Rules:
- icons use the action family, not default purple
- stats support the narrative, they do not become dashboard widgets

### ContactInfoCard

Implementation:
- `src/features/contact/components/ContactInfoCard.tsx`

### ContactPromptCard

Implementation:
- `src/features/contact/components/ContactPromptCard.tsx`

Purpose:
- structured contact and conversation prompts

Rules:
- calm informational cards, not flashy promo boxes

## Media Components

### DefaultPostCover

Implementation:
- `src/features/media/components/DefaultPostCover.tsx`

Supported styles:
- `editorial`
- `aurora`
- `notebook`

Purpose:
- decorative fallback cover for blogs without an uploaded image

Rules:
- cover art is decorative, not content duplication
- do not render the full title again inside the fallback cover
- do not show large initials as pseudo-avatars
- motion should be ambient and respect reduced motion
- keep the fallback family visually related across Home, Blog, and Profile

## Shared Content Rules

### Metadata

Preferred order on public preview surfaces:
- author
- date
- reading time

Rules:
- metadata remains secondary to the title
- public cards do not need `published` state labels
- owner-only surfaces may include draft status where useful

### Badges and Pills

Use pills for:
- page label
- light emphasis
- state only when the state matters

Rules:
- do not use saturated pills for decorative noise
- avoid labeling everything with the same redundant state

### CTA Links

Rules:
- text CTAs that behave like actions should use `action.primary`
- inline prose links should use `link.default`
- secondary CTA styling should be quieter than primary buttons

### Empty States

Rules:
- one sentence of context
- one real next action
- avoid decorative filler or generic motivational copy

## Anti-Patterns

- blog cards that repeat the title inside the cover and below it
- public cards with default `published` badges everywhere
- hero sections built from three generic feature cards
- hover overlays that escape their intended bounds
- menu poppers that create horizontal page scroll
- decorative motion that continues aggressively on reading surfaces

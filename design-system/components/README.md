# Component Recipes

This file defines the shared UI recipes that pages should compose before inventing new layouts.

## Shared Foundations

### Layout

- `Layout`
- `Navbar`
- `Footer`

Intent:
- provide stable navigation
- maintain shared page framing
- avoid page-specific shell reinvention

### Motion and Feedback

- `MotionWrapper`
- `AnimatedButton`
- `AnimatedCard`
- `ShimmerLoader`

Intent:
- establish one motion language
- keep async feedback consistent
- avoid per-page animation experiments

Rules:
- prefer subtle translate and opacity over large scale transforms
- use skeleton loading before spinners for content blocks
- reserve particles and novelty effects for explicit success moments only

## Core Recipes

### PageHeader

Purpose:
- title
- supporting copy
- optional primary action

Use on:
- Home section intros
- Blog listing header
- About and Contact intros
- Auth screens

### ArticleListItem

Purpose:
- dense editorial preview for reading-first surfaces

Contains:
- title
- subtitle or excerpt
- author/date/reading-time metadata
- optional thumbnail
- optional primary tag

Rules:
- same metadata order everywhere
- same thumbnail ratio everywhere
- same title clamping behavior everywhere

### ArticleCard

Purpose:
- roomier preview for grids and feature sections

Rules:
- should share the same semantic content model as `ArticleListItem`
- visual variation is allowed, information architecture is not

### AuthorMeta

Purpose:
- standardize avatar + author + date + reading time treatment

Rules:
- treat it as a reusable unit, not inline ad hoc page markup
- metadata colors must remain secondary or tertiary

### TagPill

Purpose:
- lightweight content classification

Rules:
- use quiet backgrounds
- avoid saturated pills unless communicating state
- do not use tag styling for status unless the meaning is actually status

### SearchBar

Purpose:
- unify search input behavior across discovery surfaces

Rules:
- consistent icon placement
- consistent padding and container width
- clear empty state when no results match

### FormCard

Purpose:
- reusable shell for login, register, forgot-password, reset-password, and contact

Contains:
- title
- helper copy
- form body
- footer links or secondary actions

Rules:
- do not repeat custom card wrappers on each auth page
- all form pages should share spacing, padding, border radius, and elevation

### StatusBadge

Purpose:
- communicate publishing state or lightweight system state

Rules:
- use semantic meaning, not arbitrary color schemes
- status color should not overpower page content

### EmptyState

Purpose:
- explain absence of content and suggest the next action

Rules:
- one sentence for context
- one clear CTA when applicable
- no decorative clutter

### ContentProse

Purpose:
- standardize long-form reading presentation

Rules:
- stable measure
- predictable heading rhythm
- consistent inline code, code block, list, blockquote, and table treatment

## Ownership Rules

- If a component is used in multiple routes, move it into shared UI.
- If a component represents business-specific composition, keep it in a feature module.
- If a styling rule is global and semantic, move it into the Chakra theme.

## Anti-Patterns

- page-specific card recipes with the same structure but different styling
- repeated auth forms with minor wrapper differences
- motion wrappers added everywhere without interaction purpose
- icons, colors, and typography overridden locally for stylistic experimentation

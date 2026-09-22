# Home

## Intent

The home page is the blog front door.

It should introduce Horizon as a personal blog, establish tone quickly, and move the reader toward real writing instead of marketing abstractions.

## Covered Routes

- `/`

## Primary Actions

- read featured writing
- browse more blogs
- write a blog when authenticated

## Layout

- one premium hero shell near the top: the synapse field, with the message on it
- the Signature below it is the real blog preview; the hero itself carries no post
- place the compact Series shelf after the unchanged hero and before Recent Blogs
- hide the entire Series shelf when the discovery request is empty or unavailable
- below the hero, blog previews should tighten into a cleaner reading rhythm

## Hierarchy

- product label
- concise headline
- short supporting paragraph
- primary CTA
- secondary CTA
- real featured/preview writing

## Core Components

- `HeroArchivePreview`
- `SeriesShelf`
- `StoryCard`
- optional `StatChip` only when it adds real context

## Motion

Home speaks the *Dawn* language (`MASTER.md` > Motion > Dawn):

- the hero is one `SynapseField` with the copy laid on it; the field is faint under the copy and
  full to the right
- the field writes the copy: the eyebrow (`SignalTarget`) and each headline word (`Typeset`) appear
  as a signal lands on them, "curious readers." carries the drawn rule, and the lede and calls to
  action follow a beat apart (`Stagger`)
- the Signature cover carries the `PointerLight`
- ambient fallback-cover motion is allowed
- avoid feature-card stacks and novelty effects competing with content

## Accessibility Notes

- hero CTA contrast must hold in both color modes
- article cards must remain obviously clickable without hover
- large headline line breaks must stay readable on mobile

## Content Notes

- call the content `blogs` or `writing`
- call ordered groups `Series`; never `learning path` or `collection`
- do not sell the product like a notebook/archive platform
- avoid generic product-value blocks that repeat the same idea

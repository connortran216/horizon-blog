# Blog

## Intent

The blog page is the main browsing surface for public writing.

It should feel like a clean index of blogs, with strong search and a clear path into deeper reading.

## Covered Routes

- `/blog`

## Primary Actions

- search blogs
- scan current blogs
- open a blog
- paginate confidently

## Layout

- one top hero shell with headline, short support copy, and search
- the hero should not repeat the same metadata in multiple places
- show the compact Series shelf before results only on the unfiltered first page
- hide the Series shelf during search, tag filters, later pages, empty data, or Series request failure
- the content list should feel tighter and more utilitarian than the home hero

## Hierarchy

- page label
- page headline
- one short supporting paragraph
- search
- compact state summary
- featured or leading blog
- standard blog cards
- pagination

## Core Components

- `BlogArchiveHero`
- `SeriesShelf`
- `FeaturedStory`
- `EditorialCard`
- `Pagination`
- `PaginationControls`

## Motion

- card lift, shadow, title, media, and arrow feedback should be clearly perceptible
- search and filter result changes fade/rise without moving controls or causing layout jumps
- press and touch feedback must remain visible without hover
- no bouncing cards or autoplay
- reduced motion removes translation while retaining color, border, shadow, and result feedback

## State And Validation Contract

- cover media supports loading, ready, no-media, error, and retry
- current results remain stable while the next state is resolving when the data hook permits it
- test long Vietnamese and English titles/excerpts with production-shaped data
- visually check desktop/mobile, light/dark, mouse/keyboard/touch, and reduced motion

## Accessibility Notes

- search must have a strong accessible name
- pagination states must be explicit
- cards need visible focus treatment in both modes

## Content Notes

- use `blog` and `blogs`, not `posts`
- use `Series` and `Part X of Y`; never `learning path` or `collection`
- public cards do not need `published` labels
- the page should feel like a blog index, not a generic archive tool

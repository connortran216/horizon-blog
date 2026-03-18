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
- `FeaturedStory`
- `EditorialCard`
- `Pagination`
- `PaginationControls`

## Motion

- subtle hover and entry transitions only
- no bouncing cards
- fallback cover motion may exist, but should remain ambient

## Accessibility Notes

- search must have a strong accessible name
- pagination states must be explicit
- cards need visible focus treatment in both modes

## Content Notes

- use `blog` and `blogs`, not `posts`
- public cards do not need `published` labels
- the page should feel like a blog index, not a generic archive tool

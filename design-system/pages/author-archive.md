# Author Archive

## Intent

The public author archive is a reader-facing identity surface for discovering one author's published writing.

It should feel editorial and personal, not like the protected profile workspace.

## Covered Routes

- `/authors/:id`

## Primary Actions

- review the public author identity
- read published blogs by that author
- return to the main blog index
- paginate through the public writing list

## Layout

- one dominant author hero shell
- featured leading blog followed by standard public blog cards
- pagination below the writing list
- hero should foreground author identity without feeling like a dashboard

## Hierarchy

- page label
- author name
- short bio or safe fallback copy
- high-level counts
- leading published blog
- remaining published blogs
- pagination

## Core Components

- `AuthorArchiveHero`
- `FeaturedStory`
- `EditorialCard`
- `PaginationControls`

## Motion

- subtle fade and rise on entry
- ambient halo behind the hero shell only
- no large decorative motion on the avatar or stats

## Accessibility Notes

- avatar must have a strong initials fallback when no image exists
- empty and error states need explicit headings and next actions
- pagination should remain shareable via query params
- private profile fields must never appear on this route

## Content Notes

- use `author`, `writing`, and `blogs`
- never show drafts or owner-management actions
- fallback bio copy should stay generic and public-safe

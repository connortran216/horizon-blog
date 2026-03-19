# Author Archive

## Intent

The public author archive is a reader-facing identity surface for discovering one author's published writing.

It should feel editorial and personal, not like the protected profile workspace.

## Covered Routes

- `/authors/:authorName`

The page resolves the backend id from internal navigation state and a same-session slug cache.
Legacy numeric links like `/authors/:id` should still resolve through the page hook fallback.

## Primary Actions

- review the public author identity
- read published blogs by that author
- return to the main blog index
- paginate through the public writing list

## Layout

- sticky author rail on desktop and stacked identity block on mobile
- one designed author panel on the left and one chronological archive list on the right
- the list should feel quiet and scan-first, with thin dividers and minimal metadata
- pagination belongs under the archive list, not under a generic card grid

## Hierarchy

- avatar
- author name
- optional subtitle
- optional bio
- article count row
- follower row
- following row
- archive list rows
- pagination

## Core Components

- `AuthorArchiveHero`
- `AuthorArchiveStoryListItem`
- `PaginationControls`

## Motion

- subtle fade and rise on entry
- ambient halo behind the rail only
- list hover motion should be subtle and non-disruptive

## Accessibility Notes

- avatar must have a strong initials fallback when no image exists
- empty and error states need explicit headings and next actions
- pagination should remain shareable via query params
- private profile fields must never appear on this route
- sticky rail must not overlap the navbar or first archive item

## Content Notes

- use `author`, `writing`, and `blogs`
- never show drafts or owner-management actions
- omit empty bio instead of adding filler copy
- the archive should read like a calm index, not a dashboard or marketing page
- follower and following values are mocked until the backend exposes public social stats

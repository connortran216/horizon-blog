# Editor

## Intent

The editor should feel focused, reliable, and confidence-building.

The writing surface is more important than the tooling around it.

## Covered Routes

- `/blog-editor`
- `/blog-editor/publish`

## Primary Actions

- draft a blog
- edit a blog
- save confidently
- publish when ready
- choose immediate or scheduled publication while reviewing the landing-page card
- assign a blog to zero or one owned series
- create, edit, remove, and reorder owned learning paths

## Layout

- wide, focused authoring shell
- metadata and save state near the top
- the editor workspace remains visually dominant

## Hierarchy

- title and metadata
- save state and controls
- editor surface
- publish and preview affordances
- publishing route uses a two-area desktop layout: settings on the left and a non-interactive landing-card preview on the right
- publishing areas stack settings-first on smaller screens
- series management uses a single-column form and explicit up/down controls that remain usable without drag-and-drop

## Core Components

- `EditorWorkspace`
- `EditorMetaBar`
- `EditorTagField`
- `CrepeEditor`
- `CrepePreview`
- `SeriesManager`

## Motion

- almost none inside the writing area
- save/publish feedback should be calm and reliable
- do not add decorative motion near the text cursor or editing flow

## Accessibility Notes

- keyboard navigation across metadata and editor controls must work
- editor actions need visible focus and clear labels
- ordering controls need unique accessible names and disabled boundary states
- code blocks and selection states must remain legible in both color modes

## Content Notes

- editor labels should say `blog`, not `post`
- draft state matters here and may be explicit
- deleting a series must clearly state that its blogs remain

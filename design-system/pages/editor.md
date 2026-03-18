# Editor

## Intent

The editor should feel focused, reliable, and confidence-building.

The writing surface is more important than the tooling around it.

## Covered Routes

- `/blog-editor`

## Primary Actions

- draft a blog
- edit a blog
- save confidently
- publish when ready

## Layout

- wide, focused authoring shell
- metadata and save state near the top
- the editor workspace remains visually dominant

## Hierarchy

- title and metadata
- save state and controls
- editor surface
- publish and preview affordances

## Core Components

- `EditorWorkspace`
- `EditorMetaBar`
- `EditorTagField`
- `CrepeEditor`
- `CrepePreview`

## Motion

- almost none inside the writing area
- save/publish feedback should be calm and reliable
- do not add decorative motion near the text cursor or editing flow

## Accessibility Notes

- keyboard navigation across metadata and editor controls must work
- editor actions need visible focus and clear labels
- code blocks and selection states must remain legible in both color modes

## Content Notes

- editor labels should say `blog`, not `post`
- draft state matters here and may be explicit

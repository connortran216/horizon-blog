# Editor

## Intent

The editor should maximize focus and confidence while writing. Tooling is secondary to content.

## Primary Actions

- draft
- edit
- publish

## Layout

- wide but controlled authoring shell
- strong separation between metadata inputs and editor surface
- publish action should be visible without overwhelming the page

## Hierarchy

- title input first
- metadata and save state second
- writing surface third
- publish controls visible but calm

## Components

- `EditorShell`
- title input
- tag input
- save status text
- editor surface
- publish action

## Motion

- avoid busy motion in the writing area
- async save feedback should be subtle and reliable
- success feedback on publish can be slightly richer than normal interactions

## Accessibility Notes

- keyboard navigation should work across metadata and editor controls
- toolbar controls need labels and visible focus states
- code block and editor selections must remain legible in both color modes

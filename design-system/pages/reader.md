# Reader

## Intent

Reader pages should optimize for immersion and comprehension. They are the highest-sensitivity surfaces in the product.

## Covered Routes

- public blog detail
- profile blog detail

## Primary Actions

- read the article
- navigate back to browse or profile context

## Layout

- narrow reading container for prose
- metadata grouped near the title
- clear separation between article header and article body

## Hierarchy

- title
- subtitle if present
- author and reading metadata
- article body
- related navigation or next action

## Components

- `PageHeader`
- `AuthorMeta`
- `ContentProse`
- back navigation

## Motion

- almost no decorative motion once the article is visible
- loading transitions should not disturb reading continuity

## Accessibility Notes

- body text needs strong contrast and comfortable line height
- code blocks, blockquotes, and tables must remain readable on mobile
- linked text should remain identifiable without hover

# Reader

## Intent

Reader pages should optimize for immersion, clarity, and comfort.

They are the highest-sensitivity surfaces in the product.

## Covered Routes

- `/blog/:id`
- `/profile/:username/blog/:id`

## Primary Actions

- read the blog
- return to browsing or profile context

## Layout

- use a looser editorial shell rather than nested boxed cards
- keep title and metadata compact and clear
- keep the prose width stable and comfortable

## Hierarchy

- back/context action
- title
- optional subtitle
- author/date/reading time
- body
- follow-up navigation if needed

## Core Components

- `BlogReaderFrame`
- `MarkdownReader`
- optional shared back navigation

## Motion

- nearly static once the page is loaded
- progress accents may move subtly
- avoid decorative motion that distracts from reading

## Accessibility Notes

- prose contrast must stay strong in both color modes
- code blocks, tables, and blockquotes must remain readable on mobile
- links must be identifiable without hover

## Content Notes

- the page is about reading a blog, not browsing a system
- avoid redundant state labels on public reading surfaces

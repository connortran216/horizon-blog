# Page Override Model

`MASTER.md` defines the global system.

Files in this folder define page-specific decisions that intentionally override or refine the global rules for a route family.

Override order:
1. `MASTER.md`
2. page file in `design-system/pages/`
3. implementation in `src/theme`, `src/components`, and page composition

## When To Add A Page File

Add a page file when a route family has needs that differ from the default system, such as:
- a wider or narrower layout
- specialized hierarchy
- a dedicated content model
- a unique CTA pattern

Do not add a page file just because one screen wants a custom color or animation.

## Required Sections For New Page Docs

- intent
- primary actions
- layout
- hierarchy
- components
- motion
- accessibility notes

## Current Page Docs

- `home.md`
- `blog.md`
- `auth.md`
- `editor.md`
- `reader.md`

# Page Override Model

`MASTER.md` defines the global system.

Files in this folder define route-family decisions that intentionally refine the base system.

Override order:
1. `design-system/MASTER.md`
2. page-family doc in `design-system/pages/`
3. implementation in `src/theme/`, `src/app/layouts/`, `src/components/`, and `src/features/`

## Page Families

### Public

- `home.md`
- `blog.md`
- `reader.md`
- `about.md`
- `contact.md`

### Auth

- `auth.md`

### Authoring

- `editor.md`
- `profile.md`

## When To Add A Page Doc

Add a page doc when a route family has a distinct need, such as:
- different layout constraints
- a unique content hierarchy
- a unique primary action pattern
- unique owner-only rules

Do not add a page doc just because one screen wants a one-off color or animation.

## Required Sections

Every page doc should cover:
- intent
- covered routes
- primary actions
- layout
- hierarchy
- core components
- motion
- accessibility notes
- content notes when wording matters

## Public vs Protected Rule

Public pages should:
- read as editorial reading surfaces
- avoid draft-oriented language
- avoid redundant status labels for visible blogs

Protected pages may:
- show draft status
- surface management actions
- use owner-specific UI language

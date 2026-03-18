# Profile

## Intent

The profile page is the author's workspace and public-facing identity surface for the owner.

It should feel like an editorial author page with management affordances, not a dashboard.

## Covered Routes

- `/profile/:username`

## Primary Actions

- review personal profile information
- edit the profile
- write a new blog
- manage blogs and drafts

## Layout

- one dominant profile header shell
- owned writing section below
- keep management UI integrated into the editorial tone

## Hierarchy

- profile identity
- primary owner actions
- high-level counts
- blogs and drafts sections

## Core Components

- `ProfileHeaderCard`
- `ProfilePostsSection`
- `ProfileBlogGrid`
- `EditProfileModal`
- `AvatarPreviewModal`

## Motion

- subtle only
- avatar interaction may use local overlay feedback
- no large decorative motion around management surfaces

## Accessibility Notes

- avatar hover and menus must remain clipped and keyboard accessible
- poppers and menus must not introduce horizontal scrolling
- draft/live distinctions must not rely on color alone

## Content Notes

- this is the one place where draft language matters
- public-visible blogs do not need `published` copy, but drafts can be explicit here
- keep the tone personal and author-centric, not administrative

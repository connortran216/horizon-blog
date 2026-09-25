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
- manage upcoming scheduled publications

## Layout

- an unboxed author masthead on the page canvas: the square portrait editor and
  full-size action on the left; the eyebrow, the display-face name with the
  inline edit action, the biography and one line of contact metadata on the right
- the single dominant `Write a blog` action sits beside the eyebrow at desktop
  and follows the metadata on a phone (named grid areas, one markup order)
- one rule runs under the masthead and writes the Blogs / Scheduled / Drafts
  counts as typography (`SignalRoute`); on a phone they become a compact list
- owned writing section below, also unboxed: heading, tabs, then a three-column
  card grid from `lg`
- keep management UI integrated into the editorial tone

## Hierarchy

- portrait and profile identity
- quiet `Edit profile` action immediately after the name
- biography and permission-gated `Write a blog` action
- high-level counts expressed as typography and dividers, not KPI cards
- blogs and drafts sections
- published, scheduled, and unscheduled draft views use independent server-backed counts

## Core Components

- `ProfileHeaderCard`
- `ProfileHeader` with `layout="workspace"`
- `AvatarEditor` with `presentation="workspace"`
- `ProfilePostsSection`
- `ProfileBlogGrid`
- `ProfileScheduledList`
- `ProfileScheduledRow`
- `EditProfileModal`
- `AvatarPreviewModal`

## Motion

- subtle only: the name typesets and the masthead rule writes the counts once,
  on arrival; nothing ambient
- avatar interaction may use local overlay feedback
- no large decorative motion around management surfaces

## Accessibility Notes

- the square avatar frame clips its overlay control while the labelled file
  input remains reachable through a native button
- upload progress and persistent upload failure remain announced in the page
- the public/default `ProfileHeader` and compact `AvatarEditor` presentations
  are unaffected by the workspace option
- poppers and menus must not introduce horizontal scrolling; with no surface to
  clip them, the card and schedule menus use the `fixed` popper strategy
- draft/live distinctions must not rely on color alone
- scheduled rows use text labels for `Scheduled`, `Publishing`, and `Needs attention`
- schedule actions remain keyboard-accessible through a labeled Manage menu

## Content Notes

- this is the one place where draft language matters
- public-visible blogs do not need `published` copy, but drafts can be explicit here
- keep the tone personal and author-centric, not administrative
- scheduled rows show exact local time, timezone, relative time, and last update
- a just-due publication reads `Publishing`; after five minutes it reads `Needs attention`
- canceling a schedule returns the blog to Drafts and does not delete it

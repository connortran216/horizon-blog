# UI Contract: Series Learning Paths

## Public `/series/:slug`

- Load through the series service.
- Show a calm header, author, description, `N blogs`, browser-local progress, and ordered part list.
- Each published part links through the existing encoded public blog path helper.
- Show not-found copy for absent/private series and retry copy for transient failures.

## Blog reader integration

- Fetch `/posts/:id/series` independently from the blog request.
- Render one compact helper panel between metadata and table of contents.
- Show series link, `Part X of Y`, and available Previous/Next links.
- Mark the current post visited after confirmed series context.
- On any context failure, render no panel and leave the article untouched.

## Protected `/series/manage`

- Require `content:manage:own`.
- Show create form and owner series panels.
- Edit title/description explicitly.
- Add owned blogs, remove members, and move parts up/down before saving the complete order.
- Confirm series deletion and retain confirmed server state on failures.
- Use text labels in addition to icons and status color.

## Publication review

- Load owner series independently from blog loading.
- Show a labelled select with `No series` plus owned series options and a `Manage series` link.
- Assign/move/remove membership before immediate or scheduled publication.
- Stop publication and show a retryable error if membership saving fails.

## Accessibility and responsive behavior

- Use native links, buttons, labels, and selects.
- Preserve focus indication in light/dark modes.
- Stack content at mobile widths with no horizontal scroll.
- Use no continuous animation; interaction transitions remain subtle.

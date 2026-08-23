# UI Contract: Series Discovery and Reading

The approved screen inventory is [../ui-ux.md](../ui-ux.md).

## Public discovery

- Home loads at most two public Series independently from blog loading, preserves the existing hero, and places the shelf before Recent Blogs.
- Blog loads the same compact shelf only on the unfiltered first page and hides it during search, tag filters, or later pages.
- Shelf empty/error states render nothing and never replace normal blog content.
- `/series` renders one featured Series plus the public Series grid, with explicit loading, empty, retry, and pagination states.
- Blog cards use backend-provided optional Series summary context and never issue one context request per card.
- Standalone blog cards keep normal metadata; Series-member cards add `Series title / Part X of Y`.

## Public `/series/:slug`

- Load through the series service.
- Show a calm header, author, description, `N blogs`, total reading time, last-updated date, optional public topics, and ordered part list.
- Show part excerpt and reading time; use `Start here` only for Part 01.
- Each published part links through the existing encoded public blog path helper.
- Show not-found copy for absent/private series and retry copy for transient failures.
- Show no local opened/completion state.

## Blog reader integration

- Fetch `/posts/:id/series` independently from the blog request.
- Render one compact helper panel between metadata and table of contents.
- Show series link, `Part X of Y`, and available Previous/Next links.
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

## Public copy and SEO

- Use `Series` and `Part X of Y`; do not render `learning path`, `collection`, course, lesson, or completion language.
- Keep the global navbar unchanged.
- `/series` and `/series/:slug` provide canonical, title, description, Open Graph, and sitemap coverage.
- Public Series not found/private/empty states remain real not-found responses for crawlers.

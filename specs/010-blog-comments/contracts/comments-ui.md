# UI Contract: Blog Comments

The transport contract is defined by [the backend comments API](../../../../horizon-blog-be/specs/005-blog-comments/contracts/comments-api.md).

## Reader composition

`BlogDetailPage` passes `discussionSection` to `BlogReaderFrame`. The frame renders it after `interactionSection` inside the central editorial column at `maxW="4xl"`.

The profile/draft reader does not receive the section.

## Interaction states

- **Initial loading**: content-shaped quiet placeholders; article remains interactive.
- **Empty open**: invitation plus composer or sign-in CTA.
- **Empty closed**: concise closed-discussion message.
- **Loaded**: oldest-first top-level list and on-demand replies.
- **Load failure**: local retry action; no page-level error.
- **Mutation failure**: inline or toast feedback beside the attempted action; existing content remains.
- **Removed**: content-free “Comment removed” tombstone only when retained by the API.

## Accessibility

- Discussion container uses `id="comments"` and an accessible heading.
- Comment action buttons include the comment context in their accessible labels.
- Edit and reply composers use explicit labels and live character counts.
- Destructive removal uses a confirmation dialog with focus return.
- Nesting is communicated structurally and visually, not by color alone.
- Focus indicators use the existing action system.

## Visual direction

- Calm, unboxed editorial section using semantic tokens.
- Thin separators or subtle inset reply rails; no nested glass cards.
- No decorative animation around reading or writing.
- Content uses `white-space: pre-wrap` and safe overflow wrapping.

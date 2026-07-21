# UI Contract: Landing Story Card Cover

## With a resolved cover

- Render the cover as an image with the blog title as alternative text.
- Center the image inside a quiet, padded media area.
- Preserve the image aspect ratio and show all four edges.
- Keep the card destination and metadata unchanged.

## Without a resolved cover

- Render the existing fallback-cover component.
- Preserve the current mobile top border and desktop left border behavior.

## Responsive behavior

- Narrow screens: content and media stack vertically.
- Medium screens and above: content and media use the existing two-column layout.
- Neither layout may crop the resolved cover.
- The media frame keeps a compact wide-cover aspect ratio and does not inherit extra height from the preview content.
- Author, reading time, and action metadata render in a full-width footer after the content-and-media row.
- A desktop divider may separate the preview and media only across the compact row; it must not extend through an empty panel.

## Option C information panel

- The cover is the first visible card element and retains its complete 16:9 frame.
- One information panel follows the cover and is inset from the outer card edges.
- The panel contains the badge, date, title, excerpt, author, reading time, and read action.
- The panel does not overlap or obscure the cover.
- Mobile and desktop preserve the same cover-first reading order.

## Standard blog-card frame

- The cover, overlay, and fallback share one overflow-clipped frame.
- The frame uses the existing standard-card radius on every viewport.
- Rounding does not change the cover height, crop behavior, metadata, or destination.

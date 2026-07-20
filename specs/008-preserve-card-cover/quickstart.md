# Verification: Preserve Landing Card Cover

1. Render `StoryCard` with a normal HTTPS cover URL.
2. Confirm generated markup retains the title, author, reading time, and card destination.
3. Confirm the resolved image uses contained sizing rather than fill-and-crop sizing.
4. Run the focused StoryCard test.
5. Run TypeScript and lint validation.
6. When the owner-managed dev server is available, visually check 375px, 768px, 1024px, and 1440px widths.
7. Render `EditorialCard` with a normal HTTPS cover URL and confirm all four cover corners, including the overlay, use the standard rounded frame.
8. Confirm the landing cover occupies a compact 16:9 frame rather than a tall grid cell, with no large empty media slab.
9. Confirm the author, reading time, and action render in one full-width footer below the preview-and-cover row.

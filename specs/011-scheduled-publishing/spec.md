# Feature Specification: Scheduled Publishing

## User Scenarios

### Publish from a dedicated review page (P1)

As the blog owner, I can leave the editor for a dedicated publishing page, choose immediate or scheduled publication, and review the landing-page card before confirming.

**Acceptance scenarios**

1. The editor Publish action saves the draft and opens the protected publishing page.
2. Publish now makes the blog public and opens its reader page.
3. Schedule for later requires a future local date/time, displays the browser timezone, and returns to the owner profile after success.
4. The right area renders a non-interactive landing-style card using the saved title, excerpt, cover, author, date, and reading time.

## Requirements

- FR-001: Use a two-area desktop layout and settings-first stacked mobile layout.
- FR-002: Use Horizon semantic design tokens; do not introduce raw page colors.
- FR-003: Keep both publication choices keyboard accessible and labelled.
- FR-004: Prevent past schedules and duplicate submissions.
- FR-005: Treat scheduling errors as inline feedback and preserve the chosen values.

## Success Criteria

- SC-001: An owner completes either flow from the saved editor state in one publishing page.
- SC-002: The preview matches the information hierarchy of the landing-page blog card.
- SC-003: The page remains usable at 375, 768, 1024, and 1440 pixel widths.

## Assumptions

- The browser timezone is authoritative for input and the API receives UTC.
- Scheduled blogs remain drafts until background publication succeeds.

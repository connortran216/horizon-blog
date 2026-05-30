# Data Model: Query Nine Posts

## Post Query Limit

- **Definition**: The numeric limit sent to the blog service or stored in pagination state for a post list surface.
- **Valid value for this feature**: `9`.
- **Validation rule**: Relevant frontend post list request and pagination sources must not retain `6`.

## Post List Surface

- **Definition**: A frontend location that requests or paginates post summaries.
- **Surfaces in scope**:
  - Home page published-post preview.
  - Blog archive page.
  - Profile published and draft post lists.
- **State transition**: Existing loading and pagination behavior remains unchanged; only the page size changes.

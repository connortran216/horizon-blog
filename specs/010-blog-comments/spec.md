# Feature Specification: Blog Comments

**Feature Branch**: `main`
**Created**: 2026-07-27
**Status**: Approved for planning
**Backend source of truth**: [Backend specification](../../../horizon-blog-be/specs/005-blog-comments/spec.md)
**Input**: Add a calm discussion experience below public blogs using the approved comments API.

## User Scenarios & Testing

### User Story 1 - Read discussion without interrupting the article (Priority: P1)

As any reader, I want to read comments beneath a published blog so that I can benefit from its discussion without signing in.

**Independent Test**: Load a blog signed out, expand two levels of replies, load additional sibling pages, and confirm the article remains usable when comment loading fails.

### User Story 2 - Participate after signing in (Priority: P1)

As a signed-in reader, I want to add a comment or reply so that I can join the discussion.

**Independent Test**: Create top-level, depth-1, and depth-2 contributions; retry a submission; reject a third reply level; and confirm plain text is rendered safely.

### User Story 3 - Manage and moderate discussion (Priority: P2)

As a commenter or blog owner, I want authorized actions displayed clearly so that I can edit or remove content and control whether new participation is open.

**Independent Test**: Render capability combinations from the API and confirm only approved edit, remove, reply, and settings actions appear.

## Functional Requirements

- **FR-001**: The public blog route MUST remain readable when comments are loading or unavailable.
- **FR-002**: Signed-out readers MUST be able to load comments and replies.
- **FR-003**: Signed-out participation controls MUST lead to login and return to the same blog discussion.
- **FR-004**: Signed-in readers MUST be able to create comments and replies using one retry-stable submission ID per intended contribution.
- **FR-005**: The UI MUST render at most top-level, reply, and nested-reply depths.
- **FR-006**: Reply controls MUST be unavailable at depth 2.
- **FR-007**: Content MUST be rendered as plain text with preserved line breaks and safe wrapping.
- **FR-008**: The composer MUST reject blank content and content over 2,000 characters before submission.
- **FR-009**: Edit, remove, reply, and settings controls MUST follow backend capability flags.
- **FR-010**: Removed comments MUST display content-free tombstones only when the API retains them.
- **FR-011**: Top-level comments and each reply list MUST support cursor-based “load more” behavior with deduplication.
- **FR-012**: Successful mutations MUST update visible state without duplicating comments.
- **FR-013**: Failed mutations MUST leave the existing discussion unchanged and provide local feedback.
- **FR-014**: Blog owners MUST be able to close and reopen participation from the discussion heading when authorized.
- **FR-015**: Closed discussions MUST remain readable while hiding or disabling new participation.
- **FR-016**: A newly accepted comment MUST be visibly confirmed even when older cursor pages remain unloaded.
- **FR-017**: The interaction bar comment control MUST navigate to the discussion section.
- **FR-018**: A comments-specific not-found response on an otherwise valid article MUST render as a neutral unavailable discussion state without transport error text or a retry action; retry UI is reserved for transient failures.

## Non-Goals

- Rich-text comments, Markdown, links, media, reactions, notifications, live updates, or site-wide moderation.
- Replacing the existing reader layout or creating a dashboard-style comments surface.
- Adding comment content to search engine metadata or crawler fallback HTML.

## Key Entities

- **Comment view model**: Safe public content, author display identity, timestamps, depth, reply count, and capability flags.
- **Sibling page**: One cursor-paginated list under a shared parent.
- **Discussion state**: Open/closed status, counts, viewer capabilities, loading, and local errors.
- **Pending contribution**: Content plus one submission ID retained for retries until success or explicit cancellation.

## Assumptions

- Comments appear after the article interaction bar in the central reader column.
- Direct replies load on demand to keep each response bounded.
- A confirmed top-level comment may appear in a temporary “Just posted” position until all older pages are loaded.
- Existing login location state supports return-to-discussion navigation.

## Success Criteria

- **SC-001**: Comment failures never replace or hide successfully loaded article content.
- **SC-002**: Signed-out, signed-in, owner, and commenter capability states have component coverage.
- **SC-003**: Plain-text tests prove script-like input is displayed as text.
- **SC-004**: Pagination and retry tests produce no duplicate comment IDs.
- **SC-005**: A successful contribution is visibly confirmed within two seconds under normal API conditions.
- **SC-006**: Keyboard focus, labels, and destructive-action confirmation remain usable in light and dark modes.

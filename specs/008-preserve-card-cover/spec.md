# Feature Specification: Preserve Landing Card Cover

**Feature Branch**: `main`
**Created**: 2026-07-20
**Status**: Ready for planning
**Input**: Use approved prototype Option D for landing-page recent-blog cards so the complete cover artwork remains visible.

## User Scenarios & Testing

### User Story 1 - See the complete blog cover (Priority: P1)

As a reader scanning recent blogs on the landing page, I want each cover to remain fully visible so that cover titles and artwork are not sliced by the card layout.

**Why this priority**: Cropped cover text makes the blog preview look broken and weakens recognition of the featured writing.

**Independent Test**: Given a recent blog with a wide cover image, the landing card shows the complete image within a distinct media area at mobile and desktop widths without clipping any edge.

**Acceptance Scenarios**:

1. **Given** a recent blog has a cover image, **When** its landing card renders, **Then** the full image is visible without cropping or zooming.
2. **Given** the cover aspect ratio does not match the media column, **When** the card renders, **Then** quiet surrounding space is preferred over cutting the image.
3. **Given** the card is viewed on a narrow screen, **When** the columns stack, **Then** the complete cover remains visible and the text remains readable.
4. **Given** a blog has no cover image, **When** the card renders, **Then** the existing fallback cover remains available.

### User Story 2 - See a visually finished blog card (Priority: P1)

As a reader browsing the blog page, I want the inset cover image to follow the card's rounded visual language so that the preview feels intentional rather than sharp and unfinished.

**Why this priority**: The square cover corners visibly conflict with the rounded card surface on every standard blog card.

**Independent Test**: Given a standard blog card with a cover image, the image and its overlay are clipped to the same rounded inset frame in both color modes.

**Acceptance Scenarios**:

1. **Given** a standard blog card has a cover image, **When** it renders, **Then** all four image corners are rounded consistently.
2. **Given** the card applies an image overlay, **When** the image frame is rounded, **Then** the overlay is clipped to the same corners.
3. **Given** a card uses the generated fallback cover, **When** it renders, **Then** the same rounded frame contains the fallback.

## Requirements

### Functional Requirements

- **FR-001**: Recent-blog cards MUST show all four edges of available cover artwork.
- **FR-002**: The cover MUST remain centered inside a visually quiet media area when its aspect ratio differs from the card area.
- **FR-003**: The card MUST retain its existing title, excerpt, author, date, reading time, action, and navigation behavior.
- **FR-004**: The card MUST continue to stack into a readable single-column layout on narrow screens.
- **FR-005**: Missing-cover cards MUST continue to use the existing generated fallback cover.
- **FR-006**: The change MUST use the existing visual language and semantic color roles.
- **FR-007**: Standard blog-card cover frames MUST use the existing standard-card corner radius.
- **FR-008**: Image overlays and fallback covers MUST remain clipped inside the rounded cover frame.

## Success Criteria

- **SC-001**: In every tested landing-card viewport, 100% of an available cover image is visible.
- **SC-002**: Cover artwork remains uncropped at representative 375px, 768px, 1024px, and 1440px viewport widths.
- **SC-003**: Existing card content and navigation remain present after the redesign.
- **SC-004**: The focused regression test, type check, and lint validation pass.
- **SC-005**: 100% of standard blog cards show their cover inside a consistently rounded frame.

## Assumptions

- Option D refers to the approved horizontal card with a padded, contained media well.
- Existing cover assets may include important text near their edges and therefore cannot safely use a fill-and-crop treatment.
- This is a frontend presentation change with no backend, API, or stored-content changes.
- The existing standard-card radius is the intended rounding level for blog-page cover frames.

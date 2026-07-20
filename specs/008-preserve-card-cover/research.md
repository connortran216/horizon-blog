# Research: Preserve Landing Card Cover

## Decision: Contain the cover inside a padded media well

**Rationale**: Cover assets can contain meaningful text at their edges. A contained image guarantees complete visibility, while the media well absorbs aspect-ratio differences without distorting the image.

**Alternatives considered**:

- Continue using fill-and-crop: rejected because it causes the reported defect.
- Move every cover above the card content: rejected because Option D preserves the current horizontal reading rhythm and was selected by the owner.
- Use the cover as a background: rejected because background sizing makes full-image visibility less explicit and weakens image semantics.

## Decision: Preserve the existing responsive grid and fallback

**Rationale**: The current single-column mobile and two-column desktop behavior already matches the home-page design rules. Only the media treatment needs correction.

## Decision: Round the blog-card cover frame

**Rationale**: Applying the existing standard-card radius to the frame, rather than only the image, clips the image overlay and fallback cover consistently without adding another visual surface.

**Alternatives considered**:

- Round only the image element: rejected because the absolute overlay could retain sharp corners.
- Match the outer card's largest radius: rejected because the inset image should use the quieter standard-card radius defined by the design system.

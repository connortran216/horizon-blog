# Presentation Model: Preserve Landing Card Cover

No persistent entities or API fields change.

## Existing Inputs

- **Blog summary**: title, excerpt, author, date, reading time, identifier, and optional cover image.
- **Resolved cover**: a browser-safe image URL produced by the existing media-resolution hook.
- **Fallback cover**: the existing generated cover shown when no resolved image is available.

## Presentation Invariants

- A resolved cover keeps its intrinsic aspect ratio.
- The complete resolved cover remains visible.
- Missing covers continue through the existing fallback branch.

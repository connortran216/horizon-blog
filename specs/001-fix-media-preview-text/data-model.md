# Data Model: Fix Media Preview Text

## Blog Content

- **Source**: `content_markdown`
- **Role**: Canonical post body used by preview text, reading time, reader pages, and cover extraction.
- **Validation**: Must be handled as untrusted author content and converted to plain text for card previews.

## Preview Text

- **Source**: Blog content after markdown cleanup.
- **Rules**:
  - Remove fenced code blocks from summaries.
  - Remove markdown and HTML image blocks from summaries.
  - Preserve ordinary link labels.
  - Collapse whitespace.
  - Return fallback text when no readable text remains.

## Media Block

- **Source forms**:
  - Markdown image syntax such as `![Image](media://id)`.
  - Markdown image syntax such as `![1.00](media://id)`.
  - HTML image tags.
- **Preview behavior**: Does not contribute text to excerpts or reading-time counts.
- **Cover behavior**: Still eligible for cover extraction through the existing cover-image logic.

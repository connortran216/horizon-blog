# Story 02: Switch Home and Archive to Summaries

**Dependencies**: Story 01
**Owns**: home and unfiltered archive consumers and listing cards

## Acceptance Criteria

- Home and unfiltered archive use summary data without synthetic empty markdown.
- Cards preserve title, excerpt, cover, author, tags, date, and reading time.
- Optional-field fallbacks remain unchanged.
- Active filters/search continue using established contracts.

## Validation

- Page/hook tests prove endpoint selection for filtered and unfiltered states.
- Card tests prove summary fields render without `content_markdown`.

## Definition of Done

- [x] T008-T014 complete.
- [x] Home/archive focused tests pass.
- [x] Commit and validation recorded in `checklist.md`.

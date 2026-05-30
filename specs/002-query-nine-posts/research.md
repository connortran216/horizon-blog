# Research: Query Nine Posts

## Decision: Update existing per-surface constants directly

**Rationale**: The current code defines the page size at the consuming surfaces. The requested change is a value change from 6 to 9, not a new shared configuration requirement.

**Alternatives considered**:

- Add a shared `POST_LIST_LIMIT` constant. Rejected because it would add abstraction for three direct call sites without reducing meaningful complexity.
- Change backend defaults. Rejected because the user requested a frontend query parameter change and the existing API accepts explicit limits.

## Decision: Align the blog loading placeholder count with the page size

**Rationale**: The archive loading state should reserve space for the same number of cards requested by the page.

**Alternatives considered**:

- Keep six placeholders. Rejected because it would make the loading state inconsistent with the requested page size.

## Decision: Validate with source search and lint

**Rationale**: The behavior is represented by static numeric request values. A targeted search confirms the old relevant value is gone, and lint checks TypeScript/ESLint correctness for the touched files.

**Alternatives considered**:

- Run production build. Rejected as unnecessary for this small page/hook value change under the repo build policy.

# Data Model: Public Post Codes

## PublicPostCode

A derived, non-persisted identifier used only in public reader URLs.

### Source

- `postId`: existing positive numeric post ID.

### Derived value

- `code`: fixed prefix plus a fixed-width case-sensitive base-62 payload.
- `path`: `/blog/<code>`.

### Validation rules

- The source ID must be a positive safe integer.
- The code must match the fixed prefix, alphabet, and payload width.
- Decoding must produce a positive safe integer.
- Re-encoding the decoded ID must reproduce the exact input code.
- Malformed and non-canonical inputs are rejected before any post request.

### Persistence

- None. Codes are deterministic and reversible.
- The existing post model, database schema, and API response shapes remain unchanged.

### Lifecycle

1. A numeric post ID is returned by the existing backend.
2. Public link generation derives the stable code.
3. Public route handling decodes the code back to the numeric ID.
4. The existing numeric backend request loads the published post.

### Compatibility

- A decimal public route segment is recognized only as a legacy URL.
- Its permanent destination is the coded path derived from the same ID.
- Protected profile and analytics route IDs are not transformed.

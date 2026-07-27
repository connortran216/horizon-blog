# Frontend Data Model: Blog Comments

## Comment

| Field | Type | Meaning |
|---|---|---|
| `id` | number | API comment identifier |
| `parentId` | number or null | Direct parent |
| `depth` | `0 \| 1 \| 2` | Server-derived display depth |
| `content` | string or null | Plain text; null for tombstone |
| `author` | safe identity or null | Display name and optional avatar |
| `createdAt` | date string | Creation timestamp |
| `editedAt` | date string or null | Edited marker |
| `isRemoved` | boolean | Tombstone state |
| `replyCount` | number | Visible direct replies |
| `canEdit` | boolean | Server capability |
| `canRemove` | boolean | Server capability |
| `canReply` | boolean | Server capability |

## SiblingPageState

- `items`: ordered, deduplicated comments sharing one parent.
- `nextCursor`: opaque API cursor.
- `hasMore`: whether another page exists.
- `loading`: initial or incremental fetch state.
- `error`: local fetch error.

## DiscussionState

- top-level sibling page;
- per-comment child page map;
- `commentsOpen`;
- `commentCount`;
- `canCreate`;
- `canManageComments`;
- local mutation state and errors;
- optional confirmed comment displayed until it can be inserted in canonical order.

## PendingSubmission

- normalized content;
- optional parent ID;
- UUID submission ID;
- retained after a retryable failure;
- cleared after success or explicit cancellation.

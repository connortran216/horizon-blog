# Preview Text Contract

## Input

Markdown content from a blog post.

## Output

Plain text for compact blog previews and reading-time calculations.

## Required Behavior

| Input pattern | Output behavior |
| --- | --- |
| `![Image](media://abc)` followed by prose | Exclude `Image`; keep following prose |
| `![1.00](media://abc)` followed by prose | Exclude `1.00`; keep following prose |
| `<img src="..." alt="Image" />` followed by prose | Exclude image tag and attributes; keep following prose |
| `[label](https://example.com)` | Keep `label` |
| Only media with no prose | Return an empty preview so existing fallback copy can render |

## Non-Goals

- Do not change how cover images are selected.
- Do not mutate stored markdown.
- Do not change backend response contracts.

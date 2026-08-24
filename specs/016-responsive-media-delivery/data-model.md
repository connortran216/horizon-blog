# Frontend State Model: Responsive Media Delivery

## Resolved media source

```text
id: string
url: string
expiresAt: string
width?: number
height?: number
variants: Array<{
  url: string
  width: number
  height: number
  mimeType: "image/webp"
  sizeBytes: number
  expiresAt: string
}>
```

Rules:

- `url` remains the mandatory fallback.
- Invalid or duplicate variants are discarded; remaining variants are sorted by width.
- `srcset` is omitted when no valid variant remains.
- Cache expiry is the earliest valid expiry less a safety margin.
- A missing response item is not cached as success.

## Resolution queue

```text
pendingIds: Set<string>
waitersById: Map<string, Promise handlers>
cacheById: Map<string, { source, validUntil }>
inFlightById: Map<string, Promise<source | undefined>>
```

The queue flushes once per microtask and chunks requests to the server limit.

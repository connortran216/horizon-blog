# Frontend Contract: Responsive Media Delivery

## Backward-compatible resolve DTO

```json
{
  "items": [
    {
      "id": 101,
      "url": "https://storage.example/original",
      "expires_at": "2026-08-25T00:00:00Z",
      "width": 1672,
      "height": 941,
      "variants": [
        {
          "url": "https://storage.example/w640.webp",
          "expires_at": "2026-08-25T00:00:00Z",
          "width": 640,
          "height": 360,
          "mime_type": "image/webp",
          "size_bytes": 48123
        }
      ]
    }
  ]
}
```

Only `id`, `url`, and `expires_at` are required for compatibility.

## Rendering contract

- Fallback `src`: original `url`.
- `srcset`: ascending `${variant.url} ${variant.width}w` entries.
- Card `sizes`: surface-specific bounded viewport rules.
- Article `sizes`: `(max-width: 768px) 100vw, 736px`.
- Non-hero: `loading="lazy"`, `decoding="async"`.
- Hero: `loading="eager"`, `fetchpriority="high"`, `decoding="async"`.
- Width and height are applied only when both are positive.

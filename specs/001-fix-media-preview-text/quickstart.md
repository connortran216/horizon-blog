# Quickstart: Verify Media Preview Text

## Reproduce Before Fix

```bash
rtk node --experimental-strip-types - <<'NODE'
import { extractPreviewText } from './src/core/utils/markdown-preview.utils.ts'
console.log(extractPreviewText('![Image](media://abc)\nA practical guide'))
console.log(extractPreviewText('![1.00](media://abc)\nLeo à, Ngày con chào đời'))
NODE
```

Expected before fix: output starts with `Image` and `1.00`.

## Verify After Fix

```bash
rtk node --experimental-strip-types - <<'NODE'
import { extractPreviewText, buildExcerptFromMarkdown } from './src/core/utils/markdown-preview.utils.ts'
console.log(extractPreviewText('![Image](media://abc)\nA practical guide'))
console.log(extractPreviewText('![1.00](media://abc)\nLeo à, Ngày con chào đời'))
console.log(extractPreviewText('<img src="x" alt="Image" />\nActual opening paragraph'))
console.log(buildExcerptFromMarkdown('![Image](media://abc)\nA practical guide', 180))
NODE
```

Expected after fix:

- `A practical guide`
- `Leo à, Ngày con chào đời`
- `Actual opening paragraph`
- `A practical guide`

## Repo Validation

Use Node `v22.18.0` because the default Node `v25.9.0` currently fails before ESLint with `EBADF`.

```bash
PATH=/Users/trantuancanh/.nvm/versions/node/v22.18.0/bin:$PATH rtk yarn lint
PATH=/Users/trantuancanh/.nvm/versions/node/v22.18.0/bin:$PATH rtk yarn tsc --noEmit
```

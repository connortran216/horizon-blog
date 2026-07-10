export interface HeadingAnchor {
  id: string
  text: string
  depth: number
}

export const slugifyHeadingText = (text: string): string =>
  text
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

export const buildUniqueHeadingId = (
  text: string,
  slugCounts: Map<string, number>,
): string | null => {
  const baseSlug = slugifyHeadingText(text)
  if (!baseSlug) {
    return null
  }

  const count = slugCounts.get(baseSlug) || 0
  slugCounts.set(baseSlug, count + 1)
  return count === 0 ? baseSlug : `${baseSlug}-${count + 1}`
}

export const extractMarkdownHeadings = (
  markdown: string,
  allowedDepths: number[] = [2, 3],
): HeadingAnchor[] => {
  const allowed = new Set(allowedDepths)
  const slugCounts = new Map<string, number>()
  const headings: HeadingAnchor[] = []
  let inFence = false

  for (const line of markdown.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence
      continue
    }

    if (inFence) {
      continue
    }

    const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line)
    if (!match) {
      continue
    }

    const depth = match[1].length
    if (!allowed.has(depth)) {
      continue
    }

    const text = stripHeadingMarkdown(match[2])
    const id = buildUniqueHeadingId(text, slugCounts)
    if (!id || !text) {
      continue
    }

    headings.push({ id, text, depth })
  }

  return headings
}

const stripHeadingMarkdown = (value: string): string =>
  value
    .replace(/!\[([^\]]*)]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/[`*_~]/g, '')
    .trim()

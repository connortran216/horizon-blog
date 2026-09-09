export function partitionHomeWriting<T extends { id: string }>(posts: T[]) {
  const unique = [...new Map(posts.map((post) => [post.id, post])).values()]
  return { signature: unique[0], latest: unique.slice(1, 7) }
}

/** Clean summary artifacts without changing the original article. */
export function cleanHomeExcerpt(value: string): string {
  return value
    .split(/table of contents|mục lục/i)[0]
    .replace(/^\s*1\.00\s*/, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`#]/g, '')
    .replace(/\S*\uFFFD.*$/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

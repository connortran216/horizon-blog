export function partitionHomeWriting<T extends { id: string }>(posts: T[]) {
  const unique = [...new Map(posts.map((post) => [post.id, post])).values()]
  return { signature: unique[0], latest: unique.slice(1, 7) }
}

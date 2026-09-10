import { BlogArchiveOptions } from '../../core/types/blog.types'

interface AuthorSummaryPage {
  posts: Array<{
    author: {
      id?: number
      username: string
    }
  }>
  page: number
  limit: number
  total: number
}

type LoadAuthorSummaryPage = (options: BlogArchiveOptions) => Promise<AuthorSummaryPage>

const normalizeAuthorSlug = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const resolveAuthorIdFromSlug = async (
  authorSlug: string,
  loadPage: LoadAuthorSummaryPage,
  pageSize: number = 50,
) => {
  let page = 1

  while (true) {
    const result = await loadPage({ page, limit: pageSize })
    const matchingPost = result.posts.find(
      (post) => normalizeAuthorSlug(post.author.username) === authorSlug,
    )
    const authorId = matchingPost?.author.id

    if (typeof authorId === 'number' && Number.isInteger(authorId) && authorId > 0) {
      return String(authorId)
    }

    const effectiveLimit = Math.max(1, result.limit || pageSize)
    if (page * effectiveLimit >= result.total) {
      return ''
    }

    page += 1
  }
}

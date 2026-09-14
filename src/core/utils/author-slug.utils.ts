/**
 * The one definition of what `/authors/<slug>` means.
 *
 * An author archive URL is built from the author's display name and nothing
 * else - there is no author slug in the database and no endpoint that takes one.
 * `GET /users/{id}` and `GET /users/{id}/public-profile` accept an integer id
 * and answer `400 Invalid user ID` to anything else.
 *
 * The production server already resolves the gap the same way: the SEO gateway's
 * `getAuthorBySlug` (`scripts/seo/backend.mjs`) reads the published post list and
 * takes the id off the first post whose author name slugifies to the requested
 * slug. That is what a crawler gets today at `/authors/connor-tran`, so it is
 * what the application has to agree with. This module is that rule, written once,
 * so the link builder and the resolver cannot disagree about it.
 *
 * The honest fix is still a backend one - an endpoint that resolves an author by
 * slug or username - because a scan cannot find an author who has not published,
 * and because two authors whose names slugify alike are indistinguishable here.
 * Until that exists, the alternative is not a better resolution but a route that
 * carries the id, which would invalidate every canonical URL, sitemap entry and
 * feed link the gateway has already published.
 */

export const slugifyAuthorName = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

export interface AuthorSlugCandidate {
  readonly id?: number
  readonly name?: string
}

/**
 * An author id written directly into the route - `/authors/12`. The link builder
 * falls back to this when an author has no usable name, and it is the shape the
 * archive has always accepted, so it stays recognised.
 */
export const authorIdFromRouteParam = (routeValue: string | undefined): string =>
  typeof routeValue === 'string' && /^\d+$/.test(routeValue) ? routeValue : ''

/**
 * The id of the first candidate whose name slugifies to `slug`, or `''`.
 *
 * First rather than only: the post list is ordered, and picking the first match
 * makes the answer stable across pages instead of depending on how far the scan
 * happened to get.
 */
export const matchAuthorIdBySlug = (
  slug: string,
  candidates: readonly AuthorSlugCandidate[],
): string => {
  if (!slug) {
    return ''
  }

  const match = candidates.find(
    (candidate) =>
      typeof candidate.id === 'number' &&
      Number.isInteger(candidate.id) &&
      candidate.id > 0 &&
      Boolean(candidate.name) &&
      slugifyAuthorName(candidate.name as string) === slug,
  )

  return match ? String(match.id) : ''
}

import { describe, expect, it } from 'vitest'
import { authorIdFromRouteParam, matchAuthorIdBySlug, slugifyAuthorName } from './author-slug.utils'
import { getAuthorArchivePath } from '../../features/blog/blog.utils'

describe('slugifyAuthorName', () => {
  it('produces the slug the published URLs already use', () => {
    expect(slugifyAuthorName('Connor Tran')).toBe('connor-tran')
  })

  it('is the same function the archive path is built from', () => {
    // If these two ever disagree, every author link in the app points at a slug
    // the resolver cannot resolve - which is the class of bug uix.6 was.
    const name = 'Cảnh  Trần_Tuấn (Editor)'

    expect(getAuthorArchivePath(7, name)).toBe(`/authors/${slugifyAuthorName(name)}`)
  })

  it('falls back to the bare id when a name slugifies to nothing', () => {
    expect(getAuthorArchivePath(7, '???')).toBe('/authors/7')
  })
})

describe('authorIdFromRouteParam', () => {
  it('accepts a route that is already an id', () => {
    expect(authorIdFromRouteParam('12')).toBe('12')
  })

  it('rejects anything that is not one, including a slug that starts with digits', () => {
    expect(authorIdFromRouteParam('connor-tran')).toBe('')
    expect(authorIdFromRouteParam('12-connor')).toBe('')
    expect(authorIdFromRouteParam(undefined)).toBe('')
  })
})

describe('matchAuthorIdBySlug', () => {
  const candidates = [
    { id: 1, name: 'Connor Tran' },
    { id: 2, name: 'Cảnh Trần Tuấn' },
  ]

  it('finds the author a shared link names', () => {
    expect(matchAuthorIdBySlug('connor-tran', candidates)).toBe('1')
  })

  it('answers nothing for a slug nobody published under', () => {
    // The archive turns this into a 404 rather than "the author identifier is
    // invalid" - the identifier is fine, there is just no such author.
    expect(matchAuthorIdBySlug('nobody', candidates)).toBe('')
    expect(matchAuthorIdBySlug('', candidates)).toBe('')
  })

  it('ignores candidates without a usable id or name', () => {
    expect(matchAuthorIdBySlug('ghost', [{ name: 'Ghost' }, { id: 0, name: 'Ghost' }])).toBe('')
    expect(matchAuthorIdBySlug('connor-tran', [{ id: 3 }, ...candidates])).toBe('1')
  })

  it('takes the first match, so paging further cannot change the answer', () => {
    expect(
      matchAuthorIdBySlug('connor-tran', [
        { id: 1, name: 'Connor Tran' },
        { id: 9, name: 'connor tran' },
      ]),
    ).toBe('1')
  })
})

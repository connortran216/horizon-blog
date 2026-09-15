/**
 * The author archive, resolved from the URL and nothing else.
 *
 * The id used to come from React Router's location state, cached in
 * `sessionStorage` against the slug. Both are properties of a browsing session,
 * so the page only worked for a reader who had already clicked an author link in
 * this tab: a shared link, a bookmark, a search result and a crawler all arrived
 * with an empty cache and no history state, and got "The author identifier is
 * invalid."
 *
 * Neither is kept as a fast path. A fast path would leave the cold path - the one
 * that was broken - exercised only by strangers, which is how it broke without
 * anyone noticing.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { ApiError, getBlogService } from '../../core'
import { authorIdFromRouteParam } from '../../core/utils/author-slug.utils'
import {
  AuthorArchiveData,
  AuthorArchiveErrorState,
  AuthorArchiveUser,
  AuthorPostsPage,
} from './authors.types'

const DEFAULT_PAGE_SIZE = 6

const parsePage = (value: string | null) => {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

const mapPageError = (error: unknown): AuthorArchiveErrorState => {
  if (error instanceof ApiError) {
    if (error.status === 400) {
      return {
        statusCode: error.status,
        title: 'Invalid author',
        description: 'The author identifier is invalid.',
      }
    }

    if (error.status === 404) {
      return {
        statusCode: error.status,
        title: 'Author not found',
        description: 'This author page does not exist or is no longer available.',
      }
    }

    if (error.status >= 500) {
      return {
        statusCode: error.status,
        title: 'Could not load this author page',
        description: 'Please try again in a moment.',
      }
    }
  }

  return {
    title: 'Could not load this author page',
    description: error instanceof Error ? error.message : 'Please try again in a moment.',
  }
}

const mapPostsError = (error: unknown): AuthorArchiveErrorState => {
  if (error instanceof ApiError && (error.status === 400 || error.status === 404)) {
    return mapPageError(error)
  }

  return {
    statusCode: error instanceof ApiError ? error.status : undefined,
    title: "Could not load this author's blogs",
    description: 'Please try again, or browse another author.',
  }
}

export const useAuthorArchive = (pageSize: number = DEFAULT_PAGE_SIZE) => {
  const { authorName } = useParams<{ authorName: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const [profile, setProfile] = useState<AuthorArchiveUser | null>(null)
  const [postsPage, setPostsPage] = useState<AuthorPostsPage | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [postsLoading, setPostsLoading] = useState(true)
  const [pageErrorState, setPageErrorState] = useState<AuthorArchiveErrorState | null>(null)
  const [postsErrorState, setPostsErrorState] = useState<AuthorArchiveErrorState | null>(null)
  const [postsRequestVersion, setPostsRequestVersion] = useState(0)

  const currentPage = useMemo(() => parsePage(searchParams.get('page')), [searchParams])
  const routeAuthorId = useMemo(() => authorIdFromRouteParam(authorName), [authorName])
  const [authorId, setAuthorId] = useState(routeAuthorId)
  const [resolvingAuthor, setResolvingAuthor] = useState(!routeAuthorId)

  useEffect(() => {
    if (routeAuthorId) {
      setAuthorId(routeAuthorId)
      setResolvingAuthor(false)
      return
    }

    let isCancelled = false

    setAuthorId('')
    setResolvingAuthor(true)
    setPageErrorState(null)

    void getBlogService()
      .resolveAuthorIdBySlug(authorName || '')
      .then((resolved) => {
        if (isCancelled) return
        setAuthorId(resolved)
      })
      .catch((error: unknown) => {
        if (isCancelled) return
        setAuthorId('')
        setPageErrorState(mapPageError(error))
      })
      .finally(() => {
        if (!isCancelled) {
          setResolvingAuthor(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [authorName, routeAuthorId])

  useEffect(() => {
    // Nothing to ask for until the slug has been turned into an id, and nothing
    // to report either - the resolver records its own failure.
    if (resolvingAuthor) {
      return
    }

    if (!authorId) {
      setProfile(null)
      setPostsPage(null)
      setProfileLoading(false)
      setPostsLoading(false)
      return
    }

    let isCancelled = false

    setProfile(null)
    setProfileLoading(true)
    setPageErrorState(null)
    setPostsErrorState(null)

    void getBlogService()
      .getPublicAuthorProfile(authorId)
      .then((data) => {
        if (isCancelled) return
        setProfile(data)
      })
      .catch((error: unknown) => {
        if (isCancelled) return
        setProfile(null)
        setPageErrorState(mapPageError(error))
      })
      .finally(() => {
        if (!isCancelled) {
          setProfileLoading(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [authorId, resolvingAuthor])

  useEffect(() => {
    if (resolvingAuthor || !authorId) {
      return
    }

    let isCancelled = false

    setPostsPage(null)
    setPostsLoading(true)
    setPostsErrorState(null)

    void getBlogService()
      .getPublicAuthorPosts(authorId, currentPage, pageSize)
      .then((data) => {
        if (isCancelled) return
        setPostsPage(data)
      })
      .catch((error: unknown) => {
        if (isCancelled) return

        const mappedError = mapPostsError(error)

        if (mappedError.statusCode === 400 || mappedError.statusCode === 404) {
          setPageErrorState(mappedError)
          return
        }

        setPostsErrorState(mappedError)
      })
      .finally(() => {
        if (!isCancelled) {
          setPostsLoading(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [authorId, currentPage, pageSize, postsRequestVersion, resolvingAuthor])

  const setPage = useCallback(
    (page: number) => {
      const nextPage = Math.max(1, page)
      const nextSearchParams = new URLSearchParams(searchParams)

      if (nextPage === 1) {
        nextSearchParams.delete('page')
      } else {
        nextSearchParams.set('page', String(nextPage))
      }

      setSearchParams(nextSearchParams)
    },
    [searchParams, setSearchParams],
  )

  const retryPosts = useCallback(() => {
    setPostsRequestVersion((value) => value + 1)
  }, [])

  const archive = useMemo<AuthorArchiveData | null>(() => {
    if (!profile) {
      return null
    }

    return {
      user: profile,
      posts: postsPage?.posts || [],
      page: postsPage?.page || currentPage,
      limit: postsPage?.limit || pageSize,
      total: postsPage?.total || 0,
    }
  }, [currentPage, pageSize, postsPage, profile])

  const totalPages = postsPage ? Math.max(1, Math.ceil(postsPage.total / postsPage.limit)) : 1

  return {
    archive,
    authorId,
    currentPage,
    totalPages,
    // Resolving the slug is part of loading the page, not a state of its own:
    // until it finishes there is no profile to show and no reason to say so.
    profileLoading: profileLoading || resolvingAuthor,
    postsLoading: postsLoading || resolvingAuthor,
    pageErrorState,
    postsErrorState,
    setPage,
    retryPosts,
  }
}

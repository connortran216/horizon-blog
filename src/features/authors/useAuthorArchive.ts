import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useParams, useSearchParams } from 'react-router-dom'
import { ApiError, getBlogService } from '../../core'
import {
  AuthorArchiveData,
  AuthorArchiveErrorState,
  AuthorArchiveUser,
  AuthorPostsPage,
} from './authors.types'

const DEFAULT_PAGE_SIZE = 6
const AUTHOR_ROUTE_ID_CACHE_KEY = 'horizon_blog_author_route_ids'

const parsePage = (value: string | null) => {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

const toAuthorIdString = (value: unknown) => {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return String(value)
  }

  if (typeof value === 'string' && /^\d+$/.test(value)) {
    return value
  }

  return ''
}

const readCachedAuthorId = (authorName: string | undefined) => {
  if (!authorName || typeof window === 'undefined') {
    return ''
  }

  try {
    const raw = window.sessionStorage.getItem(AUTHOR_ROUTE_ID_CACHE_KEY)
    if (!raw) {
      return ''
    }

    const parsed = JSON.parse(raw) as Record<string, unknown>
    return toAuthorIdString(parsed[authorName])
  } catch {
    return ''
  }
}

const writeCachedAuthorId = (authorName: string | undefined, authorId: string) => {
  if (!authorName || !authorId || typeof window === 'undefined') {
    return
  }

  try {
    const raw = window.sessionStorage.getItem(AUTHOR_ROUTE_ID_CACHE_KEY)
    const parsed = raw ? (JSON.parse(raw) as Record<string, unknown>) : {}
    parsed[authorName] = authorId
    window.sessionStorage.setItem(AUTHOR_ROUTE_ID_CACHE_KEY, JSON.stringify(parsed))
  } catch {
    // Ignore cache persistence failures and rely on in-memory route state instead.
  }
}

const parseAuthorId = (
  routeValue: string | undefined,
  stateValue: unknown,
  cachedValue: string,
) => {
  const fromState = toAuthorIdString(stateValue)
  if (fromState) {
    return fromState
  }

  if (cachedValue) {
    return cachedValue
  }

  return toAuthorIdString(routeValue)
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
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [profile, setProfile] = useState<AuthorArchiveUser | null>(null)
  const [postsPage, setPostsPage] = useState<AuthorPostsPage | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [postsLoading, setPostsLoading] = useState(true)
  const [pageErrorState, setPageErrorState] = useState<AuthorArchiveErrorState | null>(null)
  const [postsErrorState, setPostsErrorState] = useState<AuthorArchiveErrorState | null>(null)
  const [postsRequestVersion, setPostsRequestVersion] = useState(0)

  const currentPage = useMemo(() => parsePage(searchParams.get('page')), [searchParams])
  const routeState = location.state as { authorId?: number | string } | null
  const cachedAuthorId = useMemo(() => readCachedAuthorId(authorName), [authorName])
  const authorId = useMemo(
    () => parseAuthorId(authorName, routeState?.authorId, cachedAuthorId),
    [authorName, cachedAuthorId, routeState?.authorId],
  )

  useEffect(() => {
    if (authorName && authorId && !/^\d+$/.test(authorName)) {
      writeCachedAuthorId(authorName, authorId)
    }
  }, [authorId, authorName])

  useEffect(() => {
    if (!authorId) {
      setProfile(null)
      setPostsPage(null)
      setPageErrorState({
        statusCode: 400,
        title: 'Invalid author',
        description: 'The author identifier is invalid.',
      })
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
  }, [authorId])

  useEffect(() => {
    if (!authorId) {
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
  }, [authorId, currentPage, pageSize, postsRequestVersion])

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
    profileLoading,
    postsLoading,
    pageErrorState,
    postsErrorState,
    setPage,
    retryPosts,
  }
}

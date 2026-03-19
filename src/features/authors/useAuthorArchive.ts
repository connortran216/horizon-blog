import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { ApiError, getBlogService } from '../../core'
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
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const [profile, setProfile] = useState<AuthorArchiveUser | null>(null)
  const [postsPage, setPostsPage] = useState<AuthorPostsPage | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [postsLoading, setPostsLoading] = useState(true)
  const [pageErrorState, setPageErrorState] = useState<AuthorArchiveErrorState | null>(null)
  const [postsErrorState, setPostsErrorState] = useState<AuthorArchiveErrorState | null>(null)
  const [postsRequestVersion, setPostsRequestVersion] = useState(0)

  const currentPage = useMemo(() => parsePage(searchParams.get('page')), [searchParams])

  useEffect(() => {
    if (!id) {
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
      .getPublicAuthorProfile(id)
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
  }, [id])

  useEffect(() => {
    if (!id) {
      return
    }

    let isCancelled = false

    setPostsPage(null)
    setPostsLoading(true)
    setPostsErrorState(null)

    void getBlogService()
      .getPublicAuthorPosts(id, currentPage, pageSize)
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
  }, [currentPage, id, pageSize, postsRequestVersion])

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
    authorId: id || '',
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

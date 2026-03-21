import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BlogArchivePost, BlogArchiveTag } from './blog.types'
import { fetchBlogArchivePosts, fetchPopularTags } from './blog.api'

const DEFAULT_PAGE_SIZE = 6
const SEARCH_DEBOUNCE_MS = 350

const parsePage = (value: string | null) => {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

const parseTags = (value: string | null) =>
  value
    ?.split(',')
    .map((tag) => tag.trim())
    .filter(Boolean) ?? []

export const useBlogArchive = (pageSize: number = DEFAULT_PAGE_SIZE) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '')
  const [posts, setPosts] = useState<BlogArchivePost[]>([])
  const [popularTags, setPopularTags] = useState<BlogArchiveTag[]>([])
  const [loading, setLoading] = useState(true)
  const [tagsLoading, setTagsLoading] = useState(true)
  const [page, setPageState] = useState(parsePage(searchParams.get('page')))
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const query = useMemo(() => searchParams.get('q') ?? '', [searchParams])
  const activeTags = useMemo(() => parseTags(searchParams.get('tags')), [searchParams])
  const hasActiveFilters = Boolean(query || activeTags.length > 0)

  useEffect(() => {
    setSearchInput(query)
    setPageState(parsePage(searchParams.get('page')))
  }, [query, searchParams])

  useEffect(() => {
    const currentQuery = searchParams.get('q') ?? ''
    const trimmedInput = searchInput.trim()

    if (trimmedInput === currentQuery) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      const next = new URLSearchParams(searchParams)
      if (trimmedInput) {
        next.set('q', trimmedInput)
      } else {
        next.delete('q')
      }
      next.delete('page')
      setSearchParams(next, { replace: true })
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timeoutId)
  }, [searchInput, searchParams, setSearchParams])

  useEffect(() => {
    let cancelled = false

    const loadPosts = async () => {
      try {
        setLoading(true)
        const response = await fetchBlogArchivePosts({
          q: query || undefined,
          tags: activeTags,
          page,
          limit: pageSize,
        })

        if (cancelled) return

        setPosts(response.data)
        setTotal(response.total)
        setTotalPages(Math.max(1, Math.ceil(response.total / pageSize)))
      } catch (error) {
        if (cancelled) return
        console.error('Failed to load blog archive posts:', error)
        setPosts([])
        setTotal(0)
        setTotalPages(1)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadPosts()

    return () => {
      cancelled = true
    }
  }, [activeTags, page, pageSize, query])

  useEffect(() => {
    let cancelled = false

    const loadPopularTags = async () => {
      try {
        setTagsLoading(true)
        const data = await fetchPopularTags()
        if (!cancelled) {
          setPopularTags(data)
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load popular tags:', error)
          setPopularTags([])
        }
      } finally {
        if (!cancelled) {
          setTagsLoading(false)
        }
      }
    }

    void loadPopularTags()

    return () => {
      cancelled = true
    }
  }, [])

  const setPage = (nextPage: number) => {
    const normalizedPage = Math.max(1, nextPage)
    const next = new URLSearchParams(searchParams)
    if (normalizedPage === 1) {
      next.delete('page')
    } else {
      next.set('page', String(normalizedPage))
    }
    setSearchParams(next)
  }

  const toggleTag = (tagName: string) => {
    const next = new URLSearchParams(searchParams)
    const normalized = tagName.trim().toLowerCase()
    const exists = activeTags.includes(normalized)
    const nextTags = exists
      ? activeTags.filter((tag) => tag !== normalized)
      : [...activeTags, normalized]

    if (nextTags.length > 0) {
      next.set('tags', nextTags.join(','))
    } else {
      next.delete('tags')
    }

    next.delete('page')
    setSearchParams(next)
  }

  const clearQuery = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('q')
    next.delete('page')
    setSearchParams(next)
  }

  const removeTag = (tagName: string) => {
    const next = new URLSearchParams(searchParams)
    const nextTags = activeTags.filter((tag) => tag !== tagName)

    if (nextTags.length > 0) {
      next.set('tags', nextTags.join(','))
    } else {
      next.delete('tags')
    }

    next.delete('page')
    setSearchParams(next)
  }

  const clearAllFilters = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('q')
    next.delete('tags')
    next.delete('page')
    setSearchParams(next)
  }

  return {
    searchInput,
    setSearchInput,
    query,
    posts,
    popularTags,
    loading,
    tagsLoading,
    page,
    totalPages,
    total,
    activeTags,
    hasActiveFilters,
    setPage,
    toggleTag,
    clearQuery,
    removeTag,
    clearAllFilters,
  }
}

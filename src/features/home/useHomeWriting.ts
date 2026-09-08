import { useEffect, useState } from 'react'
import { getBlogService, type BlogPostSummary } from '../../core'
import { partitionHomeWriting } from './home.presentation'
export function useHomeWriting() {
  const [posts, setPosts] = useState<BlogPostSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    setLoading(true)
    setError(false)
    getBlogService()
      .getPublishedArchivePosts({ page: 1, limit: 9 })
      .then((items) => {
        if (active) setPosts(items.posts)
      })
      .catch(() => {
        if (active) setError(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [attempt])
  return { ...partitionHomeWriting(posts), loading, error, retry: () => setAttempt((n) => n + 1) }
}

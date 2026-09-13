/**
 * The public reading page.
 *
 * Composition only. `useBlogPostDetail`, `useSeriesContext`,
 * `useReaderSession`, `useReaderInteractions`, `useResolvedMarkdownMedia` and
 * the related-posts request are untouched - what changed is which frame draws
 * the result.
 *
 * Two facts the hook already carried are now distinguished on screen. A blog
 * that is not published is missing; a request that failed is an error. They
 * used to render the same grey sentence, so a reader could not tell "this does
 * not exist" from "try again in a moment".
 */

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BlogReaderFrame from '../components/BlogReaderFrame'
import { useBlogPostDetail } from '../useBlogPostDetail'
import { getPostAuthorArchivePath, getPostAuthorArchiveState } from '../blog.utils'
import { useResolvedMarkdownMedia } from '../../media/useResolvedMarkdown'
import ReaderInteractionBar from '../../reader-interactions/components/ReaderInteractionBar'
import { useReaderInteractions } from '../../reader-interactions/useReaderInteractions'
import { useReaderSession } from '../../reader-interactions/useReaderSession'
import RelatedPosts from '../components/RelatedPosts'
import { BlogPostSummary } from '../../../core/types/blog.types'
import { extractMarkdownHeadings, getBlogService } from '../../../core'
import { useAuth } from '../../../context/AuthContext'
import CommentSection from '../../comments/components/CommentSection'
import SeriesContextCard from '../../series/components/SeriesContextCard'
import { useSeriesContext } from '../../series/useSeriesContext'

/** Fewer than three headings is a list, not a map. */
const MIN_TABLE_OF_CONTENTS_HEADINGS = 3

const BlogDetailPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { post, loading, emptyStateMessage, statusCode } = useBlogPostDetail()
  const [relatedPosts, setRelatedPosts] = useState<BlogPostSummary[]>([])
  const seriesContext = useSeriesContext(post?.id)

  const resolvedMedia = useResolvedMarkdownMedia(post?.content_markdown || '')
  const allHeadings = useMemo(
    () => extractMarkdownHeadings(post?.content_markdown || ''),
    [post?.content_markdown],
  )
  const headings = useMemo(
    () => (allHeadings.length >= MIN_TABLE_OF_CONTENTS_HEADINGS ? allHeadings : []),
    [allHeadings],
  )
  const authorArchivePath = post ? getPostAuthorArchivePath(post) : null
  const authorArchiveState = post ? getPostAuthorArchiveState(post) : undefined
  const shareUrl = typeof window === 'undefined' ? undefined : window.location.href
  const readerSession = useReaderSession({
    postId: post?.id,
    enabled: Boolean(post),
  })
  const readerInteractions = useReaderInteractions({
    postId: post?.id,
    title: post?.title,
    shareUrl,
    sessionId: readerSession.sessionId,
    enabled: Boolean(post),
  })

  useEffect(() => {
    if (!post?.id) {
      setRelatedPosts([])
      return
    }

    let isCurrent = true
    getBlogService()
      .getRelatedPosts(String(post.id), 3)
      .then((posts) => {
        if (isCurrent) {
          setRelatedPosts(posts)
        }
      })
      .catch(() => {
        if (isCurrent) {
          setRelatedPosts([])
        }
      })

    return () => {
      isCurrent = false
    }
  }, [post?.id])

  /*
   * A 404 is a blog that is not published; anything else that stopped the
   * request from arriving is a failure the reader may be able to retry. The
   * hook has always told these apart - the page never showed the difference.
   */
  const isMissing = !loading && !post && (statusCode === 404 || statusCode === undefined)
  const loadError = !loading && !post && !isMissing ? emptyStateMessage : null

  return (
    <BlogReaderFrame
      post={post}
      loading={loading}
      isMissing={isMissing}
      loadError={loadError}
      resolvedContent={resolvedMedia.content}
      resolvedMedia={resolvedMedia.sources}
      onBack={() => navigate('/blog')}
      backLabel="Back to Blog"
      authorArchivePath={authorArchivePath}
      authorArchiveState={authorArchiveState}
      showReadingProgress={true}
      headings={headings}
      onReadingProgressChange={readerSession.handleReadingProgressChange}
      onContentClick={readerSession.handleContentClick}
      interactionSection={
        <ReaderInteractionBar
          state={readerInteractions.state}
          isHeartLoading={readerInteractions.isHeartLoading}
          isShareLoading={readerInteractions.isShareLoading}
          isAuthenticated={Boolean(user)}
          onToggleHeart={readerInteractions.toggleHeart}
          onShare={readerInteractions.share}
        />
      }
      discussionSection={post?.id ? <CommentSection postId={post.id} /> : undefined}
      seriesSection={seriesContext ? <SeriesContextCard context={seriesContext} /> : undefined}
      relatedSection={relatedPosts.length > 0 ? <RelatedPosts posts={relatedPosts} /> : undefined}
    />
  )
}

export default BlogDetailPage

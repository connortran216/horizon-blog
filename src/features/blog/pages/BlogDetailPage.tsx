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
import { getPostAuthorArchivePath } from '../blog.utils'
import { useResolvedMarkdownMedia } from '../../media/useResolvedMarkdown'
import ReaderInteractionBar from '../../reader-interactions/components/ReaderInteractionBar'
import { useReaderInteractions } from '../../reader-interactions/useReaderInteractions'
import { useReaderSession } from '../../reader-interactions/useReaderSession'
import RelatedPosts from '../components/RelatedPosts'
import { BlogPostSummary } from '../../../core/types/blog.types'
import { extractMarkdownHeadings, getBlogService } from '../../../core'
import { extractArticleCoverImage } from '../articleCoverImage.logic'
import { articleCoverFrom } from '../articleCover.presentation'
import { useAuth } from '../../../context/AuthContext'
import CommentSection from '../../comments/components/CommentSection'
import SeriesContextCard from '../../series/components/SeriesContextCard'
import { useSeriesContext } from '../../series/useSeriesContext'
import { postCoverTransitionName } from '../../../design-system'

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
  /*
   * `/posts/:id` carries no dedicated cover field - only `content_markdown` -
   * so the article's cover is a promotion of its own opening image, when the
   * body opens with one standing alone (see `articleCoverImage.logic.ts` for
   * exactly what qualifies). Read from the same already-resolved markdown
   * `Prose` renders, so a `media://` token is already a real URL by the time
   * this runs.
   *
   * The promoted block is removed from `articleContent` below - otherwise the
   * same picture would render twice, once lifted into the cover slot and
   * once more at the top of the article `Prose` draws from `resolvedContent`.
   * A post that does not open with a standalone image is untouched: no cover,
   * and the body renders exactly as it always has.
   */
  const articleCover = useMemo(
    () => extractArticleCoverImage(resolvedMedia.content),
    [resolvedMedia.content],
  )
  const articleContent = articleCover ? articleCover.content : resolvedMedia.content
  /*
   * Shaped with its resized variants, not just the URL the markdown carries -
   * that URL is the original upload, and rendering it bare fetched a 1 MB PNG
   * into an 873px frame. See `articleCoverFrom`.
   */
  const coverImage =
    post && articleCover
      ? articleCoverFrom(articleCover.cover, post.title, resolvedMedia.sources)
      : null
  /**
   * The caption the author wrote directly under the cover, when there is one
   * - see `extractArticleCoverImage` for exactly what qualifies. Rendered
   * beside the image in the `cover` slot rather than left in `articleContent`
   * as the article's first paragraph, so the two stay visually together
   * instead of separating across the identity and metadata between them.
   */
  const coverCaption = articleCover?.caption ?? null
  const coverTransitionName = post ? postCoverTransitionName(String(post.id)) : null
  const authorArchivePath = post ? getPostAuthorArchivePath(post) : null
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
      resolvedContent={articleContent}
      resolvedMedia={resolvedMedia.sources}
      coverImage={coverImage}
      coverCaption={coverCaption}
      coverTransitionName={coverTransitionName}
      onBack={() => navigate('/blog')}
      backLabel="Back to Blog"
      authorArchivePath={authorArchivePath}
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

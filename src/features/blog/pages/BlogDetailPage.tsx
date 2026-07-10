import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BlogReaderFrame from '../components/BlogReaderFrame'
import { useBlogPostDetail } from '../useBlogPostDetail'
import { getPostAuthorArchivePath, getPostAuthorArchiveState } from '../blog.utils'
import { useResolvedMarkdown } from '../../media/useResolvedMarkdown'
import ReaderInteractionBar from '../../reader-interactions/components/ReaderInteractionBar'
import { useReaderInteractions } from '../../reader-interactions/useReaderInteractions'
import { useReaderSession } from '../../reader-interactions/useReaderSession'
import RelatedPosts from '../components/RelatedPosts'
import { BlogPostSummary } from '../../../core/types/blog.types'
import { extractMarkdownHeadings, getBlogService } from '../../../core'
import TableOfContents from '../components/TableOfContents'

const BlogDetailPage = () => {
  const navigate = useNavigate()
  const { post, loading, emptyStateMessage } = useBlogPostDetail()
  const [relatedPosts, setRelatedPosts] = useState<BlogPostSummary[]>([])

  const resolvedContent = useResolvedMarkdown(post?.content_markdown || '')
  const tableOfContentsItems = useMemo(
    () => extractMarkdownHeadings(post?.content_markdown || ''),
    [post?.content_markdown],
  )
  const shouldShowTableOfContents = tableOfContentsItems.length >= 3
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

  return (
    <BlogReaderFrame
      post={post}
      loading={loading}
      resolvedContent={resolvedContent}
      onBack={() => navigate('/blog')}
      backLabel="Back to Blog"
      emptyLabel={emptyStateMessage}
      authorArchivePath={authorArchivePath}
      authorArchiveState={authorArchiveState}
      showReadingProgress={true}
      onReadingProgressChange={readerSession.handleReadingProgressChange}
      onContentClick={readerSession.handleContentClick}
      interactionSection={
        <ReaderInteractionBar
          state={readerInteractions.state}
          isHeartLoading={readerInteractions.isHeartLoading}
          isShareLoading={readerInteractions.isShareLoading}
          onToggleHeart={readerInteractions.toggleHeart}
          onShare={readerInteractions.share}
        />
      }
      tableOfContentsRail={
        shouldShowTableOfContents ? <TableOfContents items={tableOfContentsItems} /> : undefined
      }
      tableOfContentsInline={
        shouldShowTableOfContents ? (
          <TableOfContents items={tableOfContentsItems} variant="collapse" />
        ) : undefined
      }
      relatedSection={relatedPosts.length > 0 ? <RelatedPosts posts={relatedPosts} /> : undefined}
      bottomPadding={true}
    />
  )
}

export default BlogDetailPage

import { useNavigate } from 'react-router-dom'
import BlogReaderFrame from '../components/BlogReaderFrame'
import { useBlogPostDetail } from '../useBlogPostDetail'
import { getPostAuthorArchivePath, getPostAuthorArchiveState } from '../blog.utils'
import { useResolvedMarkdown } from '../../media/useResolvedMarkdown'
import ReaderInteractionBar from '../../reader-interactions/components/ReaderInteractionBar'
import { useReaderInteractions } from '../../reader-interactions/useReaderInteractions'
import { useReaderSession } from '../../reader-interactions/useReaderSession'

const BlogDetailPage = () => {
  const navigate = useNavigate()
  const { post, loading, emptyStateMessage } = useBlogPostDetail()

  const resolvedContent = useResolvedMarkdown(post?.content_markdown || '')
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
      bottomPadding={true}
    />
  )
}

export default BlogDetailPage

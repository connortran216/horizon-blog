import { useNavigate } from 'react-router-dom'
import BlogReaderFrame from '../components/BlogReaderFrame'
import { useBlogPostDetail } from '../useBlogPostDetail'
import { getPostAuthorArchivePath, getPostAuthorArchiveState } from '../blog.utils'
import { useResolvedMarkdown } from '../../media/useResolvedMarkdown'

const BlogDetailPage = () => {
  const navigate = useNavigate()
  const { post, loading, emptyStateMessage } = useBlogPostDetail()

  const resolvedContent = useResolvedMarkdown(post?.content_markdown || '')
  const authorArchivePath = post ? getPostAuthorArchivePath(post) : null
  const authorArchiveState = post ? getPostAuthorArchiveState(post) : undefined

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
      bottomPadding={true}
    />
  )
}

export default BlogDetailPage

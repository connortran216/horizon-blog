import { useNavigate } from 'react-router-dom'
import BlogReaderFrame from '../components/BlogReaderFrame'
import { useBlogPostDetail } from '../useBlogPostDetail'
import { useResolvedMarkdown } from '../../media/useResolvedMarkdown'

const BlogDetailPage = () => {
  const navigate = useNavigate()
  const { post, loading } = useBlogPostDetail({
    redirectPath: '/blog',
  })

  const resolvedContent = useResolvedMarkdown(post?.content_markdown || '', {
    postId: post?.id ?? null,
  })

  return (
    <BlogReaderFrame
      post={post}
      loading={loading}
      resolvedContent={resolvedContent}
      onBack={() => navigate('/blog')}
      backLabel="Back to Blog"
      emptyLabel="Post not found"
      showReadingProgress={true}
      bottomPadding={true}
    />
  )
}

export default BlogDetailPage

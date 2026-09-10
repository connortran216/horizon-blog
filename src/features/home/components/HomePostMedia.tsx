import { type BlogPostSummary } from '../../../core'
import PostMediaFrame from '../../media/components/PostMediaFrame'

export function HomePostMedia({
  post,
  priority = false,
}: {
  post: BlogPostSummary
  priority?: boolean
}) {
  return (
    <PostMediaFrame
      rawSource={post.featuredImage}
      title={post.title}
      priority={priority}
      sizes={priority ? '(max-width:800px) 100vw, 50vw' : '(max-width:680px) 100vw, 33vw'}
      className="home-media"
    />
  )
}
export function HomePostMeta({ post }: { post: BlogPostSummary }) {
  return (
    <div className="signal-meta">
      <span>{post.author.username}</span>
      <span aria-hidden="true">·</span>
      <time dateTime={post.createdAt}>
        {new Date(post.createdAt).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}
      </time>
      <span aria-hidden="true">·</span>
      <span>{post.readingTime || 1} min read</span>
    </div>
  )
}

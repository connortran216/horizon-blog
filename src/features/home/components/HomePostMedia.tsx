import { Image, useColorModeValue } from '@chakra-ui/react'
import { type BlogPostSummary } from '../../../core'
import { useResolvedCoverMedia } from '../../media/useResolvedCoverImage'
import { getResponsiveImageAttributes } from '../../media/media.presentation'
import { useState } from 'react'
export function HomePostMedia({
  post,
  priority = false,
}: {
  post: BlogPostSummary
  priority?: boolean
}) {
  const media = useResolvedCoverMedia(post.featuredImage)
  const fallback = useColorModeValue('/signal/hero-light.png', '/signal/hero-dark.png')
  const [failed, setFailed] = useState<string>()
  const attrs = media
    ? getResponsiveImageAttributes(
        media,
        priority ? '(max-width: 800px) 100vw, 50vw' : '128px',
        priority,
      )
    : undefined
  const valid = attrs && failed !== attrs.src
  return (
    <Image
      {...(valid ? attrs : {})}
      src={valid ? attrs.src : fallback}
      alt=""
      width="100%"
      height="100%"
      objectFit={valid ? 'contain' : 'cover'}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onError={valid ? () => setFailed(attrs.src) : undefined}
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

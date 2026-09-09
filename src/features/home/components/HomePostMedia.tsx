import { Image, Button } from '@chakra-ui/react'
import { type BlogPostSummary } from '../../../core'
import { resolveMediaSources, type ResolvedMediaSource } from '../../media/media.api'
import { getResponsiveImageAttributes } from '../../media/media.presentation'
import { useEffect, useState } from 'react'

export function HomePostMedia({
  post,
  priority = false,
}: {
  post: BlogPostSummary
  priority?: boolean
}) {
  const [attempt, setAttempt] = useState(0)
  const [media, setMedia] = useState<ResolvedMediaSource | undefined>(() =>
    post.featuredImage && !post.featuredImage.startsWith('media://')
      ? { id: '', url: post.featuredImage, variants: [] }
      : undefined,
  )
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  useEffect(() => {
    let active = true
    setStatus('loading')
    setMedia(undefined)
    const timer = window.setTimeout(() => {
      if (active) setStatus((current) => (current === 'ready' ? current : 'error'))
    }, 20000)
    const load = async () => {
      const raw = post.featuredImage
      if (!raw) return
      try {
        const id = raw.match(/^media:\/\/([a-zA-Z0-9_-]+)$/)?.[1]
        const source = id
          ? (await resolveMediaSources([id], attempt > 0))[id]
          : { id: '', url: raw, variants: [] }
        if (active) {
          window.clearTimeout(timer)
          setMedia(source)
          if (!source) setStatus('error')
        }
      } catch {
        if (active) setStatus('error')
      }
    }
    void load()
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [post.featuredImage, attempt])
  const attrs = media
    ? getResponsiveImageAttributes(
        media,
        priority ? '(max-width:800px) 100vw, 50vw' : '(max-width:680px) 100vw, 33vw',
        priority,
      )
    : undefined
  if (!post.featuredImage)
    return (
      <div className="home-media-fallback">
        <span>HORIZON / WRITING</span>
        <strong>{post.title}</strong>
      </div>
    )
  return (
    <div
      className="home-media"
      style={{
        aspectRatio: media?.width && media?.height ? `${media.width} / ${media.height}` : '16 / 9',
      }}
    >
      {status === 'loading' && (
        <div className="home-media-loading" role="status" aria-label="Đang tải ảnh" />
      )}
      {attrs && status !== 'error' && (
        <Image
          key={attempt}
          {...attrs}
          alt=""
          width="100%"
          height="100%"
          objectFit="contain"
          className={status === 'ready' ? 'home-media-image is-ready' : 'home-media-image'}
          onLoad={() => setStatus('ready')}
          onError={() => setStatus('error')}
        />
      )}
      {status === 'error' && (
        <div className="home-media-error">
          <span>Ảnh chưa tải được</span>
          <Button size="sm" onClick={() => setAttempt((n) => n + 1)}>
            Thử lại
          </Button>
        </div>
      )}
    </div>
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

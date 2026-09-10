import { Button, Image } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { getResponsiveImageAttributes } from '../media.presentation'
import { resolveMediaSources, type ResolvedMediaSource } from '../media.api'
import './post-media-frame.css'

type MediaStatus = 'loading' | 'ready' | 'error' | 'empty'

interface PostMediaFrameProps {
  rawSource?: string
  title: string
  alt?: string
  priority?: boolean
  sizes?: string
  fit?: 'contain' | 'cover'
  className?: string
}

const getDirectSource = (rawSource?: string): ResolvedMediaSource | undefined =>
  rawSource && !rawSource.startsWith('media://')
    ? { id: '', url: rawSource, variants: [] }
    : undefined

const getMediaId = (rawSource?: string) => rawSource?.match(/^media:\/\/([a-zA-Z0-9_-]+)$/)?.[1]

export default function PostMediaFrame({
  rawSource,
  title,
  alt = '',
  priority = false,
  sizes = '(max-width: 800px) 100vw, 50vw',
  fit = 'contain',
  className = '',
}: PostMediaFrameProps) {
  const directSource = useMemo(() => getDirectSource(rawSource), [rawSource])
  const [attempt, setAttempt] = useState(0)
  const [media, setMedia] = useState<ResolvedMediaSource | undefined>(directSource)
  const [status, setStatus] = useState<MediaStatus>(rawSource ? 'loading' : 'empty')

  useEffect(() => {
    let active = true
    const mediaId = getMediaId(rawSource)

    if (!rawSource) {
      setMedia(undefined)
      setStatus('empty')
      return () => {
        active = false
      }
    }

    if (!mediaId) {
      setMedia(getDirectSource(rawSource))
      setStatus('loading')
      return () => {
        active = false
      }
    }

    setMedia(undefined)
    setStatus('loading')

    void resolveMediaSources([mediaId], attempt > 0)
      .then((sources) => {
        if (!active) return
        const resolved = sources[mediaId]
        setMedia(resolved)
        setStatus(resolved ? 'loading' : 'error')
      })
      .catch(() => {
        if (active) setStatus('error')
      })

    return () => {
      active = false
    }
  }, [attempt, rawSource])

  const imageAttributes = media ? getResponsiveImageAttributes(media, sizes, priority) : undefined

  return (
    <div
      className={`post-media-frame ${className}`.trim()}
      data-media-state={status}
      style={{
        aspectRatio: media?.width && media?.height ? `${media.width} / ${media.height}` : '16 / 9',
      }}
    >
      {status === 'empty' ? (
        <div className="post-media-fallback">
          <span>HORIZON / WRITING</span>
          <strong>{title}</strong>
        </div>
      ) : null}

      {status === 'loading' ? (
        <div className="post-media-loading" role="status" aria-label="Loading cover image" />
      ) : null}

      {imageAttributes && status !== 'error' ? (
        <Image
          key={`${rawSource}-${attempt}`}
          {...imageAttributes}
          alt={alt}
          className={`post-media-image ${status === 'ready' ? 'is-ready' : ''}`}
          objectFit={fit}
          onLoad={() => setStatus('ready')}
          onError={() => setStatus('error')}
        />
      ) : null}

      {status === 'error' ? (
        <div className="post-media-error" role="status">
          <span>Cover image unavailable</span>
          <Button size="sm" borderRadius="full" onClick={() => setAttempt((value) => value + 1)}>
            Try again
          </Button>
        </div>
      ) : null}
    </div>
  )
}

import { apiService } from '../../core/services/api.service'
import { ApiError } from '../../core/services/api.service'

interface UploadMediaResult {
  mediaId: string
  url?: string
  expiresAt?: string
}

export interface ResolvedMediaVariant {
  url: string
  expiresAt?: string
  mimeType: string
  sizeBytes: number
  width: number
  height: number
}

export interface ResolvedMediaSource {
  id: string
  url: string
  expiresAt?: string
  width?: number
  height?: number
  variants: ResolvedMediaVariant[]
}

export type ResolveMediaSourceResult = Record<string, ResolvedMediaSource>
export type ResolveMediaResult = Record<string, { url: string; expiresAt?: string }>

interface PostMediaItem {
  mediaId: string
  url?: string
  expiresAt?: string
}

type UnknownRecord = Record<string, unknown>

const RESOLVE_BATCH_LIMIT = 100
const CACHE_EXPIRY_SKEW_MS = 30_000
const CACHE_FALLBACK_TTL_MS = 5 * 60_000

interface CachedMediaSource {
  source: ResolvedMediaSource
  validUntil: number
}

interface PendingResolution {
  resolve: (source: ResolvedMediaSource | undefined) => void
  reject: (error: unknown) => void
}

const mediaCache = new Map<string, CachedMediaSource>()
const inFlightMedia = new Map<string, Promise<ResolvedMediaSource | undefined>>()
const pendingMedia = new Map<string, PendingResolution>()
let flushScheduled = false

const getNestedData = (payload: unknown): unknown => {
  if (!payload || typeof payload !== 'object') return payload
  const objectPayload = payload as UnknownRecord
  return objectPayload.data ?? payload
}

const getString = (payload: UnknownRecord, keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = payload[key]
    if (typeof value === 'string' && value.trim()) return value
    if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  }
  return undefined
}

const getPositiveNumber = (payload: UnknownRecord, keys: string[]): number | undefined => {
  for (const key of keys) {
    const value = payload[key]
    const numberValue = typeof value === 'number' ? value : Number(value)
    if (Number.isFinite(numberValue) && numberValue > 0) return numberValue
  }
  return undefined
}

const getCacheValidUntil = (source: ResolvedMediaSource): number => {
  const expiries = [source.expiresAt, ...source.variants.map((variant) => variant.expiresAt)]
    .map((value) => (value ? Date.parse(value) : Number.NaN))
    .filter(Number.isFinite)

  if (expiries.length === 0) return Date.now() + CACHE_FALLBACK_TTL_MS
  return Math.min(...expiries) - CACHE_EXPIRY_SKEW_MS
}

const getCachedSource = (mediaId: string): ResolvedMediaSource | undefined => {
  const cached = mediaCache.get(mediaId)
  if (!cached) return undefined
  if (Date.now() >= cached.validUntil) {
    mediaCache.delete(mediaId)
    return undefined
  }
  return cached.source
}

const cacheSource = (source: ResolvedMediaSource): void => {
  mediaCache.set(source.id, { source, validUntil: getCacheValidUntil(source) })
}

const normalizeResolveItems = (payload: unknown): UnknownRecord[] => {
  const data = getNestedData(payload)
  if (Array.isArray(data))
    return data.filter((item): item is UnknownRecord => !!item && typeof item === 'object')
  if (data && typeof data === 'object') {
    const dataObject = data as UnknownRecord
    if (Array.isArray(dataObject.items)) {
      return dataObject.items.filter(
        (item): item is UnknownRecord => !!item && typeof item === 'object',
      )
    }
  }
  return []
}

const normalizeVariants = (item: UnknownRecord): ResolvedMediaVariant[] => {
  if (!Array.isArray(item.variants)) return []

  const byWidth = new Map<number, ResolvedMediaVariant>()
  item.variants.forEach((rawVariant) => {
    if (!rawVariant || typeof rawVariant !== 'object') return
    const variant = rawVariant as UnknownRecord
    const url = getString(variant, ['signed_url', 'signedUrl', 'presigned_url', 'url'])
    const width = getPositiveNumber(variant, ['width'])
    const height = getPositiveNumber(variant, ['height'])
    const sizeBytes = getPositiveNumber(variant, ['size_bytes', 'sizeBytes'])
    const mimeType = getString(variant, ['mime_type', 'mimeType'])
    if (!url || !width || !height || !sizeBytes || mimeType !== 'image/webp') return

    byWidth.set(width, {
      url,
      width,
      height,
      sizeBytes,
      mimeType,
      expiresAt: getString(variant, ['expires_at', 'expiresAt']),
    })
  })

  return Array.from(byWidth.values()).sort((left, right) => left.width - right.width)
}

const resolveViaApi = async (mediaIds: string[]): Promise<ResolveMediaSourceResult> => {
  if (mediaIds.length === 0) return {}

  const numericMediaIds = mediaIds
    .map((mediaId) => Number(mediaId))
    .filter((mediaId) => Number.isInteger(mediaId) && mediaId > 0)

  if (numericMediaIds.length === 0) return {}

  const response = await apiService.post<unknown>('/media/resolve', {
    media_ids: numericMediaIds,
  })

  const items = normalizeResolveItems(response)
  const result: ResolveMediaSourceResult = {}

  items.forEach((item) => {
    const mediaId = getString(item, ['media_id', 'mediaId', 'id', 'token'])
    const url = getString(item, ['signed_url', 'signedUrl', 'presigned_url', 'url', 'media_url'])
    const expiresAt = getString(item, ['expires_at', 'expiresAt'])

    if (mediaId && url) {
      const source: ResolvedMediaSource = {
        id: mediaId,
        url,
        expiresAt,
        width: getPositiveNumber(item, ['width']),
        height: getPositiveNumber(item, ['height']),
        variants: normalizeVariants(item),
      }
      result[mediaId] = source
      cacheSource(source)
    }
  })

  return result
}

const chunkMediaIds = (mediaIds: string[]): string[][] => {
  const chunks: string[][] = []
  for (let index = 0; index < mediaIds.length; index += RESOLVE_BATCH_LIMIT) {
    chunks.push(mediaIds.slice(index, index + RESOLVE_BATCH_LIMIT))
  }
  return chunks
}

const flushPendingMedia = async (): Promise<void> => {
  flushScheduled = false
  const entries = Array.from(pendingMedia.entries())
  pendingMedia.clear()
  if (entries.length === 0) return

  const pendingById = new Map(entries)
  await Promise.all(
    chunkMediaIds(entries.map(([mediaId]) => mediaId)).map(async (chunk) => {
      try {
        const resolved = await resolveViaApi(chunk)
        chunk.forEach((mediaId) => pendingById.get(mediaId)?.resolve(resolved[mediaId]))
      } catch (error) {
        chunk.forEach((mediaId) => pendingById.get(mediaId)?.reject(error))
      }
    }),
  )
}

const resolveOneMediaSource = (mediaId: string): Promise<ResolvedMediaSource | undefined> => {
  const cached = getCachedSource(mediaId)
  if (cached) return Promise.resolve(cached)

  const inFlight = inFlightMedia.get(mediaId)
  if (inFlight) return inFlight

  const request = new Promise<ResolvedMediaSource | undefined>((resolve, reject) => {
    pendingMedia.set(mediaId, { resolve, reject })
    if (!flushScheduled) {
      flushScheduled = true
      queueMicrotask(() => void flushPendingMedia())
    }
  }).finally(() => {
    inFlightMedia.delete(mediaId)
  })
  inFlightMedia.set(mediaId, request)
  return request
}

export const resolveMediaSources = async (
  mediaIds: string[],
): Promise<ResolveMediaSourceResult> => {
  const deduped = Array.from(new Set(mediaIds.filter(Boolean)))
  if (deduped.length === 0) return {}

  const result: ResolveMediaSourceResult = {}
  const resolved = await Promise.all(
    deduped.map(async (mediaId) => [mediaId, await resolveOneMediaSource(mediaId)] as const),
  )
  resolved.forEach(([mediaId, source]) => {
    if (source) result[mediaId] = source
  })
  return result
}

export const resolveMediaUrls = async (mediaIds: string[]): Promise<ResolveMediaResult> => {
  const sources = await resolveMediaSources(mediaIds)
  const result: ResolveMediaResult = {}
  Object.entries(sources).forEach(([mediaId, source]) => {
    result[mediaId] = { url: source.url, expiresAt: source.expiresAt }
  })
  return result
}

export const mapMediaApiError = (error: unknown, fallback: string): string => {
  if (error instanceof ApiError) {
    if (error.status === 413) {
      return 'Image is larger than 5MB. Please compress it or choose a smaller file.'
    }
    if (error.status === 415) {
      return 'Unsupported media format. Backend rejected this upload.'
    }
    if (error.status === 403) {
      return "You don't have permission to modify this post media"
    }
    if (error.status === 404) {
      return 'Image not found or already removed'
    }
    if (error.status >= 500) {
      return 'Upload failed. Please retry'
    }
    return error.message || fallback
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  if (!(error instanceof ApiError)) {
    return fallback
  }

  return fallback
}

export const uploadPostMedia = async (postId: number, file: File): Promise<UploadMediaResult> => {
  const formData = new FormData()
  formData.append('files', file)

  const response = await apiService.post<unknown>(`/posts/${postId}/media`, formData)
  const payload = getNestedData(response)

  const uploadPayload = (() => {
    if (!payload || typeof payload !== 'object') return null
    const objectPayload = payload as UnknownRecord
    if (Array.isArray(objectPayload.items) && objectPayload.items.length > 0) {
      const firstItem = objectPayload.items[0]
      if (firstItem && typeof firstItem === 'object') {
        return firstItem as UnknownRecord
      }
    }
    return objectPayload
  })()

  if (!uploadPayload) {
    throw new Error('Invalid upload response')
  }

  const mediaId = getString(uploadPayload, ['media_id', 'mediaId', 'id', 'token'])
  if (!mediaId) {
    throw new Error('Upload succeeded but no media_id was returned')
  }

  const url = getString(uploadPayload, [
    'signed_url',
    'signedUrl',
    'presigned_url',
    'url',
    'media_url',
  ])
  const expiresAt = getString(uploadPayload, ['expires_at', 'expiresAt'])

  if (url) {
    cacheSource({ id: mediaId, url, expiresAt, variants: [] })
    return { mediaId, url, expiresAt }
  }

  const resolved = await resolveMediaUrls([mediaId])
  if (!resolved[mediaId]?.url) {
    throw new Error('Failed to resolve uploaded media URL')
  }

  return {
    mediaId,
    url: resolved[mediaId].url,
    expiresAt: resolved[mediaId].expiresAt,
  }
}

export const getPostMedia = async (postId: number): Promise<PostMediaItem[]> => {
  const response = await apiService.get<unknown>(`/posts/${postId}/media`)
  const items = normalizeResolveItems(response)

  return items
    .map((item) => ({
      mediaId: getString(item, ['media_id', 'mediaId', 'id', 'token']) || '',
      url: getString(item, ['signed_url', 'signedUrl', 'presigned_url', 'url', 'media_url']),
      expiresAt: getString(item, ['expires_at', 'expiresAt']),
    }))
    .filter((item) => !!item.mediaId)
}

export const deletePostMedia = async (postId: number, mediaId: string): Promise<void> => {
  await apiService.delete<unknown>(`/posts/${postId}/media/${mediaId}`)
  mediaCache.delete(mediaId)
}

export const clearResolvedMediaCache = (): void => {
  mediaCache.clear()
}

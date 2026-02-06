import { apiService } from '../../core/services/api.service'
import { ApiError } from '../../core/services/api.service'

interface UploadMediaResult {
  mediaId: string
  url?: string
  expiresAt?: string
}

interface ResolveMediaResult {
  [mediaId: string]: {
    url: string
    expiresAt?: string
  }
}

interface PostMediaItem {
  mediaId: string
  url?: string
  expiresAt?: string
}

type UnknownRecord = Record<string, unknown>

const mediaCache = new Map<string, { url: string; expiresAt?: string }>()

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

const isExpired = (expiresAt?: string): boolean => {
  if (!expiresAt) return false
  const expiresAtMs = Date.parse(expiresAt)
  if (Number.isNaN(expiresAtMs)) return false
  // 30 second skew to avoid using near-expiry URLs.
  return Date.now() >= expiresAtMs - 30000
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

const resolveViaApi = async (mediaIds: string[]): Promise<ResolveMediaResult> => {
  if (mediaIds.length === 0) return {}

  const numericMediaIds = mediaIds
    .map((mediaId) => Number(mediaId))
    .filter((mediaId) => Number.isInteger(mediaId) && mediaId > 0)

  if (numericMediaIds.length === 0) return {}

  const response = await apiService.post<unknown>('/media/resolve', {
    media_ids: numericMediaIds,
  })

  const items = normalizeResolveItems(response)
  const result: ResolveMediaResult = {}

  items.forEach((item) => {
    const mediaId = getString(item, ['media_id', 'id', 'token'])
    const url = getString(item, ['signed_url', 'url'])
    const expiresAt = getString(item, ['expires_at'])

    if (mediaId && url) {
      result[mediaId] = { url, expiresAt }
      mediaCache.set(mediaId, { url, expiresAt })
    }
  })

  return result
}

export const resolveMediaUrls = async (mediaIds: string[]): Promise<ResolveMediaResult> => {
  const deduped = Array.from(new Set(mediaIds.filter(Boolean)))
  if (deduped.length === 0) return {}

  const result: ResolveMediaResult = {}
  const unresolved: string[] = []

  deduped.forEach((mediaId) => {
    const cached = mediaCache.get(mediaId)
    if (cached && !isExpired(cached.expiresAt)) {
      result[mediaId] = { url: cached.url, expiresAt: cached.expiresAt }
    } else {
      unresolved.push(mediaId)
    }
  })

  if (unresolved.length > 0) {
    const resolved = await resolveViaApi(unresolved)
    Object.assign(result, resolved)
  }

  return result
}

export const mapMediaApiError = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (!(error instanceof ApiError)) {
    return fallback
  }

  if (error.status === 413)
    return 'Image is larger than 5MB. Please compress it or choose a smaller file.'
  if (error.status === 415) return 'Unsupported image format'
  if (error.status === 403) return "You don't have permission to modify this post media"
  if (error.status === 404) return 'Image not found or already removed'
  if (error.status >= 500) return 'Upload failed. Please retry'
  return error.message || fallback
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

  const mediaId = getString(uploadPayload, ['media_id', 'id', 'token'])
  if (!mediaId) {
    throw new Error('Upload succeeded but no media_id was returned')
  }

  const url = getString(uploadPayload, ['signed_url', 'url'])
  const expiresAt = getString(uploadPayload, ['expires_at'])

  if (url) {
    mediaCache.set(mediaId, { url, expiresAt })
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
      mediaId: getString(item, ['media_id', 'id', 'token']) || '',
      url: getString(item, ['signed_url', 'url']),
      expiresAt: getString(item, ['expires_at']),
    }))
    .filter((item) => !!item.mediaId)
}

export const deletePostMedia = async (postId: number, mediaId: string): Promise<void> => {
  await apiService.delete<unknown>(`/posts/${postId}/media/${mediaId}`)
  mediaCache.delete(mediaId)
}

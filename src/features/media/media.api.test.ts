import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { apiService } from '../../core/services/api.service'
import { clearResolvedMediaCache, resolveMediaSources, resolveMediaUrls } from './media.api'

describe('media resolver', () => {
  beforeEach(() => {
    clearResolvedMediaCache()
    vi.useRealTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('coalesces sibling calls and shares in-flight media IDs', async () => {
    const post = vi.spyOn(apiService, 'post').mockImplementation(async (_path, body) => {
      const mediaIds = (body as { media_ids: number[] }).media_ids
      return {
        items: mediaIds.map((id) => ({
          id,
          url: `https://media.test/${id}.png`,
          expires_at: '2030-01-01T00:00:00Z',
        })),
      }
    })

    const [first, second, duplicate] = await Promise.all([
      resolveMediaSources(['101']),
      resolveMediaSources(['102']),
      resolveMediaSources(['101']),
    ])

    expect(post).toHaveBeenCalledTimes(1)
    expect(post).toHaveBeenCalledWith('/media/resolve', { media_ids: [101, 102] })
    expect(first['101'].url).toBe('https://media.test/101.png')
    expect(second['102'].url).toBe('https://media.test/102.png')
    expect(duplicate['101']).toBe(first['101'])
  })

  it('maps, deduplicates, and sorts valid responsive variants', async () => {
    vi.spyOn(apiService, 'post').mockResolvedValue({
      items: [
        {
          id: 201,
          url: 'https://media.test/original.png',
          expires_at: '2030-01-01T00:00:00Z',
          width: 1200,
          height: 800,
          variants: [
            {
              url: 'https://media.test/w960.webp',
              expires_at: '2030-01-01T00:00:00Z',
              mime_type: 'image/webp',
              size_bytes: 9600,
              width: 960,
              height: 640,
            },
            {
              url: 'https://media.test/invalid.jpg',
              mime_type: 'image/jpeg',
              size_bytes: 1,
              width: 320,
              height: 200,
            },
            {
              url: 'https://media.test/w320-old.webp',
              mime_type: 'image/webp',
              size_bytes: 3200,
              width: 320,
              height: 213,
            },
            {
              url: 'https://media.test/w320.webp',
              mime_type: 'image/webp',
              size_bytes: 3000,
              width: 320,
              height: 213,
            },
          ],
        },
      ],
    })

    const result = await resolveMediaSources(['201'])

    expect(result['201']).toMatchObject({
      width: 1200,
      height: 800,
      variants: [
        { width: 320, url: 'https://media.test/w320.webp' },
        { width: 960, url: 'https://media.test/w960.webp' },
      ],
    })
  })

  it('chunks requests to the backend batch limit', async () => {
    const post = vi.spyOn(apiService, 'post').mockImplementation(async (_path, body) => {
      const mediaIds = (body as { media_ids: number[] }).media_ids
      return {
        items: mediaIds.map((id) => ({ id, url: `https://media.test/${id}` })),
      }
    })
    const ids = Array.from({ length: 101 }, (_, index) => String(index + 1000))

    const result = await resolveMediaSources(ids)

    expect(post).toHaveBeenCalledTimes(2)
    expect(Object.keys(result)).toHaveLength(101)
  })

  it('expires the complete manifest using the earliest signed URL', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-24T00:00:00Z'))
    const post = vi.spyOn(apiService, 'post').mockResolvedValue({
      items: [
        {
          id: 301,
          url: 'https://media.test/original',
          expires_at: '2026-08-24T00:10:00Z',
          variants: [
            {
              url: 'https://media.test/w320.webp',
              expires_at: '2026-08-24T00:02:00Z',
              mime_type: 'image/webp',
              size_bytes: 100,
              width: 320,
              height: 180,
            },
          ],
        },
      ],
    })

    await resolveMediaSources(['301'])
    vi.setSystemTime(new Date('2026-08-24T00:01:00Z'))
    await resolveMediaSources(['301'])
    expect(post).toHaveBeenCalledTimes(1)

    vi.setSystemTime(new Date('2026-08-24T00:01:31Z'))
    await resolveMediaSources(['301'])
    expect(post).toHaveBeenCalledTimes(2)
  })

  it('preserves the legacy URL-only resolver contract', async () => {
    vi.spyOn(apiService, 'post').mockResolvedValue({
      items: [
        {
          id: 401,
          url: 'https://media.test/original',
          expires_at: '2030-01-01T00:00:00Z',
          width: 1200,
          variants: [{ url: 'invalid-without-metadata' }],
        },
      ],
    })

    await expect(resolveMediaUrls(['401'])).resolves.toEqual({
      '401': {
        url: 'https://media.test/original',
        expiresAt: '2030-01-01T00:00:00Z',
      },
    })
  })
})

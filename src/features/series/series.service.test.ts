import { describe, expect, it } from 'vitest'
import { ApiError } from '../../core/services/api.service'
import { SeriesApiPort } from './series.api'
import { SeriesService } from './series.service'
import {
  ApiOwnerSeriesResponse,
  ApiPublicSeriesResponse,
  CreateSeriesInput,
  UpdateSeriesInput,
} from './series.types'

const ownerSeries: ApiOwnerSeriesResponse = {
  data: {
    id: 7,
    slug: 'database-engineering',
    title: 'Database Engineering',
    description: 'A practical path',
    parts: [
      {
        post_id: 42,
        title: 'Indexes first',
        status: 'published',
        position: 1,
        published_at: '2026-08-01T00:00:00Z',
      },
    ],
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-02T00:00:00Z',
  },
}

class FakeSeriesApi implements SeriesApiPort {
  createInput: CreateSeriesInput | null = null
  updateInput: UpdateSeriesInput | null = null
  replacement: number[] | null = null
  assignment: { postId: number; seriesId: number | null } | null = null

  async getPublicSeries(): Promise<ApiPublicSeriesResponse> {
    return {
      data: {
        id: 7,
        slug: 'database-engineering',
        title: 'Database Engineering',
        author: { id: 1, name: 'Connor' },
        parts: [{ post_id: 42, title: 'Indexes first', position: 1 }],
      },
    }
  }

  async getPublicContext() {
    return { data: null }
  }

  async listOwned() {
    return { data: [ownerSeries.data] }
  }

  async create(input: CreateSeriesInput) {
    this.createInput = input
    return ownerSeries
  }

  async update(_seriesId: number, input: UpdateSeriesInput) {
    this.updateInput = input
    return ownerSeries
  }

  async remove() {}

  async replacePosts(_seriesId: number, postIds: number[]) {
    this.replacement = postIds
    return ownerSeries
  }

  async assignPost(postId: number, seriesId: number | null) {
    this.assignment = { postId, seriesId }
    return { data: seriesId ? { series: ownerSeries.data } : null }
  }
}

describe('SeriesService', () => {
  it('maps public and owner transport fields into the feature model', async () => {
    const service = new SeriesService(new FakeSeriesApi())

    await expect(service.getPublicSeries('database-engineering')).resolves.toMatchObject({
      id: 7,
      description: '',
      parts: [{ postId: 42, publishedAt: null }],
    })
    await expect(service.listOwned()).resolves.toMatchObject([
      { id: 7, parts: [{ postId: 42, status: 'published' }] },
    ])
  })

  it('normalizes metadata and persists one assignment choice', async () => {
    const api = new FakeSeriesApi()
    const service = new SeriesService(api)

    await service.create({ title: '  Database Engineering  ', description: '  A path  ' })
    await service.assignPost(42, 7)

    expect(api.createInput).toEqual({ title: 'Database Engineering', description: 'A path' })
    expect(api.assignment).toEqual({ postId: 42, seriesId: 7 })
  })

  it('rejects duplicate or invalid replacement ids before transport', async () => {
    const service = new SeriesService(new FakeSeriesApi())

    await expect(service.replacePosts(7, [42, 42])).rejects.toBeInstanceOf(ApiError)
    await expect(service.replacePosts(7, [0])).rejects.toThrow('Series blogs must be unique.')
  })
})

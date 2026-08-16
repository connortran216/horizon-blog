import { ApiError } from '../../core/services/api.service'
import { SeriesApi, SeriesApiPort } from './series.api'
import {
  ApiOwnerSeries,
  ApiOwnerSeriesPart,
  ApiPublicSeries,
  ApiPublicSeriesContext,
  ApiPublicSeriesPart,
  CreateSeriesInput,
  OwnerSeries,
  OwnerSeriesPart,
  PublicSeries,
  PublicSeriesContext,
  PublicSeriesPart,
  UpdateSeriesInput,
} from './series.types'

export class SeriesService {
  constructor(private readonly api: SeriesApiPort = new SeriesApi()) {}

  async getPublicSeries(slug: string): Promise<PublicSeries> {
    if (!slug.trim()) throw new ApiError('Series not found.', 404)
    return this.mapPublicSeries((await this.api.getPublicSeries(slug)).data)
  }

  async getPublicContext(postId: number): Promise<PublicSeriesContext | null> {
    const response = await this.api.getPublicContext(postId)
    return response.data ? this.mapPublicContext(response.data) : null
  }

  async listOwned(): Promise<OwnerSeries[]> {
    return (await this.api.listOwned()).data.map((series) => this.mapOwnerSeries(series))
  }

  async create(input: CreateSeriesInput): Promise<OwnerSeries> {
    const normalized = this.normalizeMetadata(input.title, input.description ?? '')
    return this.mapOwnerSeries((await this.api.create(normalized)).data)
  }

  async update(seriesId: number, input: UpdateSeriesInput): Promise<OwnerSeries> {
    const normalized: UpdateSeriesInput = {}
    if (input.title !== undefined) normalized.title = this.normalizeTitle(input.title)
    if (input.description !== undefined) {
      normalized.description = this.normalizeDescription(input.description)
    }
    if (Object.keys(normalized).length === 0) {
      throw new ApiError('Change the title or description before saving.', 400)
    }
    return this.mapOwnerSeries((await this.api.update(seriesId, normalized)).data)
  }

  async remove(seriesId: number): Promise<void> {
    await this.api.remove(seriesId)
  }

  async replacePosts(seriesId: number, postIds: number[]): Promise<OwnerSeries> {
    const unique = new Set(postIds)
    if (
      postIds.some((postId) => !Number.isInteger(postId) || postId <= 0) ||
      unique.size !== postIds.length
    ) {
      throw new ApiError('Series blogs must be unique.', 400)
    }
    return this.mapOwnerSeries((await this.api.replacePosts(seriesId, postIds)).data)
  }

  async assignPost(postId: number, seriesId: number | null): Promise<void> {
    await this.api.assignPost(postId, seriesId)
  }

  private normalizeMetadata(title: string, description: string): CreateSeriesInput {
    return {
      title: this.normalizeTitle(title),
      description: this.normalizeDescription(description),
    }
  }

  private normalizeTitle(title: string): string {
    const normalized = title.trim()
    if (!normalized) throw new ApiError('Series title is required.', 400)
    if (normalized.length > 160) throw new ApiError('Series title is too long.', 400)
    return normalized
  }

  private normalizeDescription(description: string): string {
    const normalized = description.trim()
    if (normalized.length > 1000) throw new ApiError('Series description is too long.', 400)
    return normalized
  }

  private mapPublicPart(part: ApiPublicSeriesPart): PublicSeriesPart {
    return {
      postId: part.post_id,
      title: part.title,
      position: part.position,
      publishedAt: part.published_at ?? null,
    }
  }

  private mapPublicSeries(series: ApiPublicSeries): PublicSeries {
    return {
      id: series.id,
      slug: series.slug,
      title: series.title,
      description: series.description ?? '',
      author: series.author,
      parts: series.parts.map((part) => this.mapPublicPart(part)),
    }
  }

  private mapPublicContext(context: ApiPublicSeriesContext): PublicSeriesContext {
    return {
      series: context.series,
      position: context.position,
      total: context.total,
      previous: context.previous ? this.mapPublicPart(context.previous) : null,
      next: context.next ? this.mapPublicPart(context.next) : null,
    }
  }

  private mapOwnerPart(part: ApiOwnerSeriesPart): OwnerSeriesPart {
    return {
      postId: part.post_id,
      title: part.title,
      status: part.status,
      position: part.position,
      publishedAt: part.published_at ?? null,
      scheduledPublishAt: part.scheduled_publish_at ?? null,
    }
  }

  private mapOwnerSeries(series: ApiOwnerSeries): OwnerSeries {
    return {
      id: series.id,
      slug: series.slug,
      title: series.title,
      description: series.description ?? '',
      parts: series.parts.map((part) => this.mapOwnerPart(part)),
      createdAt: series.created_at,
      updatedAt: series.updated_at,
    }
  }
}

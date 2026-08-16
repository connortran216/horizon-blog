import { apiService } from '../../core/services/api.service'
import {
  ApiOwnerSeriesContextResponse,
  ApiOwnerSeriesListResponse,
  ApiOwnerSeriesResponse,
  ApiPublicSeriesContextResponse,
  ApiPublicSeriesResponse,
  CreateSeriesInput,
  UpdateSeriesInput,
} from './series.types'

export interface SeriesApiPort {
  getPublicSeries(slug: string): Promise<ApiPublicSeriesResponse>
  getPublicContext(postId: number): Promise<ApiPublicSeriesContextResponse>
  listOwned(): Promise<ApiOwnerSeriesListResponse>
  create(input: CreateSeriesInput): Promise<ApiOwnerSeriesResponse>
  update(seriesId: number, input: UpdateSeriesInput): Promise<ApiOwnerSeriesResponse>
  remove(seriesId: number): Promise<void>
  replacePosts(seriesId: number, postIds: number[]): Promise<ApiOwnerSeriesResponse>
  assignPost(postId: number, seriesId: number | null): Promise<ApiOwnerSeriesContextResponse>
}

export class SeriesApi implements SeriesApiPort {
  getPublicSeries(slug: string): Promise<ApiPublicSeriesResponse> {
    return apiService.get(`/series/${encodeURIComponent(slug)}`, undefined, {
      authMode: 'optional',
      allowGuestFallback: true,
    })
  }

  getPublicContext(postId: number): Promise<ApiPublicSeriesContextResponse> {
    return apiService.get(`/posts/${postId}/series`, undefined, {
      authMode: 'optional',
      allowGuestFallback: true,
    })
  }

  listOwned(): Promise<ApiOwnerSeriesListResponse> {
    return apiService.get('/users/me/series')
  }

  create(input: CreateSeriesInput): Promise<ApiOwnerSeriesResponse> {
    return apiService.post('/series', {
      title: input.title,
      description: input.description ?? '',
    })
  }

  update(seriesId: number, input: UpdateSeriesInput): Promise<ApiOwnerSeriesResponse> {
    return apiService.patch(`/series/${seriesId}`, input)
  }

  async remove(seriesId: number): Promise<void> {
    await apiService.delete(`/series/${seriesId}`)
  }

  replacePosts(seriesId: number, postIds: number[]): Promise<ApiOwnerSeriesResponse> {
    return apiService.put(`/series/${seriesId}/posts`, { post_ids: postIds })
  }

  assignPost(postId: number, seriesId: number | null): Promise<ApiOwnerSeriesContextResponse> {
    return apiService.put(`/posts/${postId}/series`, { series_id: seriesId })
  }
}

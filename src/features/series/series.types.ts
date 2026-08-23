export interface ApiSeriesAuthor {
  id: number
  name: string
}

export interface ApiSeriesIdentity {
  id: number
  slug: string
  title: string
}

export interface ApiSeriesTag {
  id: number
  name: string
}

export interface ApiPublicSeriesPart {
  post_id: number
  title: string
  excerpt: string
  reading_time: number
  tags: ApiSeriesTag[]
  position: number
  published_at?: string | null
}

export interface ApiPublicSeries {
  id: number
  slug: string
  title: string
  description?: string
  author: ApiSeriesAuthor
  parts: ApiPublicSeriesPart[]
  updated_at: string
}

export interface ApiPublicSeriesResponse {
  data: ApiPublicSeries
}

export interface ApiPublicSeriesSummary {
  id: number
  slug: string
  title: string
  description?: string
  author: ApiSeriesAuthor
  part_count: number
  updated_at: string
}

export interface ApiSeriesPagination {
  page: number
  limit: number
  total: number
  total_pages: number
}

export interface ApiPublicSeriesListResponse {
  data: ApiPublicSeriesSummary[]
  pagination: ApiSeriesPagination
}

export interface ApiPublicSeriesContext {
  series: ApiSeriesIdentity
  position: number
  total: number
  previous: ApiPublicSeriesPart | null
  next: ApiPublicSeriesPart | null
}

export interface ApiPublicSeriesContextResponse {
  data: ApiPublicSeriesContext | null
}

export interface ApiOwnerSeriesPart {
  post_id: number
  title: string
  status: 'draft' | 'published'
  position: number
  published_at?: string | null
  scheduled_publish_at?: string | null
}

export interface ApiOwnerSeries {
  id: number
  slug: string
  title: string
  description?: string
  parts: ApiOwnerSeriesPart[]
  created_at: string
  updated_at: string
}

export interface ApiOwnerSeriesResponse {
  data: ApiOwnerSeries
}

export interface ApiOwnerSeriesListResponse {
  data: ApiOwnerSeries[]
}

export interface ApiOwnerSeriesContextResponse {
  data: { series: ApiSeriesIdentity } | null
}

export interface SeriesAuthor {
  id: number
  name: string
}

export interface SeriesIdentity {
  id: number
  slug: string
  title: string
}

export interface PublicSeriesPart {
  postId: number
  title: string
  excerpt: string
  readingTime: number
  tags: string[]
  position: number
  publishedAt: string | null
}

export interface PublicSeries extends SeriesIdentity {
  description: string
  author: SeriesAuthor
  parts: PublicSeriesPart[]
  updatedAt: string
}

export interface PublicSeriesSummary extends SeriesIdentity {
  description: string
  author: SeriesAuthor
  partCount: number
  updatedAt: string
}

export interface PublicSeriesListPage {
  items: PublicSeriesSummary[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PublicSeriesContext {
  series: SeriesIdentity
  position: number
  total: number
  previous: PublicSeriesPart | null
  next: PublicSeriesPart | null
}

export interface OwnerSeriesPart {
  postId: number
  title: string
  status: 'draft' | 'published'
  position: number
  publishedAt: string | null
  scheduledPublishAt: string | null
}

export interface OwnerSeries extends SeriesIdentity {
  description: string
  parts: OwnerSeriesPart[]
  createdAt: string
  updatedAt: string
}

export interface CreateSeriesInput {
  title: string
  description?: string
}

export interface UpdateSeriesInput {
  title?: string
  description?: string
}

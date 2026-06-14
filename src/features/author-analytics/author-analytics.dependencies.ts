import { AuthorAnalyticsService } from './author-analytics.service'

let authorAnalyticsService: AuthorAnalyticsService | undefined

export const getAuthorAnalyticsService = () => {
  authorAnalyticsService ??= new AuthorAnalyticsService()
  return authorAnalyticsService
}

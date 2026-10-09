import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { horizonTheme } from '../../../theme/horizon'
import {
  analyticsPostDetailApiFixture,
  analyticsPostsApiFixture,
} from '../author-analytics.fixtures'
import { AuthorAnalyticsService } from '../author-analytics.service'
import { ApiAuthorAnalyticsRepository } from '../author-analytics.repository'
import BlogPerformanceReport from './BlogPerformanceReport'
import BlogReadingReport from './BlogReadingReport'
import { ReactNode } from 'react'
const render = (node: ReactNode) =>
  renderToStaticMarkup(
    <ChakraProvider theme={horizonTheme}>
      <MemoryRouter>{node}</MemoryRouter>
    </ChakraProvider>,
  )
const service = new AuthorAnalyticsService(
  new ApiAuthorAnalyticsRepository({
    get: async <T,>(endpoint: string): Promise<T> =>
      (endpoint.endsWith('/posts') ? analyticsPostsApiFixture : analyticsPostDetailApiFixture) as T,
  }),
)

describe('approved analytics monitoring report', () => {
  it('renders views as a count and completion at its exact bounded ratio', async () => {
    const blogs = (await service.getPostMetrics({ range: analyticsPostsApiFixture.range })).posts
    const html = render(
      <BlogPerformanceReport
        blogs={blogs}
        query="from=2026-05-06&to=2026-06-04&q=example&page=2"
      />,
    )
    expect(html).toMatch(/data-metric="views"[^>]*>420<\/td>/)
    expect(html).toContain('width:56%')
    expect(html).not.toContain('Reach (views)')
    expect(html).toContain('q=example&amp;page=2')
    expect(html).toContain('Based on 420 opens')
  })
  it('shows every diagnostic section without tabs and retains evidence', async () => {
    const detail = await service.getPostDetail(42, analyticsPostsApiFixture.range)
    const html = render(<BlogReadingReport analytics={detail} />)
    expect(html).toContain('Where reading stops')
    expect(html).toContain('Traffic sources')
    expect(html).toContain('Reader actions')
    expect(html).not.toContain('role="tab"')
    expect(html).toContain('did not reach 25%')
    expect(html).toContain('70')
    expect(html).not.toContain('Source quality')
    expect(html).toContain('Link and reaction details')
  })
})

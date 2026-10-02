import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { horizonTheme } from '../../../theme/horizon'
import { AnalyticsSummary, BlogAnalyticsDetail, BlogMetricRow } from '../author-analytics.types'
import BlogDiagnosticWorkspace from './BlogDiagnosticWorkspace'
import ReachDepthMap from './ReachDepthMap'
import ReaderJourney from './ReaderJourney'
import SelectedBlogEvidence from './SelectedBlogEvidence'

const summary: AnalyticsSummary = {
  views: 120,
  estimatedUniqueReaders: 84,
  uniqueReadersApproximate: true,
  completionRate: 0.375,
  avgActiveReadSeconds: 72,
  heartsReceived: 6,
  shares: 3,
  linkClicks: 9,
}

const blog: BlogMetricRow = {
  postId: 42,
  title: 'A blog with useful evidence',
  views: 120,
  estimatedUniqueReaders: 84,
  uniqueReadersApproximate: true,
  heartsReceived: 6,
  activeHeartCount: 8,
  shares: 3,
  linkClicks: 9,
  completionRate: 0.375,
  avgActiveReadSeconds: 72,
}

describe('analytics insight redesign', () => {
  it('keeps journey definitions keyboard reachable while labeling derived values', () => {
    const markup = renderToStaticMarkup(
      <ChakraProvider theme={horizonTheme}>
        <ReaderJourney summary={summary} />
      </ChakraProvider>,
    )

    expect(markup).toContain('Reader journey')
    expect(markup).toContain('<h2')
    expect(markup).toContain('~45')
    expect(markup).toContain('event total')
    expect(markup).toContain('aria-label="About Actions"')
  })

  it('uses accessible plot points and one title link instead of a repeated detail button', () => {
    const markup = renderToStaticMarkup(
      <ChakraProvider theme={horizonTheme}>
        <MemoryRouter>
          <ReachDepthMap blogs={[blog]} selectedPostId={blog.postId} onSelect={() => undefined} />
          <SelectedBlogEvidence
            blog={blog}
            range={{ from: '2026-09-01', to: '2026-09-30', timezone: 'UTC' }}
          />
        </MemoryRouter>
      </ChakraProvider>,
    )

    expect(markup).toContain(
      'aria-label="A blog with useful evidence: 120 views, 37.5% completion"',
    )
    expect(markup).toContain('aria-pressed="true"')
    expect(markup).toContain('A blog with useful…')
    expect(markup).toContain(
      'href="/analytics/blog/42?from=2026-09-01&amp;to=2026-09-30&amp;timezone=UTC"',
    )
    expect(markup).not.toContain('>Open<')
    expect(markup).not.toContain('>Details<')
  })

  it('foregrounds reading metrics and plots retention with session counts', () => {
    const analytics: BlogAnalyticsDetail = {
      post: { id: 42, title: blog.title, publishedAt: '2026-09-01T00:00:00Z' },
      range: { from: '2026-09-01', to: '2026-09-30', timezone: 'UTC' },
      summary,
      progressFunnel: [
        { stage: 'opened', sessions: 120, rate: 1 },
        { stage: '50', sessions: 70, rate: 0.5833 },
        { stage: 'completed', sessions: 45, rate: 0.375 },
      ],
      reactionTrend: [],
      topLinks: [],
      trafficSources: [],
      insights: [],
      dataFreshThrough: '2026-09-30T00:00:00Z',
    }
    const markup = renderToStaticMarkup(
      <ChakraProvider theme={horizonTheme}>
        <BlogDiagnosticWorkspace analytics={analytics} />
      </ChakraProvider>,
    )

    expect(markup).toContain('Reading retention')
    expect(markup).toContain('~84')
    expect(markup).toContain('37.5%')
    expect(markup).toContain('1m 12s')
    expect(markup).toMatch(/<text[^>]*>120<\/text>/)
    expect(markup).not.toMatch(/<text[^>]*>100%<\/text>/)
  })
})

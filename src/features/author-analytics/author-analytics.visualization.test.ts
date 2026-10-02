import { describe, expect, it } from 'vitest'

import {
  buildReaderJourney,
  buildTrendPolyline,
  createAnalyticsRangePreset,
  formatInsightEvidence,
  getAnalyticsErrorCopy,
  getContextualEvidenceSections,
  getReachDepthLabelPostIds,
  getReachDepthPosition,
  normalizeFunnelStages,
  sortBlogMetrics,
} from './author-analytics.visualization'
import { AnalyticsInsight, AnalyticsSummary, BlogMetricRow } from './author-analytics.types'

describe('author analytics visualization helpers', () => {
  it('builds a reader journey while keeping action events distinct from readers', () => {
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

    expect(buildReaderJourney(summary)).toEqual([
      { id: 'views', label: 'Views', value: 120, approximate: false },
      { id: 'readers', label: 'Readers', value: 84, approximate: true },
      { id: 'completed', label: 'Completed', value: 45, approximate: true },
      { id: 'actions', label: 'Actions', value: 18, approximate: false },
    ])
  })

  it('positions reach and completion inside bounded plot gutters', () => {
    const blog: BlogMetricRow = {
      postId: 1,
      title: 'A',
      views: 50,
      estimatedUniqueReaders: 20,
      uniqueReadersApproximate: true,
      heartsReceived: 2,
      activeHeartCount: 2,
      shares: 1,
      linkClicks: 3,
      completionRate: 0.75,
      avgActiveReadSeconds: 100,
    }

    expect(getReachDepthPosition(blog, 100)).toEqual({ xPercent: 50, yPercent: 29 })
    expect(getReachDepthPosition({ ...blog, views: 0, completionRate: 2 }, 0)).toEqual({
      xPercent: 8,
      yPercent: 8,
    })
  })

  it('labels the selected blog and spatially distinct reach/depth signals without crowding', () => {
    const blog = (postId: number, views: number, completionRate: number): BlogMetricRow => ({
      postId,
      title: `Blog ${postId}`,
      views,
      estimatedUniqueReaders: Math.max(1, Math.round(views * 0.7)),
      uniqueReadersApproximate: true,
      heartsReceived: 0,
      activeHeartCount: 0,
      shares: 0,
      linkClicks: 0,
      completionRate,
      avgActiveReadSeconds: 0,
    })
    const blogs = [
      blog(1, 100, 0.2),
      blog(2, 96, 0.22),
      blog(3, 45, 0.92),
      blog(4, 25, 0.55),
      blog(5, 8, 0.12),
    ]

    expect(getReachDepthLabelPostIds(blogs, 4)).toEqual([4, 1, 3, 5])
    expect(getReachDepthLabelPostIds(blogs, 2)).toEqual([2, 3, 4, 5])
    expect(getReachDepthLabelPostIds([], 2)).toEqual([])
  })

  it('removes signals from the evidence rail when the active diagnostic already owns them', () => {
    expect(getContextualEvidenceSections('retention')).toEqual([
      'sources',
      'links',
      'reactions',
      'insight',
    ])
    expect(getContextualEvidenceSections('sources')).toEqual(['links', 'reactions', 'insight'])
    expect(getContextualEvidenceSections('actions')).toEqual(['sources', 'insight'])
  })

  it('builds a bounded SVG polyline from trend values', () => {
    expect(
      buildTrendPolyline(
        [
          { date: '2026-06-01', value: 0 },
          { date: '2026-06-02', value: 50 },
          { date: '2026-06-03', value: 100 },
        ],
        { width: 100, height: 40 },
      ),
    ).toBe('0,40 50,20 100,0')
  })

  it('keeps single-point and flat trends readable', () => {
    expect(
      buildTrendPolyline([{ date: '2026-06-01', value: 10 }], { width: 100, height: 40 }),
    ).toBe('0,20 100,20')
    expect(
      buildTrendPolyline(
        [
          { date: '2026-06-01', value: 5 },
          { date: '2026-06-02', value: 5 },
        ],
        { width: 100, height: 40 },
      ),
    ).toBe('0,20 100,20')
  })

  it('normalizes funnel stages for accessible bar widths', () => {
    expect(
      normalizeFunnelStages([
        { stage: 'opened', sessions: 100, rate: 1 },
        { stage: 'completed', sessions: 25, rate: 0.25 },
      ]),
    ).toEqual([
      { label: 'Opened', sessions: 100, rate: 1, widthPercent: 100 },
      { label: 'Completed', sessions: 25, rate: 0.25, widthPercent: 25 },
    ])
  })

  it('creates inclusive UTC presets ending at the provided date', () => {
    expect(createAnalyticsRangePreset('7d', new Date('2026-06-04T12:00:00Z'))).toEqual({
      from: '2026-05-29',
      to: '2026-06-04',
      timezone: 'UTC',
    })
    expect(createAnalyticsRangePreset('90d', new Date('2026-06-04T12:00:00Z'))).toEqual({
      from: '2026-03-07',
      to: '2026-06-04',
      timezone: 'UTC',
    })
  })

  it('returns actionable copy for protected analytics error states', () => {
    expect(
      getAnalyticsErrorCopy({ kind: 'unauthorized', message: 'Unauthorized', statusCode: 401 }),
    ).toMatchInlineSnapshot(`
        {
          "description": "Sign in again to view analytics for your writing.",
          "title": "Your session needs attention",
        }
      `)

    expect(getAnalyticsErrorCopy({ kind: 'service_unavailable', message: 'Down', statusCode: 503 }))
      .toMatchInlineSnapshot(`
        {
          "description": "Analytics data is temporarily unavailable. Your blogs are still safe.",
          "title": "Analytics is catching up",
        }
      `)
  })

  it('sorts blog metrics for comparison without mutating the backend order', () => {
    const blogs: BlogMetricRow[] = [
      {
        postId: 1,
        title: 'A',
        views: 30,
        estimatedUniqueReaders: 20,
        uniqueReadersApproximate: true,
        heartsReceived: 2,
        activeHeartCount: 2,
        shares: 1,
        linkClicks: 3,
        completionRate: 0.8,
        avgActiveReadSeconds: 100,
      },
      {
        postId: 2,
        title: 'B',
        views: 50,
        estimatedUniqueReaders: 40,
        uniqueReadersApproximate: true,
        heartsReceived: 4,
        activeHeartCount: 3,
        shares: 2,
        linkClicks: 1,
        completionRate: 0.25,
        avgActiveReadSeconds: 20,
      },
    ]

    expect(sortBlogMetrics(blogs, 'completion_rate', 'desc').map((blog) => blog.postId)).toEqual([
      1, 2,
    ])
    expect(sortBlogMetrics(blogs, 'views', 'asc').map((blog) => blog.postId)).toEqual([1, 2])
    expect(blogs.map((blog) => blog.postId)).toEqual([1, 2])
  })

  it('formats insight evidence while preserving backend metrics and cautious sample size', () => {
    const insight: AnalyticsInsight = {
      code: 'low_completion',
      message: 'Completion is lower than usual for this blog.',
      sample_size: 18,
      evidence: [{ metric: 'completion_rate', value: 0.25, baseline: 0.5 }],
    }

    expect(formatInsightEvidence(insight)).toEqual({
      sampleLabel: 'Sample size: 18',
      evidenceLabels: ['completion_rate: 25% vs 50% baseline'],
    })
  })
})

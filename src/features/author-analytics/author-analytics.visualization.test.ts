import { describe, expect, it } from 'vitest'

import {
  createAnalyticsRangePreset,
  normalizeFunnelStages,
  sortBlogMetrics,
} from './author-analytics.visualization'
import { BlogMetricRow } from './author-analytics.types'

describe('author analytics visualization helpers', () => {
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
})

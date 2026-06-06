import {
  AnalyticsOverviewResponse,
  AnalyticsPostDetailResponse,
  AnalyticsPostsResponse,
} from './author-analytics.types'

export const analyticsOverviewFixture: AnalyticsOverviewResponse = {
  data: {
    range: { from: '2026-05-06', to: '2026-06-04', timezone: 'UTC' },
    summary: {
      views: 1200,
      estimated_unique_readers: 830,
      unique_readers_approximate: true,
      hearts_received: 94,
      shares: 32,
      link_clicks: 180,
      completion_rate: 0.42,
      avg_active_read_seconds: 286,
    },
    trend: [
      {
        date: '2026-06-04',
        views: 48,
        estimated_unique_readers: 39,
        hearts_received: 4,
        shares: 2,
        completed: 18,
      },
    ],
    top_blogs: [
      {
        post_id: 42,
        title: 'Example blog',
        views: 420,
        estimated_unique_readers: 350,
        unique_readers_approximate: true,
        hearts_received: 30,
        shares: 12,
        link_clicks: 72,
        completion_rate: 0.56,
        avg_active_read_seconds: 310,
      },
    ],
    insights: [],
    data_fresh_through: '2026-06-04T09:20:00Z',
    unique_readers_approximate: true,
  },
}

export const analyticsPostsFixture: AnalyticsPostsResponse = {
  data: analyticsOverviewFixture.data.top_blogs,
  page: 1,
  limit: 10,
  total: 1,
  range: analyticsOverviewFixture.data.range,
  data_fresh_through: analyticsOverviewFixture.data.data_fresh_through,
}

export const analyticsPostDetailFixture: AnalyticsPostDetailResponse = {
  data: {
    post: {
      id: 42,
      title: 'Example blog',
      published_at: '2026-05-01T08:00:00Z',
    },
    range: analyticsOverviewFixture.data.range,
    summary: {
      ...analyticsOverviewFixture.data.top_blogs[0],
      active_heart_count: 128,
    },
    progress_funnel: [
      { stage: 'opened', sessions: 420, rate: 1 },
      { stage: '25', sessions: 350, rate: 0.8333 },
      { stage: '50', sessions: 294, rate: 0.7 },
      { stage: '75', sessions: 252, rate: 0.6 },
      { stage: 'completed', sessions: 235, rate: 0.5595 },
    ],
    reaction_trend: [{ date: '2026-06-04', hearts_added: 4, hearts_removed: 1 }],
    top_links: [
      {
        link_key: 'https://example.com/resource',
        url: 'https://example.com/resource',
        label: 'Useful resource',
        kind: 'external',
        clicks: 38,
        ctr: 0.0905,
      },
    ],
    traffic_sources: [
      {
        category: 'search',
        host: 'google.com',
        views: 120,
        completion_rate: 0.64,
        avg_active_read_seconds: 344,
      },
    ],
    insights: [],
    data_fresh_through: analyticsOverviewFixture.data.data_fresh_through,
  },
}

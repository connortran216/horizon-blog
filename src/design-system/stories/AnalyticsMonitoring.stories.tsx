import type { Meta, StoryObj } from '@storybook/react-vite'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Text } from '../index'
import AnalyticsOverviewPage from '../../features/author-analytics/pages/AnalyticsOverviewPage'
import BlogAnalyticsPage from '../../features/author-analytics/pages/BlogAnalyticsPage'
import { AuthorAnalyticsService } from '../../features/author-analytics/author-analytics.service'
import {
  AuthorAnalyticsRepositoryPort,
  AuthorAnalyticsApiPostMetric,
} from '../../features/author-analytics/author-analytics.repository'
import {
  analyticsOverviewApiFixture,
  analyticsPostDetailApiFixture,
} from '../../features/author-analytics/author-analytics.fixtures'

const range = { from: '2026-09-09', to: '2026-10-08', timezone: 'UTC' as const }
const fresh = '2026-10-08T14:12:00Z'
const titles = [
  'Part 5 - HAProxy Khi Load Balancing Là Công Việc Chính',
  "Designing a Chatbot's Communication Protocol",
  'CORS Là Gì? Vì Sao API Chạy Trên Postman Nhưng Browser Lại Chặn',
  'The Data Layer Is a Design Decision',
]
const blogs: AuthorAnalyticsApiPostMetric[] = titles.map((title, index) => ({
  ...analyticsOverviewApiFixture.data.top_blogs[0],
  post_id: 102 + index,
  title,
  views: [52, 21, 5, 4][index],
  estimated_unique_readers: [10, 16, 4, 3][index],
  completion_rate: [3 / 52, 12 / 21, 4 / 5, 3 / 4][index],
  avg_active_read_seconds: [9, 92, 48, 64][index],
  hearts_received: 0,
  shares: 0,
  link_clicks: 0,
}))
for (let index = 0; index < 8; index++)
  blogs.push({
    ...blogs[0],
    post_id: 200 + index,
    title: `Reading notes ${index + 1}: Systems and software`,
    views: index < 6 ? 3 : 2,
    completion_rate: index < 2 ? 2 / 3 : 0,
    estimated_unique_readers: 1,
    avg_active_read_seconds: 0,
  })
const daily = [
  3, 2, 2, 2, 3, 4, 2, 2, 1, 3, 3, 4, 4, 4, 5, 6, 4, 4, 4, 3, 3, 2, 2, 3, 4, 4, 3, 4, 5, 8,
]
const trend = daily.map((views, index) => ({
  date: new Date(Date.UTC(2026, 8, 9 + index)).toISOString().slice(0, 10),
  views,
  estimated_unique_readers: Math.ceil(views / 2),
  hearts_received: 0,
  shares: 0,
  completed: 0,
}))
function makeService(state: 'ready' | 'empty' | 'error' | 'denied') {
  const error =
    state === 'denied'
      ? { success: false as const, error: 'Permission denied', statusCode: 403 }
      : { success: false as const, error: 'Preview request failed', statusCode: 500 }
  const repository: AuthorAnalyticsRepositoryPort = {
    getOverview: async (requested) =>
      state === 'error' || state === 'denied'
        ? error
        : {
            success: true,
            data: {
              data: {
                ...analyticsOverviewApiFixture.data,
                range: requested,
                summary: {
                  ...analyticsOverviewApiFixture.data.summary,
                  views: state === 'empty' ? 0 : 104,
                  estimated_unique_readers: state === 'empty' ? 0 : 50,
                  completion_rate: state === 'empty' ? 0 : 0.25,
                  hearts_received: state === 'empty' ? 0 : 2,
                  shares: state === 'empty' ? 0 : 1,
                  link_clicks: state === 'empty' ? 0 : 1,
                },
                trend:
                  state === 'empty'
                    ? []
                    : trend.filter(
                        (point) => point.date >= requested.from && point.date <= requested.to,
                      ),
                data_fresh_through: fresh,
              },
            },
          },
    getPostMetrics: async ({ range: requested, page = 1, limit = 100 }) =>
      state === 'error' || state === 'denied'
        ? error
        : {
            success: true,
            data: {
              data: state === 'empty' ? [] : blogs.slice((page - 1) * limit, page * limit),
              page,
              limit,
              total: state === 'empty' ? 0 : blogs.length,
              range: requested,
              data_fresh_through: fresh,
            },
          },
    getPostDetail: async (id, requested) =>
      state === 'error' || state === 'denied'
        ? error
        : {
            success: true,
            data: {
              data: {
                ...analyticsPostDetailApiFixture.data,
                post: {
                  id,
                  title: blogs.find((blog) => blog.post_id === id)?.title ?? titles[0],
                  published_at: '2026-09-01T00:00:00Z',
                },
                range: requested,
                summary: {
                  ...(blogs.find((blog) => blog.post_id === id) ?? blogs[0]),
                  ...(state === 'empty'
                    ? {
                        views: 0,
                        estimated_unique_readers: 0,
                        completion_rate: 0,
                        avg_active_read_seconds: 0,
                      }
                    : {}),
                  unique_readers_approximate: true,
                  active_heart_count: 0,
                },
                progress_funnel:
                  state === 'empty' || id !== 102
                    ? []
                    : [
                        { stage: 'opened', sessions: 52, rate: 1 },
                        { stage: '25', sessions: 7, rate: 7 / 52 },
                        { stage: '50', sessions: 5, rate: 5 / 52 },
                        { stage: '75', sessions: 4, rate: 4 / 52 },
                        { stage: 'completed', sessions: 3, rate: 3 / 52 },
                      ],
                traffic_sources:
                  state === 'empty' || id !== 102
                    ? []
                    : [
                        {
                          category: 'direct',
                          host: '',
                          views: 49,
                          completion_rate: 0,
                          avg_active_read_seconds: 0,
                        },
                        {
                          category: 'referral',
                          host: 'localhost',
                          views: 3,
                          completion_rate: 0,
                          avg_active_read_seconds: 0,
                        },
                      ],
                reaction_trend: [],
                top_links: [],
                insights: [],
                data_fresh_through: fresh,
              },
            },
          },
  }
  return new AuthorAnalyticsService(repository)
}
const services = {
  ready: makeService('ready'),
  empty: makeService('empty'),
  error: makeService('error'),
  denied: makeService('denied'),
}
function MonitoringPreview({
  detail = false,
  state = 'ready',
}: {
  detail?: boolean
  state?: keyof typeof services
}) {
  const start = `/analytics${detail ? '/blog/102' : ''}?from=${range.from}&to=${range.to}`
  return (
    <>
      <Text recipe="metadata" px={4}>
        Design preview · fixture data · daily trend is illustrative
      </Text>
      <Routes>
        <Route path="/analytics" element={<AnalyticsOverviewPage service={services[state]} />} />
        <Route
          path="/analytics/blog/:id"
          element={<BlogAnalyticsPage service={services[state]} />}
        />
        <Route path="*" element={<Navigate to={start} replace />} />
      </Routes>
    </>
  )
}
const meta = {
  title: 'Author/Analytics monitoring',
  component: MonitoringPreview,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof MonitoringPreview>
export default meta
type Story = StoryObj<typeof meta>
export const Overview: Story = { args: { detail: false } }
export const Detail: Story = { args: { detail: true } }
export const Empty: Story = { args: { state: 'empty' } }
export const Error: Story = { args: { state: 'error' } }
export const Denied: Story = { args: { state: 'denied' } }

export const EmptyDetail: Story = { args: { detail: true, state: 'empty' } }

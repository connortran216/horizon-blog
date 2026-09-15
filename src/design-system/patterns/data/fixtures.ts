/**
 * Horizon Design System v2 - analytics and administration fixtures.
 *
 * Sample content for the B6 gallery. Nothing here is a measurement.
 *
 * Two constraints shape these values, and both matter more here than anywhere
 * else in the bundle:
 *
 * - **Nothing may be mistaken for real analytics.** Every title says "Sample",
 *   the numbers are round and obviously invented, and the series is generated
 *   from a fixed formula rather than copied from a real dashboard. A gallery
 *   screenshot of these panels must not be able to circulate as a report.
 * - **Nothing may be mistaken for a real access-control record.** The people in
 *   `samplePermissionSubjects` do not exist, their addresses are at
 *   `example.com`, and the roles are the shape of the real `ROLES` union rather
 *   than a snapshot of who actually has access to anything.
 */

import type { BreakdownItem, FunnelStage, TrendPoint } from './chart.logic'
import type { Insight } from './InsightList'
import type { PermissionSubject, RoleOption } from './PermissionTable'

/** A deterministic series, so the gallery renders the same chart every run. */
function sampleSeries(days: number, base: number): readonly TrendPoint[] {
  return Array.from({ length: days }, (_unused, index) => {
    const date = new Date(Date.UTC(2026, 2, 1 + index))

    return {
      label: date.toISOString().slice(0, 10),
      value: Math.round(base + (index % 7) * 9 + Math.sin(index * 1.1) * 14 + index * 1.4),
    }
  })
}

export const sampleTrend = sampleSeries(30, 60)

/** A series where nothing moves - the flat branch of the chart geometry. */
export const sampleFlatTrend: readonly TrendPoint[] = Array.from({ length: 7 }, (_u, index) => ({
  label: `2026-03-0${index + 1}`,
  value: 12,
}))

/** One point, which has no span to interpolate across. */
export const sampleSinglePointTrend: readonly TrendPoint[] = [{ label: '2026-03-01', value: 42 }]

export const sampleEmptyTrend: readonly TrendPoint[] = []

export const sampleFunnelStages: readonly FunnelStage[] = [
  { label: 'Opened the post', sessions: 412, rate: 1 },
  { label: 'Read a quarter', sessions: 371, rate: 0.9 },
  { label: 'Read half', sessions: 338, rate: 0.82 },
  { label: 'Read three quarters', sessions: 301, rate: 0.73 },
  { label: 'Reached the end', sessions: 279, rate: 0.68 },
]

/** Nobody opened it. Not a funnel of zeroes - an empty state. */
export const sampleEmptyFunnelStages: readonly FunnelStage[] = sampleFunnelStages.map((stage) => ({
  ...stage,
  sessions: 0,
  rate: 0,
}))

export const sampleTrafficSources: readonly BreakdownItem[] = [
  { label: 'Direct', value: 184, detail: 'No referrer' },
  { label: 'Search', value: 132, detail: 'sample-search.example.com' },
  { label: 'Social', value: 74, detail: 'sample-social.example.com' },
  { label: 'Newsletter', value: 21, detail: 'sample-newsletter.example.com' },
  { label: 'Aggregator', value: 9, detail: 'sample-aggregator.example.com' },
  { label: 'Forum', value: 6, detail: 'sample-forum.example.com' },
  { label: 'Wiki', value: 3, detail: 'sample-wiki.example.com' },
]

export interface SampleBlogRow {
  readonly postId: string
  readonly title: string
  readonly views: number
  readonly readers: number
  readonly readersApproximate: boolean
  readonly completionRate: number
  readonly activeReadSeconds: number
  readonly hearts: number
}

export const sampleBlogRows: readonly SampleBlogRow[] = [
  {
    postId: 'sample-1',
    title: 'Sample post: what a write-ahead log actually promises',
    views: 1284,
    readers: 903,
    // The estimated column. It must never render without its label.
    readersApproximate: true,
    completionRate: 0.68,
    activeReadSeconds: 412,
    hearts: 37,
  },
  {
    postId: 'sample-2',
    title: 'Sample post: đọc lại những gì mình viết một năm trước',
    views: 642,
    readers: 488,
    readersApproximate: true,
    completionRate: 0.74,
    activeReadSeconds: 388,
    hearts: 24,
  },
  {
    postId: 'sample-3',
    title: 'Sample post: an index is a promise about reads, and a bill for writes',
    views: 318,
    // Exact, because this one is small enough to count. The two must be
    // visually distinguishable in the same column.
    readers: 296,
    readersApproximate: false,
    completionRate: 0.51,
    activeReadSeconds: 176,
    hearts: 9,
  },
  {
    postId: 'sample-4',
    title: 'Sample post: published this morning, no readers yet',
    views: 0,
    readers: 0,
    readersApproximate: false,
    completionRate: 0,
    activeReadSeconds: 0,
    hearts: 0,
  },
]

export const sampleInsights: readonly Insight[] = [
  {
    code: 'sample-completion-above-baseline',
    message:
      'Sample insight: readers finish this post more often than your others in the same range.',
    sampleSize: 412,
    evidence: [{ metric: 'completion rate', value: '68%', baseline: '54%' }],
  },
  {
    code: 'sample-thin-sample',
    message: 'Sample insight: readers from the newsletter read further than average.',
    // Deliberately thin, so the gallery shows the caveat branch.
    sampleSize: 11,
    evidence: [{ metric: 'active read time', value: '6m 20s', baseline: '3m 55s' }],
  },
]

export const sampleRoleOptions: readonly RoleOption[] = [
  {
    value: 'member',
    label: 'Member',
    capabilities: 'Keep a profile and join discussions.',
  },
  {
    value: 'author',
    label: 'Author',
    capabilities: 'Write posts, manage Series, and read their own analytics.',
  },
  {
    value: 'admin',
    label: 'Admin',
    capabilities: 'Manage all content, taxonomy and role assignments.',
  },
]

/**
 * Invented people. None of these is a real account, and the roles are a
 * demonstration of the states, not a record of who has access to anything.
 */
export const samplePermissionSubjects: readonly PermissionSubject[] = [
  {
    id: 'sample-user-1',
    name: 'Sample Admin',
    email: 'sample.admin@example.com',
    serverRole: 'admin',
    isLocked: true,
    lockReason: 'At least one administrator must remain.',
  },
  {
    id: 'sample-user-2',
    name: 'Sample Author',
    email: 'sample.author@example.com',
    serverRole: 'author',
  },
  {
    id: 'sample-user-3',
    name: 'Sample Member (change in flight)',
    email: 'sample.member@example.com',
    serverRole: 'member',
    // The table still shows `member`, which is the point.
    requestedRole: 'author',
    isSaving: true,
  },
  {
    id: 'sample-user-4',
    name: 'Sample Member (change refused)',
    email: 'sample.refused@example.com',
    serverRole: 'member',
    requestedRole: 'admin',
    error: 'Your account can no longer assign roles.',
  },
]

export const sampleDateRangePresets = [
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: '90d', label: '90 days' },
  { key: 'custom', label: 'Custom' },
] as const

export const sampleDateRange = { from: '2026-03-01', to: '2026-03-30' }

/** The pipeline is two days behind the range, so the partial notice shows. */
export const samplePartialFreshThrough = '2026-03-28'

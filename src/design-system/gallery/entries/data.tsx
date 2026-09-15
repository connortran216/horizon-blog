/**
 * Horizon Design System v2 - analytics, table and administration entries.
 *
 * Every number below comes from the data fixtures, which are invented. Nothing
 * in this area is a measurement of anything.
 */

import { useState } from 'react'

import {
  Breakdown,
  DataTable,
  DateRange,
  DestructiveAction,
  Funnel,
  InsightList,
  Metric,
  MetricGrid,
  PermissionTable,
  Trend,
  type DataTableColumn,
  type DateRangeValue,
  type SortOrder,
} from '../../index'
import {
  sampleBlogRows,
  sampleDateRange,
  sampleDateRangePresets,
  sampleEmptyFunnelStages,
  sampleEmptyTrend,
  sampleFlatTrend,
  sampleFunnelStages,
  sampleInsights,
  samplePermissionSubjects,
  sampleRoleOptions,
  sampleSinglePointTrend,
  sampleTrafficSources,
  sampleTrend,
  type SampleBlogRow,
} from '../../patterns/data/fixtures'
import { Glyph, noop, type EntryRenderer } from './support'

const BLOG_COLUMNS: readonly DataTableColumn<SampleBlogRow>[] = [
  { key: 'title', label: 'Sample post', isSortable: true, render: (row) => row.title },
  {
    key: 'views',
    label: 'Views',
    isNumeric: true,
    isSortable: true,
    render: (row) => row.views.toLocaleString('en-GB'),
  },
  {
    key: 'readers',
    label: 'Readers',
    isNumeric: true,
    render: (row) =>
      row.readersApproximate
        ? `about ${row.readers.toLocaleString('en-GB')}`
        : row.readers.toLocaleString('en-GB'),
  },
  {
    key: 'hearts',
    label: 'Reactions',
    isNumeric: true,
    isSortable: true,
    render: (row) => row.hearts.toLocaleString('en-GB'),
  },
]

function MetricEntry({ state }: { readonly state: string }) {
  return (
    <Metric
      label="Sample views"
      value={1284}
      kind="count"
      isApproximate={state === 'approximate'}
      detail="Sample detail line under the number."
      caveat={state === 'with a caveat' ? 'Sample caveat: the sample is thin.' : undefined}
      isLoading={state === 'loading'}
      icon={<Glyph shape="dot" />}
    />
  )
}

function MetricGridEntry() {
  return (
    <MetricGrid columns={4}>
      <Metric label="Sample views" value={1284} kind="count" />
      <Metric label="Sample readers" value={903} kind="count" isApproximate />
      <Metric label="Sample completion" value={0.68} kind="percent" />
      <Metric label="Sample read time" value={412} kind="duration" />
    </MetricGrid>
  )
}

function TrendEntry({ state }: { readonly state: string }) {
  const points =
    state === 'flat'
      ? sampleFlatTrend
      : state === 'one point'
        ? sampleSinglePointTrend
        : state === 'no data'
          ? sampleEmptyTrend
          : sampleTrend

  return (
    <Trend
      title="Sample views over the sample range"
      points={state === 'loading' || state === 'failed' ? sampleEmptyTrend : points}
      detail="Sample detail. Thirty invented days."
      notice="Sample notice: the last two days are still settling."
      isLoading={state === 'loading'}
      failedAction={state === 'failed' ? 'load the sample trend' : undefined}
      deniedAction={state === 'denied' ? 'view these sample analytics' : undefined}
      deniedDetail={state === 'denied' ? 'Ask a sample administrator for access.' : undefined}
      rowCount={points.length}
    />
  )
}

function FunnelEntry({ state }: { readonly state: string }) {
  const stages = state === 'nobody arrived' ? sampleEmptyFunnelStages : sampleFunnelStages

  return (
    <Funnel
      title="Sample reader progress"
      detail="Sample detail. Five invented stages."
      stages={stages}
      caveat="Sample caveat: sessions under five seconds are excluded."
      rowCount={state === 'nobody arrived' ? 0 : stages.length}
    />
  )
}

function BreakdownEntry({ state }: { readonly state: string }) {
  const items = state === 'no sources' ? [] : sampleTrafficSources

  return (
    <Breakdown
      title="Sample traffic sources"
      detail="Sample detail. Seven invented referrers."
      items={items}
      maxRows={5}
      kind="count"
      unitLabel="sessions"
      rowCount={items.length}
    />
  )
}

function DataTableEntry({ state }: { readonly state: string }) {
  const [sortKey, setSortKey] = useState('views')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const rows =
    state === 'no rows' || state === 'loading' || state === 'failed' ? [] : sampleBlogRows

  return (
    <DataTable<SampleBlogRow>
      caption="Sample post performance"
      title="Sample posts"
      detail="Sample detail. Four invented rows."
      columns={BLOG_COLUMNS}
      rows={rows}
      rowKey={(row) => row.postId}
      sortKey={sortKey}
      sortOrder={sortOrder}
      onSortChange={(key, order) => {
        setSortKey(key)
        setSortOrder(order)
      }}
      totalRows={rows.length}
      isLoading={state === 'loading'}
      failedAction={state === 'failed' ? 'load the sample table' : undefined}
      rowCount={rows.length}
      emptySubject="sample rows"
      emptyNextAction="Publish a sample post and come back tomorrow."
    />
  )
}

function DateRangeEntry({ state }: { readonly state: string }) {
  const [preset, setPreset] = useState(state === 'custom' ? 'custom' : '30d')
  const [value, setValue] = useState<DateRangeValue>(sampleDateRange)

  return (
    <DateRange
      presets={sampleDateRangePresets}
      activePreset={preset}
      onPresetChange={setPreset}
      value={value}
      onValueChange={setValue}
      customPresetKey="custom"
      timeZoneLabel="Sample time zone (UTC+7)"
      maxDate="2026-03-30"
      isDisabled={state === 'disabled'}
    />
  )
}

function InsightListEntry({ state }: { readonly state: string }) {
  return (
    <InsightList
      title="Sample insights"
      detail="Sample detail. Two invented observations."
      insights={state === 'nothing to report' || state === 'failed' ? [] : sampleInsights}
      minimumSample={30}
      failedAction={state === 'failed' ? 'load the sample insights' : undefined}
    />
  )
}

function PermissionTableEntry({ state }: { readonly state: string }) {
  return (
    <PermissionTable
      caption="Sample access management"
      title="Sample people"
      detail="Sample detail. Four invented accounts."
      subjects={state === 'denied' ? [] : samplePermissionSubjects}
      roles={sampleRoleOptions}
      onRequestRole={noop}
      deniedAction={state === 'denied' ? 'manage sample roles' : undefined}
      deniedDetail={state === 'denied' ? 'Only a sample administrator can do this.' : undefined}
    />
  )
}

function DestructiveActionEntry({ state }: { readonly state: string }) {
  return (
    <DestructiveAction
      action="Delete"
      subject="the sample post"
      consequence="Its sample comments and reactions go with it."
      isReversible={state === 'reversible'}
      requiredConfirmation={state === 'typed confirmation' ? 'DELETE' : undefined}
      requiresAcknowledgement={state === 'typed confirmation'}
      isSubmitting={state === 'submitting'}
      deniedAction={state === 'denied' ? 'delete this sample post' : undefined}
      error={state === 'failed' ? 'The sample delete was rejected.' : undefined}
      onConfirm={noop}
      onCancel={noop}
    />
  )
}

export const dataEntries = {
  Metric: MetricEntry,
  MetricGrid: MetricGridEntry,
  Trend: TrendEntry,
  Funnel: FunnelEntry,
  Breakdown: BreakdownEntry,
  DataTable: DataTableEntry,
  DateRange: DateRangeEntry,
  InsightList: InsightListEntry,
  PermissionTable: PermissionTableEntry,
  DestructiveAction: DestructiveActionEntry,
} satisfies Record<string, EntryRenderer>

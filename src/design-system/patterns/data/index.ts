/**
 * Horizon Design System v2 - analytics, table and administration patterns.
 *
 * Covers the `data-admin-pattern` inventory rows - `AnalyticsMetricCard`,
 * `AnalyticsTrendChart`, `AnalyticsReactionTrend`, `ReaderProgressFunnel`,
 * `TrafficSourceBreakdown`, `BlogMetricsTable`, `LinkPerformanceTable`,
 * `AnalyticsDateRangeFilter` and `AnalyticsInsightList` - plus the table and
 * role controls of the access-management page.
 *
 * No charting library. `Trend`, `Funnel` and `Breakdown` are inline SVG and
 * token-sized bars built from `chart.logic.ts`, and their geometry is final at
 * the first paint.
 */

export { Metric, MetricGrid } from './Metric'
export type { MetricGridProps, MetricProps } from './Metric'

export { Trend } from './Trend'
export type { TrendProps } from './Trend'

export { Funnel } from './Funnel'
export type { FunnelProps } from './Funnel'

export { Breakdown } from './Breakdown'
export type { BreakdownProps } from './Breakdown'

export { DataTable } from './DataTable'
export type { DataTableColumn, DataTableProps } from './DataTable'

export { DateRange } from './DateRange'
export type { DateRangePreset, DateRangeProps, DateRangeValue } from './DateRange'

export { InsightList } from './InsightList'
export type { Insight, InsightEvidence, InsightListProps } from './InsightList'

export { PermissionTable } from './PermissionTable'
export type { PermissionSubject, PermissionTableProps, RoleOption } from './PermissionTable'

export { DestructiveAction } from './DestructiveAction'
export type { DestructiveActionProps } from './DestructiveAction'

export {
  assessCoverage,
  assessSample,
  dataPanelState,
  formatDuration,
  formatPercent,
  metricValue,
} from './metric.logic'
export type {
  CoverageAssessment,
  CoverageInput,
  DataPanelStateInput,
  DataPanelStatus,
  MetricKind,
  MetricValueInput,
  MetricValueOutput,
  SampleAssessment,
  SampleInput,
  SampleQuality,
} from './metric.logic'

export { breakdownRows, chartMotion, funnelRows, trendGeometry, trendSummary } from './chart.logic'
export type {
  BreakdownItem,
  BreakdownOptions,
  BreakdownResult,
  BreakdownRow,
  ChartMotion,
  FunnelRow,
  FunnelStage,
  TrendBounds,
  TrendGeometry,
  TrendPoint,
} from './chart.logic'

export {
  rowOverflow,
  sortHeader,
  tableAdaptation,
  tableCellStyle,
  tableScrollStyle,
} from './table.logic'
export type {
  MobileTableLayout,
  RowOverflowInput,
  RowOverflowOutput,
  SortHeaderInput,
  SortHeaderOutput,
  SortOrder,
  TableAdaptation,
  TableAdaptationInput,
  TableCellStyle,
  TableScrollStyle,
} from './table.logic'

export {
  destructiveCopy,
  destructiveGate,
  permissionRowState,
  roleChangeConfirmation,
} from './permission.logic'
export type {
  DestructiveCopy,
  DestructiveCopyInput,
  DestructiveGateInput,
  DestructiveGateOutput,
  PermissionRowInput,
  PermissionRowOutput,
  PermissionRowStatus,
  RoleChangeConfirmation,
} from './permission.logic'

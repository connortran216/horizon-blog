/**
 * Horizon Design System v2 - feedback barrel.
 *
 * Loading has three scopes (route, panel, inline) plus `Skeleton` for
 * content-shaped loading. The five settled states - empty, error, permission,
 * missing, offline - share `FeedbackSurface`. `RetryAction` is the only control
 * here, and it is passed into a state rather than built into one.
 */

export { EmptyState } from './EmptyState'
export type { EmptyStateProps } from './EmptyState'

export { ErrorState } from './ErrorState'
export type { ErrorStateProps } from './ErrorState'

export { FeedbackSurface } from './FeedbackSurface'
export type { FeedbackSurfaceProps } from './FeedbackSurface'

export { InlineLoading, LoadingIndicator, PageLoading, PanelLoading } from './LoadingIndicator'
export type { LoadingIndicatorProps, ScopedLoadingProps } from './LoadingIndicator'

export { MissingState } from './MissingState'
export type { MissingStateProps } from './MissingState'

export { OfflineState } from './OfflineState'
export type { OfflineStateProps } from './OfflineState'

export { PermissionState } from './PermissionState'
export type { PermissionStateProps } from './PermissionState'

export { RetryAction } from './RetryAction'
export type { RetryActionProps } from './RetryAction'

export { Skeleton } from './Skeleton'
export type { SkeletonProps } from './Skeleton'

export { resolveSkeletonDimensions, reservesLayout } from './Skeleton.logic'
export type {
  ResponsiveHeight,
  SkeletonDimensions,
  SkeletonLine,
  SkeletonShape,
} from './Skeleton.logic'

export {
  emptyMessage,
  failureMessage,
  feedbackTones,
  feedbackToneTokens,
  liveRegionFor,
  loadingLayoutFor,
  loadingMessage,
  missingMessage,
  namedSubject,
  offlineMessage,
  permissionMessage,
  retryAvailable,
  retryHint,
  retryLabel,
  retryingMessage,
  successMessage,
  vagueFailurePhrases,
} from './feedback.logic'
export type {
  FeedbackTone,
  FeedbackToneTokens,
  LiveRegionAttributes,
  LoadingLayout,
  LoadingScope,
  RetryStatus,
} from './feedback.logic'

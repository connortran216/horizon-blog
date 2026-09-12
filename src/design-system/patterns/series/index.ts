/**
 * Horizon Design System v2 - Series barrel.
 *
 * A Series carries a book identity: its own plate on the feature radius, a
 * spine, an ordinal part list joined by connectors, and a reading context that
 * is navigation rather than a card. None of it is a post surface with different
 * copy, and `series.test.ts` is where that stays true.
 */

export { SeriesCover } from './SeriesCover'
export type { SeriesCoverProps } from './SeriesCover'

export { SeriesCard } from './SeriesCard'
export type { SeriesCardOptions, SeriesCardProps } from './SeriesCard'

export { SeriesRail } from './SeriesRail'
export type { SeriesRailProps } from './SeriesRail'

export { RailOverlayControls } from './RailOverlayControls'
export type { RailOverlayControlsProps } from './RailOverlayControls'

export { SeriesContext } from './SeriesContext'
export type { SeriesContextProps } from './SeriesContext'

export { PartList } from './PartList'
export type { PartListProps } from './PartList'

export { ManageSeriesItem } from './ManageSeriesItem'
export type { ManageSeriesItemProps } from './ManageSeriesItem'

export {
  connectorColor,
  manageItemControls,
  manageRowRadius,
  moveItem,
  orderIsDirty,
  partConnector,
  partLabel,
  partOrdinal,
  removeItemAt,
  seriesContextLabel,
  seriesFacts,
  seriesIdentityLabel,
  seriesIsDistinctFromPostCard,
  seriesNavTargets,
  seriesPresentation,
  seriesTotalMinutes,
} from './series.logic'
export type {
  ManageItemControls,
  ManagedSeriesPart,
  MoveDirection,
  PartConnector,
  PartReadingState,
  SeriesCoverImage,
  SeriesDetail,
  SeriesFact,
  SeriesNavDirection,
  SeriesNavTarget,
  SeriesPartSummary,
  SeriesPresentation,
  SeriesReadingContext,
  SeriesSummary,
} from './series.logic'

export {
  RAIL_PEEK_FRACTION,
  appendRailItems,
  railItemBasis,
  railItemBasisResponsive,
  railKeyboardAction,
  railKeyboardTarget,
  railLoadStatus,
  railOverlayControlStyle,
  railPosition,
  railRangeDisplay,
  railScrollBehavior,
  railScrollStep,
  railScrollTarget,
  shouldRequestMore,
} from './rail.logic'
export type {
  RailIdentified,
  RailKeyAction,
  RailLoadInput,
  RailLoadStatus,
  RailMeasurements,
  RailOverlayControlStyle,
  RailPosition,
  RailRangeDisplay,
  RailVisibleItems,
} from './rail.logic'

export {
  DRAG_THRESHOLD_PX,
  dragBegin,
  dragCancel,
  dragClickConsumed,
  dragEnd,
  dragMove,
  dragScrollTarget,
  idleDragState,
  shouldSuppressClick,
} from './drag.logic'
export type { DragSample, DragState } from './drag.logic'

/**
 * Horizon Design System v2 - post discovery barrel.
 *
 * Two shared content contracts - `AuthorIdentity` and `PostMetadata` - and four
 * distinct ways of drawing a post: Signature, Featured, card and row. They are
 * four components rather than one component with a size prop, because
 * `DESIGN.md` makes "one universal card" a non-goal and
 * `presentation.logic.ts` is where that separation is kept honest.
 */

export { AuthorIdentity, authorAvatarRadius } from './AuthorIdentity'
export type { AuthorIdentityProps, AuthorIdentitySize } from './AuthorIdentity'

export { PostMetadata } from './PostMetadata'
export type { PostMetadataProps } from './PostMetadata'

export { SignatureStory } from './SignatureStory'
export type { SignatureStoryProps } from './SignatureStory'

export { FeaturedStory } from './FeaturedStory'
export type { FeaturedStoryProps } from './FeaturedStory'

export { PostCard } from './PostCard'
export type { PostCardProps } from './PostCard'

export { PostRow } from './PostRow'
export type { PostRowProps } from './PostRow'

export { FilterBar } from './FilterBar'
export type { FilterBarProps, FilterSortOption } from './FilterBar'

export { Pagination } from './Pagination'
export type { PaginationProps } from './Pagination'

export {
  UNKNOWN_AUTHOR_NAME,
  authorDisplayName,
  authorInitials,
  authorProfileHref,
  excerptOrNull,
  formatPostDate,
  pluralise,
  postMetadataItems,
  readingTimeLabel,
  seriesPositionLabel,
  visibleTags,
} from './content.logic'
export type {
  AuthorIdentity as AuthorIdentityContent,
  FormattedDate,
  PostCoverImage,
  PostMetadataContent,
  PostMetadataItem,
  PostMetadataItemKind,
  PostMetadataOptions,
  PostSeriesReference,
  PostSummary,
  VisibleTags,
} from './content.logic'

export {
  duplicatedWords,
  hierarchyContext,
  labelWords,
  labelsAreRedundant,
  normaliseLabel,
  resolveHierarchyLabel,
} from './hierarchy.logic'

export {
  cardLinkOverlayStyle,
  coverBleeds,
  patternsAreDistinct,
  postPatterns,
  postPresentation,
  postRadiusScale,
  titleSizePx,
} from './presentation.logic'
export type { CardLinkOverlay, PostPattern, PostPresentation } from './presentation.logic'

export {
  activeFilterChips,
  clearAllFilters,
  clearQuery,
  emptyFilterState,
  filterBarStatus,
  filterResultSummary,
  hasActiveFilters,
  movePagedRegionIntoView,
  noResultsNextAction,
  pageButtonLabel,
  paginationModel,
  pagingMovesReader,
  pagingScrollBehavior,
  removeFilterTag,
  toggleTag,
} from './discovery.logic'
export type {
  ActiveFilterChip,
  ActiveFilterKind,
  FilterBarStatus,
  FilterBarStatusInput,
  FilterState,
  FilterTag,
  PagedRegionElement,
  PagedRegionMove,
  PaginationEntry,
  PaginationInput,
  PaginationModel,
} from './discovery.logic'

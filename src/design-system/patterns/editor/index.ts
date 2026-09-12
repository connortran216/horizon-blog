/**
 * Horizon Design System v2 - editor and publishing patterns.
 *
 * Covers the `editor-publishing-pattern` inventory rows - `EditorWorkspace`,
 * `EditorMetaBar`, `EditorTagField`, `PublishBlogPreviewCard` and
 * `ActiveScheduleNotice` - and the chrome half of the `editor-integration` rows
 * (`CrepeEditor`, `CrepePreview`, `MarkdownEditor`, `MilkdownEditor`,
 * `MermaidZoomModal`).
 *
 * The editor libraries themselves are not replaced and are not wrapped.
 * `WorkspaceShell` takes the writing surface and the rendered preview as
 * children; whichever library produces them stays exactly where it is.
 *
 * `SeriesManagerForm` is here rather than in `patterns/series` because it is a
 * workspace: explicit saving, an unsaved-changes state, and a destructive
 * action the server owns. It composes `ManageSeriesItem` and the reorder
 * helpers from `patterns/series` instead of redrawing either.
 */

export { WorkspaceShell } from './WorkspaceShell'
export type { WorkspaceShellProps } from './WorkspaceShell'

export { EditorToolbar } from './EditorToolbar'
export type { EditorCommand, EditorToolbarProps } from './EditorToolbar'

export { MetadataBar } from './MetadataBar'
export type { MetadataBarProps } from './MetadataBar'

export { TagField } from './TagField'
export type { TagFieldProps } from './TagField'

export { MediaControl } from './MediaControl'
export type { MediaControlProps } from './MediaControl'

export { PreviewCard } from './PreviewCard'
export type { PreviewCardProps } from './PreviewCard'

export { AutosaveState } from './AutosaveState'
export type { AutosaveStateProps } from './AutosaveState'

export { PublishPanel } from './PublishPanel'
export type { PublishPanelProps } from './PublishPanel'

export { ScheduleNotice } from './ScheduleNotice'
export type { ScheduleNoticeProps } from './ScheduleNotice'

export { SeriesManagerForm } from './SeriesManagerForm'
export type { SeriesManagerFormProps } from './SeriesManagerForm'

export {
  addTag,
  autosaveState,
  draftRecovery,
  normalizeTag,
  removeTag,
  uploadState,
  workspaceGap,
  workspaceLayout,
  workspaceModes,
} from './workspace.logic'
export type {
  AutosaveIcon,
  AutosaveStateInput,
  AutosaveStateOutput,
  AutosaveStatus,
  DraftRecoveryInput,
  DraftRecoveryOutput,
  TagAddInput,
  TagAddOutput,
  UploadStateInput,
  UploadStateOutput,
  UploadStatus,
  WorkspaceLayout,
  WorkspaceMode,
} from './workspace.logic'

export {
  addBlogFieldState,
  addBlogToSeries,
  addableBlogOptions,
  resolveSeriesParts,
  seriesDeleteCopy,
  seriesDeleteState,
  seriesFormDirty,
  seriesFormState,
  seriesSaveGate,
  seriesSaveRequest,
} from './seriesManager.logic'
export type {
  AddBlogFieldInput,
  AddBlogFieldOutput,
  AddBlogFieldStatus,
  AddBlogInput,
  AddBlogOutput,
  AddableBlogsInput,
  ResolvePartsInput,
  SeriesBlogOption,
  SeriesDeleteStateInput,
  SeriesDeleteStateOutput,
  SeriesDeleteStatus,
  SeriesFormDirty,
  SeriesFormIcon,
  SeriesFormStateInput,
  SeriesFormStateOutput,
  SeriesFormStatus,
  SeriesFormTone,
  SeriesFormValues,
  SeriesSaveGateInput,
  SeriesSaveGateOutput,
  SeriesSaveRequest,
} from './seriesManager.logic'

export {
  SCHEDULE_GRACE_MS,
  publicationCopy,
  publishGate,
  scheduleState,
  scheduleSummary,
  scheduleValidity,
} from './schedule.logic'
export type {
  PublicationCopy,
  PublicationState,
  PublishGateInput,
  PublishGateOutput,
  PublishMode,
  ScheduleInvalidReason,
  ScheduleState,
  ScheduleStateInput,
  ScheduleSummary,
  ScheduleSummaryInput,
  ScheduleValidity,
  ScheduleValidityInput,
} from './schedule.logic'

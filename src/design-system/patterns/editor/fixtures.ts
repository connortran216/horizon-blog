/**
 * Horizon Design System v2 - editor fixtures.
 *
 * Sample content for the B6 gallery. Every draft here is invented: the titles
 * describe articles nobody wrote, and the timestamps are relative to a fixed
 * reference moment so the gallery renders the same way on every run.
 *
 * `sampleNow` is what makes the schedule states reproducible. A fixture that
 * used the real clock would show "Scheduled" today and "Needs attention"
 * tomorrow, and the gallery would stop demonstrating the state it claims to.
 */

import type { AutosaveStateInput, WorkspaceMode } from './workspace.logic'
import type { PublicationState } from './schedule.logic'
import type { PreviewCardProps } from './PreviewCard'
import type {
  SeriesBlogOption,
  SeriesFormStateInput,
  SeriesFormValues,
} from './seriesManager.logic'

/** The moment every schedule fixture is measured against. */
export const sampleNow = new Date('2026-03-10T09:00:00.000Z')

const offsetFrom = (ms: number) => new Date(sampleNow.getTime() + ms).toISOString()

export const sampleSchedules = {
  /** Comfortably in the future. */
  scheduled: offsetFrom(3 * 86_400_000),
  /** Inside the worker's grace window. */
  publishing: offsetFrom(-60_000),
  /** Past the grace window and still a draft. */
  overdue: offsetFrom(-2 * 86_400_000),
  /** A timestamp the API could return and the browser cannot read. */
  unreadable: 'not-a-timestamp',
} as const

/** Every autosave branch, in precedence order, for the gallery's state matrix. */
export const sampleAutosaveStates: ReadonlyArray<{
  name: string
  input: AutosaveStateInput
}> = [
  { name: 'Idle', input: {} },
  { name: 'Unsaved changes', input: { hasUnsavedChanges: true } },
  { name: 'Saving', input: { isSaving: true } },
  { name: 'Saved', input: { lastSavedLabel: 'a moment ago' } },
  {
    name: 'Failed',
    input: { error: 'The title is longer than the server accepts. Shorten it and try again.' },
  },
  { name: 'Offline', input: { isOffline: true } },
  { name: 'Permission lost', input: { permissionLost: true } },
]

export const samplePublicationStates: readonly PublicationState[] = [
  'draft',
  'scheduled',
  'publishing',
  'needsAttention',
  'published',
]

export const sampleWorkspaceModes: readonly WorkspaceMode[] = ['write', 'preview', 'split']

export const sampleTags: readonly string[] = ['Sample tag', 'Databases', 'Xử lý dữ liệu']

export const sampleDraftTitle =
  'Sample draft: what a write-ahead log actually promises, and what it does not'

export const sampleDraftBody = `# Sample draft

This is placeholder writing for the design system gallery. It exists to give the
preview pane something with real paragraph rhythm, a heading, and a code span
like \`fsync()\` in the middle of a sentence.

Nothing here describes a real system.`

export const samplePreviewCard: PreviewCardProps = {
  title: sampleDraftTitle,
  excerpt:
    'Sample excerpt. A durability guarantee is a promise about what survives a crash, which is a narrower promise than most of us read it as.',
  coverUrl: null,
  tags: sampleTags,
  author: { name: 'Sample Author', avatarUrl: null },
  publicationDate: '13 Mar 2026',
  publicationDateLabel: 'Scheduled for',
  readingTime: '7 min read',
}

/* -------------------------------------------------------------------------- */
/* Series management                                                          */
/* -------------------------------------------------------------------------- */

/** The id the fixture Series is keyed on, for the one-Series-per-blog rule. */
export const sampleSeriesId = 'sample-series-1'

/** What the fixture server holds. The baseline the dirty states are read from. */
export const sampleSeriesSaved: SeriesFormValues = {
  title: 'Sample Series: what durability actually promises',
  description:
    'Placeholder copy for the gallery. Four invented blogs, read in the order below, about a system nobody runs.',
  partIds: ['1', '2', '3'],
}

/** Every blog the fixture author owns. `5` is held by another Series. */
export const sampleSeriesBlogOptions: readonly SeriesBlogOption[] = [
  { id: '1', title: 'Sample part one: the write-ahead log', status: 'published' },
  { id: '2', title: 'Sample part two: checkpoints and truncation', status: 'published' },
  { id: '3', title: 'Sample part three: what fsync() does not promise', status: 'draft' },
  { id: '4', title: 'Sample draft with no Series yet', status: 'draft' },
  { id: '5', title: 'Sample blog held by another Series', status: 'scheduled' },
]

export const sampleAssignedSeriesByPartId: ReadonlyMap<string, string> = new Map([
  ['1', sampleSeriesId],
  ['2', sampleSeriesId],
  ['3', sampleSeriesId],
  ['5', 'sample-series-2'],
])

/** Every Series-form branch, in precedence order, for the state matrix. */
export const sampleSeriesFormStates: ReadonlyArray<{
  name: string
  input: SeriesFormStateInput
}> = [
  { name: 'Idle', input: { partCount: 3 } },
  { name: 'Saved', input: { partCount: 3, lastSavedLabel: 'a moment ago' } },
  { name: 'Empty Series', input: { partCount: 0 } },
  { name: 'Unsaved changes', input: { partCount: 3, isDirty: true } },
  { name: 'Unsaved order', input: { partCount: 3, isDirty: true, hasDirtyOrder: true } },
  { name: 'Delete denied', input: { deleteDeniedAction: 'delete this Series' } },
  {
    name: 'Save failed',
    input: { saveError: 'Another Series already uses that title. Pick a different one.' },
  },
  { name: 'Saving', input: { isSaving: true } },
  { name: 'Deleting', input: { isDeleting: true } },
  { name: 'Loading', input: { isLoading: true } },
  { name: 'Permission lost', input: { deniedAction: 'edit this Series' } },
]

/** MIME types and limit the gallery uses. The real ones come from the API. */
export const sampleUploadLimits = {
  acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
  maxBytes: 5 * 1024 * 1024,
}

/**
 * Horizon Design System v2 - editor and publishing entries.
 *
 * The writing surface and the preview are plain gallery blocks. That matches
 * production: `WorkspaceShell` never wraps Milkdown or Crepe, it is handed
 * whatever they render.
 */

import { useState } from 'react'
import { Box } from '@chakra-ui/react'

import {
  AutosaveState,
  Button,
  EditorToolbar,
  MediaControl,
  MetadataBar,
  PreviewCard,
  PublishPanel,
  ScheduleNotice,
  SeriesManagerForm,
  TagField,
  Text,
  WorkspaceShell,
  type PublishMode,
  type SeriesFormValues,
  type WorkspaceMode,
} from '../../index'
import { space } from '../../../theme/tokens'
import {
  sampleAssignedSeriesByPartId,
  sampleAutosaveStates,
  sampleDraftBody,
  sampleDraftTitle,
  sampleNow,
  samplePreviewCard,
  sampleSchedules,
  sampleSeriesBlogOptions,
  sampleSeriesId,
  sampleSeriesSaved,
  sampleTags,
  sampleUploadLimits,
} from '../../patterns/editor/fixtures'
import { useGallery } from '../GalleryContext'
import { longCopy } from '../content'
import { Filler, Glyph, noop, type EntryRenderer } from './support'

function WritingSurface() {
  return (
    <Box
      border="1px dashed"
      borderColor="border.subtle"
      borderRadius="control"
      p={space[3]}
      minH={space[24]}
    >
      <Text recipe="body">{sampleDraftBody}</Text>
    </Box>
  )
}

function WorkspaceShellEntry({ state }: { readonly state: string }) {
  const mode: WorkspaceMode =
    state === 'split' ? 'split' : state === 'preview' ? 'preview' : 'write'

  return (
    <WorkspaceShell
      mode={mode}
      deniedAction={state === 'denied' ? 'edit this sample draft' : undefined}
      deniedDetail={state === 'denied' ? 'Your sample author role was removed.' : undefined}
      status={<AutosaveState lastSavedLabel="a moment ago" compact />}
      toolbar={<EditorToolbar mode={mode} onModeChange={noop} />}
      metadata={<MetadataBar title={sampleDraftTitle} onTitleChange={noop} publication="draft" />}
      editor={<WritingSurface />}
      preview={<PreviewCard {...samplePreviewCard} />}
      actions={<Button tone="primary">Publish sample draft</Button>}
      footer={<Text recipe="metadata">Sample workspace footer.</Text>}
    />
  )
}

function EditorToolbarEntry() {
  const [mode, setMode] = useState<WorkspaceMode>('write')

  return (
    <EditorToolbar
      mode={mode}
      onModeChange={setMode}
      commands={[
        { id: 'bold', label: 'Bold', icon: <Glyph shape="bar" />, onInvoke: noop },
        { id: 'link', label: 'Insert link', icon: <Glyph shape="arrow" />, onInvoke: noop },
        {
          id: 'image',
          label: 'Insert image',
          icon: <Glyph shape="dot" />,
          onInvoke: noop,
          isDisabled: true,
        },
      ]}
    />
  )
}

function MetadataBarEntry({ state }: { readonly state: string }) {
  const gallery = useGallery()
  const [title, setTitle] = useState(gallery.copy(sampleDraftTitle, longCopy.title))

  return (
    <MetadataBar
      title={title}
      onTitleChange={setTitle}
      publication="scheduled"
      author={{ name: 'Sample Author', avatarUrl: gallery.image }}
      isDisabled={state === 'disabled'}
      titleError={
        state === 'title rejected' ? 'That title is longer than the server accepts.' : undefined
      }
      tagField={<TagField tags={sampleTags} onChange={noop} />}
    />
  )
}

function TagFieldEntry({ state }: { readonly state: string }) {
  const [tags, setTags] = useState<readonly string[]>(state === 'empty' ? [] : sampleTags)

  return (
    <TagField
      tags={tags}
      onChange={setTags}
      maxTags={5}
      maxLength={24}
      hint="Press Enter to add a sample topic."
      error={state === 'rejected' ? 'That sample topic is already on the draft.' : undefined}
    />
  )
}

function MediaControlEntry({ state }: { readonly state: string }) {
  const gallery = useGallery()
  const hasMedia = state !== 'no cover yet'

  return (
    <MediaControl
      src={hasMedia ? gallery.image : null}
      alt="Sample cover artwork"
      hasMedia={hasMedia && gallery.image !== null}
      acceptedTypes={sampleUploadLimits.acceptedTypes}
      onSelectFile={noop}
      onRemove={noop}
      onRetry={noop}
      label="Sample cover image"
      hint="JPEG, PNG or WebP, up to five megabytes."
      isUploading={state === 'uploading'}
      error={state === 'upload failed' ? 'That sample upload was rejected.' : undefined}
      deniedAction={state === 'denied' ? 'change this sample cover' : undefined}
    />
  )
}

function PreviewCardEntry() {
  const gallery = useGallery()

  return (
    <PreviewCard
      {...samplePreviewCard}
      title={gallery.copy(samplePreviewCard.title, longCopy.title)}
      excerpt={gallery.copy(samplePreviewCard.excerpt ?? '', longCopy.excerpt)}
      coverUrl={gallery.image}
      coverAlt="Sample cover artwork"
    />
  )
}

function AutosaveStateEntry({ state }: { readonly state: string }) {
  const match =
    sampleAutosaveStates.find((entry) => entry.name.toLowerCase() === state.toLowerCase()) ??
    sampleAutosaveStates[0]

  return <AutosaveState {...match.input} />
}

function PublishPanelEntry({ state }: { readonly state: string }) {
  const [mode, setMode] = useState<PublishMode>(state === 'schedule' ? 'schedule' : 'now')
  const [date, setDate] = useState('2026-03-13')
  const [time, setTime] = useState('09:00')

  return (
    <PublishPanel
      mode={mode}
      onModeChange={setMode}
      date={date}
      onDateChange={setDate}
      time={time}
      onTimeChange={setTime}
      onSubmit={noop}
      hasTitle
      hasContent
      now={sampleNow}
      isSubmitting={state === 'submitting'}
      deniedAction={state === 'denied' ? 'publish this sample draft' : undefined}
      submitError={state === 'submit failed' ? 'The sample publish was rejected.' : undefined}
      existingScheduledAt={state === 'schedule' ? sampleSchedules.scheduled : undefined}
    >
      <Filler>Sample slot for whatever the page wants under the publish controls.</Filler>
    </PublishPanel>
  )
}

function ScheduleNoticeEntry({ state }: { readonly state: string }) {
  const scheduledAt =
    state === 'publishing'
      ? sampleSchedules.publishing
      : state === 'overdue'
        ? sampleSchedules.overdue
        : state === 'unreadable timestamp'
          ? sampleSchedules.unreadable
          : sampleSchedules.scheduled

  return (
    <ScheduleNotice
      scheduledAt={scheduledAt}
      now={sampleNow}
      actions={<Button tone="quiet">Reschedule sample draft</Button>}
    />
  )
}

/**
 * The Series manager, driven entirely by the state name.
 *
 * `saved` is the fixture server's copy and `draft` is what the reviewer is
 * looking at, so "unsaved order" is a genuine difference between the two rather
 * than a flag - the same thing the real form compares.
 */
function SeriesManagerFormEntry({ state }: { readonly state: string }) {
  const saved: SeriesFormValues =
    state === 'empty Series' ? { ...sampleSeriesSaved, partIds: [] } : sampleSeriesSaved
  const [draft, setDraft] = useState<SeriesFormValues>(() =>
    state === 'unsaved order' ? { ...saved, partIds: ['2', '1', '3'] } : saved,
  )

  return (
    <SeriesManagerForm
      seriesId={sampleSeriesId}
      saved={saved}
      draft={draft}
      onTitleChange={(title) => setDraft((current) => ({ ...current, title }))}
      onDescriptionChange={(description) => setDraft((current) => ({ ...current, description }))}
      onPartIdsChange={(partIds) => setDraft((current) => ({ ...current, partIds }))}
      options={sampleSeriesBlogOptions}
      assignedSeriesByPartId={sampleAssignedSeriesByPartId}
      onSave={noop}
      onDelete={noop}
      isLoading={state === 'loading'}
      isSaving={state === 'saving'}
      saveError={
        state === 'save failed'
          ? 'Another sample Series already uses that title. Pick a different one.'
          : undefined
      }
      lastSavedLabel="a moment ago"
      isDeleting={state === 'deleting'}
      deleteDeniedAction={state === 'delete denied' ? 'delete this sample Series' : undefined}
      deniedAction={state === 'permission lost' ? 'edit this sample Series' : undefined}
    />
  )
}

export const editorEntries = {
  WorkspaceShell: WorkspaceShellEntry,
  EditorToolbar: EditorToolbarEntry,
  MetadataBar: MetadataBarEntry,
  TagField: TagFieldEntry,
  MediaControl: MediaControlEntry,
  PreviewCard: PreviewCardEntry,
  AutosaveState: AutosaveStateEntry,
  PublishPanel: PublishPanelEntry,
  ScheduleNotice: ScheduleNoticeEntry,
  SeriesManagerForm: SeriesManagerFormEntry,
} satisfies Record<string, EntryRenderer>

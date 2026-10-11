/**
 * Horizon Design System v2 - Series entries.
 */

import { useState } from 'react'
import { Box } from '@chakra-ui/react'

import {
  Button,
  ManageSeriesItem,
  PartList,
  RailOverlayControls,
  SeriesCard,
  SeriesContext,
  SeriesComposer,
  SeriesCover,
  SeriesRail,
  SeriesSpine,
  moveItem,
  removeItemAt,
  type ManagedSeriesPart,
} from '../../index'
import { space } from '../../../theme/tokens'
import {
  sampleManagedParts,
  sampleSeriesContext,
  sampleSpineAllLive,
  sampleSpineParts,
  sampleSpineWithGap,
  sampleSeriesContextAtStart,
} from '../../patterns/series/fixtures'
import { useGallery } from '../GalleryContext'
import { sampleBareSeries, sampleSeriesParts } from '../content'
import { noop, type EntryRenderer } from './support'

function SeriesCoverEntry({ state }: { readonly state: string }) {
  const gallery = useGallery()

  return (
    <Box maxW={space[24]}>
      <SeriesCover
        cover={state === 'no artwork' ? null : gallery.series.cover}
        title={gallery.series.title}
        withSpine
      />
    </Box>
  )
}

function SeriesCardEntry({ state }: { readonly state: string }) {
  const gallery = useGallery()

  return (
    <SeriesCard
      series={state === 'no artwork or description' ? sampleBareSeries : gallery.series}
    />
  )
}

function SeriesRailEntry({ state }: { readonly state: string }) {
  const gallery = useGallery()

  return (
    <SeriesRail
      items={state === 'empty' ? [] : gallery.seriesShelf}
      label="Sample Series shelf"
      /* The shelf, not the card, knows whether its source has artwork at all. */
      cardOptions={state === 'no artwork on the shelf' ? { showCover: false } : undefined}
      hasMore={state === 'loading more' || state === 'load failed'}
      isLoadingMore={state === 'loading more'}
      loadMoreError={state === 'load failed' ? 'The next sample page could not be loaded.' : null}
      onLoadMore={noop}
      emptyNextAction="Start a sample Series to see it here."
    />
  )
}

function RailOverlayControlsEntry({ state }: { readonly state: string }) {
  const atStart = state === 'at the start'

  return (
    <Box position="relative" bg="bg.subtle" borderRadius="card" p={space[8]} minH={space[16]}>
      <RailOverlayControls
        onPrevious={noop}
        onNext={noop}
        canScrollPrevious={!atStart}
        canScrollNext
        itemLabel="Series"
      />
    </Box>
  )
}

function SeriesContextEntry({ state }: { readonly state: string }) {
  return (
    <SeriesContext
      context={state === 'first part' ? sampleSeriesContextAtStart : sampleSeriesContext}
    />
  )
}

function PartListEntry({ state }: { readonly state: string }) {
  return (
    <PartList
      parts={sampleSeriesParts}
      label="Parts of the sample Series"
      currentIndex={state === 'with a current part' ? 2 : null}
    />
  )
}

function ManageSeriesItemEntry({ state }: { readonly state: string }) {
  const [items, setItems] = useState<readonly ManagedSeriesPart[]>(sampleManagedParts)
  const index = state === 'middle' ? 1 : state === 'last' ? items.length - 1 : 0

  if (items.length === 0) {
    return null
  }

  return (
    <ManageSeriesItem
      item={items[Math.min(index, items.length - 1)]}
      index={Math.min(index, items.length - 1)}
      count={items.length}
      isBusy={state === 'busy'}
      onMove={(from, direction) => setItems((current) => moveItem(current, from, direction))}
      onRemove={(at) => setItems((current) => removeItemAt(current, at))}
    />
  )
}

function SeriesSpineEntry({ state }: { readonly state: string }) {
  const parts =
    state === 'all live'
      ? sampleSpineAllLive
      : state === 'gap after Part 1'
        ? sampleSpineWithGap
        : state === 'no parts yet'
          ? []
          : sampleSpineParts

  return (
    <SeriesSpine
      title="Sample Series on the owner's profile"
      description="Sample description. One or two sentences on what the sample Series covers."
      parts={parts}
      meta="Updated Oct 8"
      action={
        <Button tone="secondary" size="md" onClick={noop}>
          Manage
        </Button>
      }
    />
  )
}

function SeriesComposerEntry({ state }: { readonly state: string }) {
  const [title, setTitle] = useState(state === 'no title yet' ? '' : 'Sample Series')
  const [description, setDescription] = useState(
    state === 'no title yet' ? '' : 'Sample description of what the Series covers.',
  )

  return (
    <SeriesComposer
      title={title}
      description={description}
      onTitleChange={setTitle}
      onDescriptionChange={setDescription}
      onSubmit={noop}
      onCancel={noop}
      isSubmitting={state === 'creating'}
      error={state === 'create failed' ? 'This Series could not be created.' : null}
    />
  )
}

export const seriesEntries = {
  SeriesCover: SeriesCoverEntry,
  SeriesCard: SeriesCardEntry,
  SeriesRail: SeriesRailEntry,
  RailOverlayControls: RailOverlayControlsEntry,
  SeriesContext: SeriesContextEntry,
  PartList: PartListEntry,
  ManageSeriesItem: ManageSeriesItemEntry,
  SeriesSpine: SeriesSpineEntry,
  SeriesComposer: SeriesComposerEntry,
} satisfies Record<string, EntryRenderer>

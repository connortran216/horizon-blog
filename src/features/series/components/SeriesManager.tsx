/**
 * One owned Series, managed.
 *
 * The form itself is the design system's `SeriesManagerForm`, which was built
 * for this screen: identity fields, the ordered rows (`ManageSeriesItem`), the
 * add-a-blog control, an explicit save and a server-owned delete. What is left
 * in this file is the adapter between that form and `useOwnerSeries`, and it
 * does three jobs.
 *
 * **It translates ids.** The API speaks in numbers and the form speaks in
 * strings, because a `select` value and a React key are strings. The conversion
 * happens here, once, at the boundary - nothing above it sees a string id and
 * nothing below it sees a number.
 *
 * **It holds the draft.** The form is controlled, as every editor pattern in the
 * system is, so the unsaved title, description and order live here and reset
 * whenever the server hands back a new `series` object. That reset is the same
 * `useEffect` the legacy component had, for the same reason.
 *
 * **It turns one save into the requests the API actually needs.**
 * `seriesSaveRequest` reports which of the two endpoints a save has to touch,
 * and only those are called. The legacy component had two separate buttons -
 * "Save details" and "Save blog order" - so an author who renamed a Series and
 * reordered it had to press twice and could leave with half of it saved. One
 * button now covers both, and if the second request fails the failure is
 * reported and the draft stays exactly where it is.
 *
 * Nothing about who may do this moved. `useOwnerSeries` calls the same service
 * methods it always did, and the server's answer is the only thing that removes
 * a Series from the list - `onDelete` resolves before the parent stops rendering
 * this form.
 */

import { useEffect, useMemo, useRef, useState } from 'react'

import {
  SeriesManagerForm,
  type ManagedSeriesPart,
  type SeriesFormValues,
  type SeriesSaveRequest,
} from '../../../design-system'
import { OwnerSeries } from '../series.types'

export interface SeriesBlogOption {
  id: number
  title: string
  status: 'draft' | 'published'
}

interface SeriesManagerProps {
  series: OwnerSeries
  blogOptions: SeriesBlogOption[]
  assignedSeriesByPostId: Map<number, number>
  onUpdate: (seriesId: number, input: { title: string; description: string }) => Promise<void>
  onReplacePosts: (seriesId: number, postIds: number[]) => Promise<void>
  onDelete: (seriesId: number) => Promise<void>
  /** The list of owned blogs could not be loaded. Passed through to the form. */
  optionsError?: string
  onRetryOptions?: () => void
}

const savedValuesOf = (series: OwnerSeries): SeriesFormValues => ({
  title: series.title,
  description: series.description,
  partIds: series.parts.map((part) => String(part.postId)),
})

const messageOf = (error: unknown, fallback: string): string =>
  error instanceof Error && error.message.trim().length > 0 ? error.message : fallback

const SeriesManager = ({
  series,
  blogOptions,
  assignedSeriesByPostId,
  onUpdate,
  onReplacePosts,
  onDelete,
  optionsError,
  onRetryOptions,
}: SeriesManagerProps) => {
  const saved = useMemo(() => savedValuesOf(series), [series])

  const [draft, setDraft] = useState<SeriesFormValues>(saved)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | undefined>(undefined)
  const [lastSavedLabel, setLastSavedLabel] = useState<string | undefined>(undefined)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | undefined>(undefined)

  /*
   * True from the moment a save starts until the moment it settles, either way.
   *
   * A ref rather than `isSaving`, because the effect below has to read it
   * without depending on it. It is the guard on a real defect: a save that
   * changes both the identity and the order makes two requests, and the first
   * one comes back with a Series that still has the old order in it. The effect
   * would take that as the new truth and put the author's reordered rows back
   * where they were - mid-save, and permanently if the second request then
   * failed.
   */
  const isSavingRef = useRef(false)

  /*
   * The server answered with a different Series, so what is on screen describes
   * one that no longer exists and the draft starts again from what came back.
   *
   * Skipped while a save is open. On success the draft already equals what was
   * just sent, so there is nothing to reset; on failure the only copy of the
   * author's work is the one on screen, and this is the effect that would throw
   * it away.
   */
  useEffect(() => {
    if (isSavingRef.current) {
      return
    }

    setDraft(saved)
  }, [saved])

  const options = useMemo(
    () =>
      blogOptions.map((blog) => ({
        id: String(blog.id),
        title: blog.title,
        status: blog.status,
      })),
    [blogOptions],
  )

  const assignedSeriesByPartId = useMemo(() => {
    const result = new Map<string, string>()
    assignedSeriesByPostId.forEach((seriesId, postId) => {
      result.set(String(postId), String(seriesId))
    })
    return result
  }, [assignedSeriesByPostId])

  /*
   * Titles for parts the options list has not loaded. `loadAllOwnedBlogs` pages
   * through two views and can come back short, and a row dropped for a missing
   * title would silently change the order the author is about to save.
   */
  const partFallbacks = useMemo<ManagedSeriesPart[]>(
    () =>
      series.parts.map((part) => ({
        id: String(part.postId),
        title: part.title,
        status: part.status,
      })),
    [series.parts],
  )

  /*
   * Every edit clears the last outcome.
   *
   * Both of these describe a request that has already finished: "Series saved a
   * moment ago" stops being true the instant the author types, and "We could not
   * save this Series" outranks "Unsaved changes" in `seriesFormState`, so
   * leaving it set would hide the state the author is actually in.
   */
  const edit = (change: Partial<SeriesFormValues>) => {
    setDraft((current) => ({ ...current, ...change }))
    setLastSavedLabel(undefined)
    setSaveError(undefined)
  }

  const save = async (request: SeriesSaveRequest) => {
    isSavingRef.current = true
    setIsSaving(true)
    setSaveError(undefined)

    try {
      if (request.identity !== null) {
        await onUpdate(series.id, request.identity)
      }

      if (request.partIds !== null) {
        await onReplacePosts(
          series.id,
          request.partIds.map((partId) => Number(partId)),
        )
      }

      setLastSavedLabel('a moment ago')
    } catch (error) {
      // The draft is left alone on purpose. A failed save is the one moment the
      // only copy of the author's work is the one on screen.
      setSaveError(messageOf(error, 'This Series could not be saved.'))
    } finally {
      isSavingRef.current = false
      setIsSaving(false)
    }
  }

  const remove = async () => {
    setIsDeleting(true)
    setDeleteError(undefined)

    try {
      await onDelete(series.id)
    } catch (error) {
      setDeleteError(messageOf(error, 'This Series could not be deleted.'))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <SeriesManagerForm
      seriesId={String(series.id)}
      saved={saved}
      draft={draft}
      options={options}
      assignedSeriesByPartId={assignedSeriesByPartId}
      partFallbacks={partFallbacks}
      optionsError={optionsError}
      onRetryOptions={onRetryOptions}
      onTitleChange={(title) => edit({ title })}
      onDescriptionChange={(description) => edit({ description })}
      onPartIdsChange={(partIds) => edit({ partIds })}
      onSave={(request) => {
        void save(request)
      }}
      onDelete={() => {
        void remove()
      }}
      isSaving={isSaving}
      saveError={saveError}
      lastSavedLabel={lastSavedLabel}
      isDeleting={isDeleting}
      deleteError={deleteError}
    />
  )
}

export default SeriesManager

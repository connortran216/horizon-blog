/**
 * Horizon Design System v2 - the Series management form.
 *
 * The owner's whole view of one Series: its title and description, the ordered
 * blogs in it, the control that adds another, and the two actions that leave
 * the server changed. It replaces the legacy `SeriesManager`, whose rows are
 * already covered by `ManageSeriesItem` in `patterns/series` - this composes
 * those rows rather than drawing its own.
 *
 * It lives in the editor area because it is a workspace. The three things that
 * make it one:
 *
 * - **Saving is explicit.** There is no autosave here, so the form must say out
 *   loud that a change is not on the server yet. `seriesFormState` names the
 *   unsaved order specifically, because a reorder leaves no trace in a text
 *   field and is the change an author is most likely to lose by navigating away.
 * - **A save never looks finished while it is open.** The button is `isLoading`
 *   rather than disabled - it keeps focus, says "Saving this Series", and
 *   swallows its own clicks.
 * - **Deleting is the server's call.** The confirmation reports nothing. The
 *   Series stops being shown when `isDeleted` says the server confirmed it, and
 *   in no other branch.
 *
 * The state is the caller's, as it is for `MetadataBar` and `PublishPanel`.
 * This form owns only the three things that belong to the form itself: which
 * blog is picked in the select, why the last pick was refused, and whether the
 * delete confirmation is open.
 */

import { useId, useState } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiInbox,
  FiLoader,
  FiPlus,
  FiSlash,
  FiTrash2,
  FiUploadCloud,
} from 'react-icons/fi'
import type { IconType } from 'react-icons'

import { space } from '../../../theme/tokens'
import { Button } from '../../components/actions'
import { EmptyState, PanelLoading } from '../../components/feedback'
import { Field, Input, Select, Textarea } from '../../components/forms'
import { Stack } from '../../components/layout'
import { Surface } from '../../components/surface'
import { Heading, Text } from '../../components/typography'
import { loadingPulseAnimation, useMotionPolicy } from '../../motion'
import { DestructiveAction } from '../data/DestructiveAction'
import { ManageSeriesItem } from '../series/ManageSeriesItem'
import {
  moveItem,
  removeItemAt,
  type ManagedSeriesPart,
  type MoveDirection,
} from '../series/series.logic'
import {
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
  type SeriesBlogOption,
  type SeriesFormIcon,
  type SeriesFormValues,
  type SeriesSaveRequest,
} from './seriesManager.logic'

const icons: Record<SeriesFormIcon, IconType> = {
  loading: FiLoader,
  saving: FiUploadCloud,
  saved: FiCheckCircle,
  pending: FiClock,
  empty: FiInbox,
  error: FiAlertCircle,
  warning: FiAlertTriangle,
  denied: FiSlash,
  deleting: FiTrash2,
  series: FiBookOpen,
}

export interface SeriesManagerFormProps {
  /** The Series this form manages. Its id scopes the "one Series per blog" rule. */
  seriesId: string
  /** What the server last confirmed. The baseline every dirty check is against. */
  saved: SeriesFormValues
  /** The values on screen. Owned by the caller, like every other editor pattern. */
  draft: SeriesFormValues
  onTitleChange: (title: string) => void
  onDescriptionChange: (description: string) => void
  /** A new complete order. Reorder, removal and addition all arrive this way. */
  onPartIdsChange: (partIds: readonly string[]) => void
  /** Every blog the author owns. Supplies the row titles and the add control. */
  options?: readonly SeriesBlogOption[]
  /** Post id to the id of the Series that already holds it. */
  assignedSeriesByPartId?: ReadonlyMap<string, string>
  /** Titles for ids the options list has not loaded, from the Series itself. */
  partFallbacks?: readonly ManagedSeriesPart[]
  /** Called with only the requests this save actually needs to make. */
  onSave: (request: SeriesSaveRequest) => void
  onDelete: () => void
  /** The Series itself has not arrived yet. */
  isLoading?: boolean
  isSaving?: boolean
  /** Why the last save failed. Shown as written; never a raw exception. */
  saveError?: string
  /** When the last successful save landed: "a moment ago". */
  lastSavedLabel?: string
  isDeleting?: boolean
  deleteError?: string
  /** A verb phrase the server refused for the delete: "delete this Series". */
  deleteDeniedAction?: string
  /** The server confirmed the deletion. The only input that ends this form. */
  isDeleted?: boolean
  /** A verb phrase the server refused: "edit this Series". Blocks saving. */
  deniedAction?: string
  /** The list of owned blogs is still loading. */
  optionsLoading?: boolean
  /** Why the list of owned blogs could not be loaded. */
  optionsError?: string
  onRetryOptions?: () => void
}

interface StatusLineProps {
  label: string
  detail?: string
  color: string
  icon: SeriesFormIcon
  interrupts: boolean
}

/**
 * The form's state in three channels at once: words, a shape and a colour.
 *
 * The same contract `AutosaveState` holds to, for the same reason - every
 * status carries a label that is never blank and an icon of its own, so the
 * states remain distinguishable in greyscale. The pulse is not one of the
 * channels: under reduced motion it stops, and the words carry the state.
 */
function StatusLine({ label, detail, color, icon, interrupts }: StatusLineProps) {
  const policy = useMotionPolicy()
  const Icon = icons[icon]

  return (
    <Box role={interrupts ? 'alert' : 'status'} aria-live={interrupts ? 'assertive' : 'polite'}>
      <Flex align="center" gap={space[2]} color={color}>
        <Box
          as={Icon}
          aria-hidden="true"
          flexShrink={0}
          animation={
            icon === 'saving' || icon === 'loading' ? loadingPulseAnimation(policy) : undefined
          }
        />
        <Text recipe="metadata" as="span" color={color} fontWeight="medium">
          {label}
        </Text>
      </Flex>

      {detail === undefined ? null : (
        <Text recipe="metadata" marginBlockStart={space[1]}>
          {detail}
        </Text>
      )}
    </Box>
  )
}

export function SeriesManagerForm({
  seriesId,
  saved,
  draft,
  onTitleChange,
  onDescriptionChange,
  onPartIdsChange,
  options = [],
  assignedSeriesByPartId,
  partFallbacks,
  onSave,
  onDelete,
  isLoading = false,
  isSaving = false,
  saveError,
  lastSavedLabel,
  isDeleting = false,
  deleteError,
  deleteDeniedAction,
  isDeleted = false,
  deniedAction,
  optionsLoading = false,
  optionsError,
  onRetryOptions,
}: SeriesManagerFormProps) {
  const headingId = useId()
  const [selectedId, setSelectedId] = useState('')
  const [rejection, setRejection] = useState<string | null>(null)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  const dirty = seriesFormDirty(saved, draft)
  const deletion = seriesDeleteState({
    isConfirming: isConfirmingDelete,
    isDeleting,
    deniedAction: deleteDeniedAction,
    error: deleteError,
    deletedByServer: isDeleted,
  })
  const status = seriesFormState({
    deniedAction,
    isLoading,
    isDeleting,
    isSaving,
    saveError,
    deleteDeniedAction,
    isDirty: dirty.any,
    hasDirtyOrder: dirty.order,
    partCount: draft.partIds.length,
    lastSavedLabel,
  })
  const gate = seriesSaveGate({
    title: draft.title,
    isDirty: dirty.any,
    isSaving,
    isDeleting,
    isLoading,
    deniedAction,
  })

  const heading = saved.title.trim().length > 0 ? saved.title : 'Untitled Series'

  /*
   * The server said the Series is gone, so this stops being a form. Reached
   * only through `isDeleted` - an in-flight delete keeps every field and every
   * row exactly where it was.
   */
  if (deletion.reportsRemoved) {
    return (
      <Surface as="section" depth="raised" aria-labelledby={headingId}>
        <Stack gap={2}>
          <Heading recipe="cardTitle" as="h2" id={headingId}>
            {heading}
          </Heading>
          <StatusLine
            label={deletion.message ?? 'This Series was deleted.'}
            color={status.color}
            icon="deleting"
            interrupts
          />
        </Stack>
      </Surface>
    )
  }

  const addable = addableBlogOptions({
    options,
    partIds: draft.partIds,
    assignedSeriesByPartId,
    seriesId,
  })
  const addField = addBlogFieldState({
    isLoading: optionsLoading,
    error: optionsError,
    deniedAction,
    addableCount: addable.length,
  })
  const parts = resolveSeriesParts({
    partIds: draft.partIds,
    options,
    fallbacks: partFallbacks,
  })
  const isBusy = isSaving || isDeleting || status.isReadOnly

  const move = (index: number, direction: MoveDirection) => {
    onPartIdsChange(moveItem(draft.partIds, index, direction))
  }

  const remove = (index: number) => {
    onPartIdsChange(removeItemAt(draft.partIds, index))
  }

  const add = () => {
    const result = addBlogToSeries({
      options,
      partIds: draft.partIds,
      assignedSeriesByPartId,
      seriesId,
      candidateId: selectedId,
    })

    setRejection(result.rejection)

    if (result.clearsSelection) {
      setSelectedId('')
    }

    if (result.partIds !== draft.partIds) {
      onPartIdsChange(result.partIds)
    }
  }

  return (
    <Surface as="section" depth="raised" aria-labelledby={headingId}>
      <Stack gap={6}>
        <Stack gap={2}>
          <Heading recipe="cardTitle" as="h2" id={headingId}>
            {heading}
          </Heading>
          <StatusLine
            label={status.label}
            detail={status.detail}
            color={status.color}
            icon={status.icon}
            interrupts={status.interrupts}
          />
        </Stack>

        {isLoading ? (
          <PanelLoading task="this Series" />
        ) : (
          <>
            <Stack gap={4}>
              <Field label="Series title" isRequired isReadOnly={status.isReadOnly}>
                <Input
                  value={draft.title}
                  onChange={(event) => onTitleChange(event.target.value)}
                />
              </Field>
              <Field
                label="Description"
                hint="One or two sentences telling a reader what the Series covers."
                isReadOnly={status.isReadOnly}
              >
                <Textarea
                  rows={3}
                  value={draft.description}
                  onChange={(event) => onDescriptionChange(event.target.value)}
                />
              </Field>
            </Stack>

            <Stack gap={3}>
              <Heading recipe="cardTitle" as="h3">
                Ordered blogs
              </Heading>

              {dirty.order ? (
                /*
                 * The dirty order, said in text beside an icon. A reorder is
                 * invisible once it is done - the rows simply look like an
                 * order - so this is the only thing on the page that can tell
                 * an author the arrangement they are looking at is not the one
                 * the server holds.
                 */
                <Flex
                  role="status"
                  aria-live="polite"
                  align="center"
                  gap={space[2]}
                  color={status.color}
                >
                  <Box as={FiAlertTriangle} aria-hidden="true" flexShrink={0} />
                  <Text recipe="metadata" as="span" color={status.color}>
                    The order on screen is not saved yet.
                  </Text>
                </Flex>
              ) : null}

              {parts.length === 0 ? (
                <EmptyState
                  subject="blogs in this Series"
                  nextAction="Add one of the blogs you own, using the control below."
                />
              ) : (
                <Stack as="ol" gap={2}>
                  {parts.map((part, index) => (
                    <ManageSeriesItem
                      key={part.id}
                      item={part}
                      index={index}
                      count={parts.length}
                      onMove={move}
                      onRemove={remove}
                      isBusy={isBusy}
                    />
                  ))}
                </Stack>
              )}
            </Stack>

            <Stack gap={2}>
              <Flex align="flex-end" gap={space[3]} flexWrap="wrap">
                {/* Grows to fill the row and wraps the button under it when
                    there is no space left, rather than squeezing a select
                    narrower than the blog titles inside it. */}
                <Box flex="1 1 auto" minW="0">
                  <Field
                    label="Add an owned blog"
                    hint={addField.label}
                    error={rejection ?? undefined}
                    isDisabled={!addField.canChoose}
                  >
                    <Select
                      placeholder="Choose a blog"
                      value={selectedId}
                      onChange={(event) => {
                        setSelectedId(event.target.value)
                        setRejection(null)
                      }}
                    >
                      {addable.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.title}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </Box>

                <Button
                  tone="secondary"
                  iconStart={<FiPlus aria-hidden="true" />}
                  isDisabled={!addField.canChoose || selectedId === '' || isBusy}
                  onClick={add}
                >
                  Add to this Series
                </Button>
              </Flex>

              {addField.canRetry && onRetryOptions !== undefined ? (
                <Box>
                  <Button tone="secondary" size="sm" onClick={onRetryOptions}>
                    Try loading your blogs again
                  </Button>
                </Box>
              ) : null}
            </Stack>

            {gate.blockedReason === null ? null : (
              // Says why the save will not act. A disabled control with no
              // explanation is a dead end the author cannot debug.
              <Text recipe="metadata" role="status" aria-live="polite">
                {gate.blockedReason}
              </Text>
            )}

            <Flex gap={space[3]} flexWrap="wrap" justify="space-between">
              <Button
                tone="primary"
                isDisabled={!gate.canSave && !isSaving}
                isLoading={isSaving}
                loadingLabel={gate.submittingLabel}
                onClick={() => onSave(seriesSaveRequest(saved, draft))}
              >
                {gate.submitLabel}
              </Button>

              <Button
                tone="danger"
                iconStart={<FiTrash2 aria-hidden="true" />}
                isDisabled={!deletion.canRequestDelete}
                onClick={() => setIsConfirmingDelete(true)}
              >
                Delete this Series
              </Button>
            </Flex>

            {deletion.showsConfirmation ? (
              <DestructiveAction
                {...seriesDeleteCopy(saved.title)}
                onConfirm={onDelete}
                onCancel={() => setIsConfirmingDelete(false)}
                isSubmitting={isDeleting}
                deniedAction={deleteDeniedAction}
                error={deleteError}
              />
            ) : null}

            {deletion.showsConfirmation || deletion.message === null ? null : (
              <Text recipe="metadata" role="status" aria-live="polite">
                {deletion.message}
              </Text>
            )}
          </>
        )}
      </Stack>
    </Surface>
  )
}

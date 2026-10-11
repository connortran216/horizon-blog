/**
 * The author's Series, on the profile, under their blogs.
 *
 * A sibling of the Blogs section rather than a fourth tab: the tabs filter
 * blogs by status, a Series groups them. Each Series is a `SeriesSpine`; a new
 * one is written in place with `SeriesComposer` and appears at the head of the
 * list, empty, with its Manage action.
 *
 * The list is its own request (`useOwnerSeries`, owned by the page), so every
 * state here is local: loading and failure are shown in this section and never
 * hold up the masthead or the blogs above it.
 */

import { useState } from 'react'
import { Box, VisuallyHidden } from '@chakra-ui/react'
import { FiArrowRight, FiPlus } from 'react-icons/fi'

import {
  ActionLink,
  Button,
  EmptyState,
  ErrorState,
  Eyebrow,
  Heading,
  PanelLoading,
  RetryAction,
  SeriesComposer,
  SeriesSpine,
  Stack,
  Text,
  seriesComposerRequest,
} from '../../../design-system'
import { componentTokens } from '../../../theme/tokens'
import {
  OWNER_SERIES_MANAGE_PATH,
  ownerSeriesUpdatedLabel,
  toSpineParts,
} from '../ownerSeries.presentation'
import type { CreateSeriesInput, OwnerSeries } from '../series.types'

export interface ProfileSeriesSectionProps {
  series: OwnerSeries[]
  loading: boolean
  /** Why the list did not load. A create failure is the composer's, not this. */
  error: string | null
  onRetry: () => void
  onCreate: (input: CreateSeriesInput) => Promise<unknown>
  /** Open the composer on first render. The gallery and tests use it. */
  initiallyComposing?: boolean
}

const messageOf = (error: unknown, fallback: string) =>
  error instanceof Error && error.message.trim().length > 0 ? error.message : fallback

const ProfileSeriesSection = ({
  series,
  loading,
  error,
  onRetry,
  onCreate,
  initiallyComposing = false,
}: ProfileSeriesSectionProps) => {
  const [isComposing, setIsComposing] = useState(initiallyComposing)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState('')

  const closeComposer = () => {
    setIsComposing(false)
    setTitle('')
    setDescription('')
    setCreateError(null)
  }

  const create = async () => {
    const request = seriesComposerRequest(title, description)
    setCreating(true)
    setCreateError(null)
    try {
      await onCreate(request)
      closeComposer()
      setAnnouncement(`${request.title} created. Add blogs to it from Manage.`)
    } catch (createFailure) {
      // What was typed stays: it is the only copy of the author's words.
      setCreateError(messageOf(createFailure, 'This Series could not be created.'))
    } finally {
      setCreating(false)
    }
  }

  // Only the list not loading takes the section over; a create failure stays
  // in the composer that caused it.
  const listFailed = error !== null

  return (
    <Box as="section" id="series" aria-labelledby="profile-series-heading">
      <Stack gap={6}>
        <Stack
          direction="row"
          gap={4}
          collapseAt="sm"
          flexWrap="wrap"
          alignItems={{ base: 'flex-start', sm: 'flex-end' }}
          justifyContent="space-between"
        >
          <Stack gap={2}>
            <Eyebrow as="p">Series</Eyebrow>
            <Heading as="h2" recipe="sectionTitle" id="profile-series-heading">
              Blogs you have put in order
            </Heading>
            <Text recipe="body" color="text.secondary">
              A Series gives readers a path through related blogs. Each blog can belong to one
              Series.
            </Text>
          </Stack>
          {isComposing ? null : (
            <Button
              tone="secondary"
              iconStart={<FiPlus aria-hidden="true" />}
              isDisabled={loading}
              onClick={() => setIsComposing(true)}
            >
              New Series
            </Button>
          )}
        </Stack>

        <VisuallyHidden role="status" aria-live="polite">
          {announcement}
        </VisuallyHidden>

        {loading ? (
          <PanelLoading task="your Series" />
        ) : listFailed ? (
          <ErrorState failedAction="load your Series" detail={error ?? undefined}>
            <RetryAction failedAction="load your Series" onRetry={onRetry} />
          </ErrorState>
        ) : (
          <Box>
            {isComposing ? (
              <SeriesComposer
                title={title}
                description={description}
                onTitleChange={setTitle}
                onDescriptionChange={setDescription}
                onSubmit={() => {
                  void create()
                }}
                onCancel={closeComposer}
                isSubmitting={creating}
                error={createError}
              />
            ) : null}

            {series.length === 0 ? (
              isComposing ? null : (
                <EmptyState
                  subject="Series"
                  nextAction="Start one with New Series, then add the blogs that belong together."
                />
              )
            ) : (
              <Box
                as="ul"
                margin={0}
                padding={0}
                listStyleType="none"
                borderTopWidth={isComposing ? 0 : '1px'}
                borderTopStyle="solid"
                borderTopColor={componentTokens.series.border}
              >
                {series.map((item) => (
                  <SeriesSpine
                    as="li"
                    key={item.id}
                    title={item.title}
                    description={item.description}
                    parts={toSpineParts(item)}
                    meta={ownerSeriesUpdatedLabel(item)}
                    action={
                      <ActionLink
                        to={OWNER_SERIES_MANAGE_PATH}
                        weight="secondary"
                        iconEnd={<FiArrowRight aria-hidden="true" />}
                        aria-label={`Manage ${item.title}`}
                      >
                        Manage
                      </ActionLink>
                    }
                  />
                ))}
              </Box>
            )}
          </Box>
        )}
      </Stack>
    </Box>
  )
}

export default ProfileSeriesSection

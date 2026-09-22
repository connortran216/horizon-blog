/**
 * The publish screen - migrated onto Horizon Design System v2 (release M6).
 *
 * Composed from `ContentContainer`, `Section`, `Grid`, `PublishPanel`,
 * `ScheduleNotice`, `PreviewCard` (through `PublishBlogPreviewCard`), `Field` +
 * `Select` and `ActionLink`. Removed on the way: two hand-built bordered
 * panels, the uppercase letter-spaced "PUBLISH SETTINGS" labels, the Chakra
 * `Alert`, the `FormControl`/`FormErrorMessage` pairs and the two clickable
 * `Box as="label"` cards that wrapped a decorative `Radio`.
 *
 * The request sequence is unchanged: assign the series first when the list
 * loaded, then either publish and route to the public post, or schedule and
 * route to the profile. The same guard still stands between a past timestamp
 * and `schedule()`.
 *
 * What changed is what the screen says a schedule *is*. The legacy page called
 * it "Schedule blog" and the toast said "Blog scheduled", which reads as a post
 * that is on its way out. Scheduling writes a timestamp onto a record that is
 * still a draft and stays unreadable until a worker publishes it, so the button
 * says "Schedule this draft", the confirmation under the fields says it stays a
 * draft until then, and the toast says the same.
 *
 * The mode choice is also a real `radiogroup` now. The legacy cards responded
 * to a click but not to an arrow key, because the radio inside them was
 * decorative.
 */

import { useEffect, useMemo, useState } from 'react'
import { useToast } from '@chakra-ui/react'
import { FiArrowLeft } from 'react-icons/fi'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ActionLink,
  ContentContainer,
  Field,
  Grid,
  Heading,
  PanelLoading,
  PublishPanel,
  ScheduleNotice,
  Section,
  Select,
  Stack,
  Text,
} from '../../../design-system'
import { toPublicPostPath } from '../../../core'
import { PublicPostRecord } from '../../../core/types/blog.types'
import { mapApiPostToSummary } from '../../../core/utils/blog-mapping.utils'
import { useAuth } from '../../../context/AuthContext'
import PublishBlogPreviewCard from '../components/PublishBlogPreviewCard'
import { getEditorPostService } from '../editor-post.service'
import { getSeriesService } from '../../series/series.dependencies'
import { OwnerSeries } from '../../series/series.types'
import { PublishMode, resolvePublishMode } from '../publish-mode.utils'

const localDateValue = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

const localTimeValue = (date: Date) =>
  [date.getHours(), date.getMinutes()].map((value) => value.toString().padStart(2, '0')).join(':')

const PublishBlogPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const { user } = useAuth()
  const searchParams = new URLSearchParams(location.search)
  const postId = searchParams.get('id')
  const requestedMode = searchParams.get('mode')
  const initialMode = resolvePublishMode(requestedMode, false)
  const tomorrow = useMemo(() => {
    const value = new Date()
    value.setDate(value.getDate() + 1)
    return value
  }, [])
  const [blog, setBlog] = useState<PublicPostRecord | null>(null)
  const [mode, setMode] = useState<PublishMode>(initialMode)
  const [date, setDate] = useState(localDateValue(tomorrow))
  const [time, setTime] = useState('09:00')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [ownedSeries, setOwnedSeries] = useState<OwnerSeries[]>([])
  const [selectedSeriesId, setSelectedSeriesId] = useState('')
  const [seriesLoaded, setSeriesLoaded] = useState(false)
  const [seriesLoadError, setSeriesLoadError] = useState('')
  const existingSchedule = blog?.scheduled_publish_at

  useEffect(() => {
    if (!postId || !user) return
    getEditorPostService()
      .loadEditablePost(postId, user.id)
      .then(setBlog)
      .catch(() => navigate(user.username ? `/profile/${user.username}` : '/', { replace: true }))
  }, [navigate, postId, user])

  useEffect(() => {
    if (!postId || !user) return

    let current = true
    setSeriesLoaded(false)
    setSeriesLoadError('')
    getSeriesService()
      .listOwned()
      .then((series) => {
        if (!current) return
        setOwnedSeries(series)
        const assigned = series.find((item) =>
          item.parts.some((part) => part.postId === Number(postId)),
        )
        setSelectedSeriesId(assigned ? String(assigned.id) : '')
        setSeriesLoaded(true)
      })
      .catch(() => {
        if (!current) return
        setOwnedSeries([])
        setSeriesLoadError(
          'Series could not be loaded. Your current assignment will stay unchanged.',
        )
      })

    return () => {
      current = false
    }
  }, [postId, user])

  useEffect(() => {
    if (!existingSchedule) return
    const scheduled = new Date(existingSchedule)
    if (!Number.isFinite(scheduled.getTime())) return

    setMode(resolvePublishMode(requestedMode, true))
    setDate(localDateValue(scheduled))
    setTime(localTimeValue(scheduled))
  }, [existingSchedule, requestedMode])

  const scheduledAt = useMemo(() => new Date(`${date}T${time}`), [date, time])
  const hasValidSchedule = Number.isFinite(scheduledAt.getTime())
  const isScheduling = mode === 'schedule' && hasValidSchedule
  const publicationDate = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(isScheduling ? scheduledAt : new Date())
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const preview = blog ? mapApiPostToSummary(blog) : null

  const chooseMode = (nextMode: PublishMode) => {
    setMode(nextMode)
    setError('')
  }

  const submit = async () => {
    if (!blog || !postId) return
    // The panel disables the action for a past or unparseable moment. This
    // guard stays anyway: it is the last thing between a bad timestamp and a
    // request the backend would accept.
    if (mode === 'schedule' && (!hasValidSchedule || scheduledAt <= new Date())) {
      setError('Choose a publication time in the future.')
      return
    }

    setIsSubmitting(true)
    setError('')
    try {
      if (seriesLoaded) {
        await getSeriesService().assignPost(
          Number(postId),
          selectedSeriesId ? Number(selectedSeriesId) : null,
        )
      }
      if (mode === 'now') {
        const published = await getEditorPostService().publish(postId, {
          title: blog.title,
          content_markdown: blog.content_markdown,
          content_json: blog.content_json || '{}',
          tag_names: blog.tags?.map((tag) => tag.name),
        })
        navigate(toPublicPostPath(published.id))
        return
      }
      await getEditorPostService().schedule(postId, scheduledAt.toISOString())
      toast({
        title: 'Draft scheduled',
        description: `It stays a draft until ${scheduledAt.toLocaleString()} (${timezone}), then publishes itself.`,
        status: 'success',
        duration: 4000,
        isClosable: true,
      })
      navigate(user?.username ? `/profile/${user.username}` : '/')
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Publishing failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!blog || !preview) {
    return (
      <ContentContainer>
        <Section>
          <PanelLoading task="your saved blog" />
        </Section>
      </ContentContainer>
    )
  }

  return (
    <ContentContainer>
      <Section density="compact">
        <Stack gap={8}>
          <Stack gap={4}>
            <ActionLink
              to={`/blog-editor?id=${blog.id}`}
              state={{ blog, authorizedEdit: true }}
              iconStart={<FiArrowLeft aria-hidden="true" />}
            >
              Back to editor
            </ActionLink>

            <Heading recipe="pageTitle" as="h1">
              Publish your blog
            </Heading>
          </Stack>

          {existingSchedule ? <ScheduleNotice scheduledAt={existingSchedule} /> : null}

          <Grid columns={2} gap={8} collapseAt="lg" alignItems="start">
            <PublishPanel
              mode={mode}
              onModeChange={chooseMode}
              date={date}
              onDateChange={setDate}
              time={time}
              onTimeChange={setTime}
              onSubmit={submit}
              hasTitle={Boolean(blog.title?.trim())}
              hasContent={Boolean(blog.content_markdown?.trim())}
              isSubmitting={isSubmitting}
              submitError={error || undefined}
              existingScheduledAt={existingSchedule ?? undefined}
              isSeriesReady={seriesLoaded}
            >
              <Field
                label="Series"
                hint="A blog can belong to one series."
                isDisabled={!seriesLoaded}
              >
                <Select
                  value={selectedSeriesId}
                  onChange={(event) => setSelectedSeriesId(event.target.value)}
                >
                  <option value="">Standalone blog</option>
                  {ownedSeries.map((series) => (
                    <option key={series.id} value={series.id}>
                      {series.title}
                    </option>
                  ))}
                </Select>
              </Field>

              {/*
               * The list failing to load is not the select being invalid, so it
               * is reported beside the field rather than through `Field`'s
               * error channel, which would mark the control `aria-invalid`.
               */}
              {seriesLoadError ? (
                <Text recipe="metadata" role="status" aria-live="polite">
                  {seriesLoadError}
                </Text>
              ) : (
                <ActionLink to="/series/manage">Manage Series</ActionLink>
              )}
            </PublishPanel>

            <Stack as="section" gap={4}>
              <Heading recipe="sectionTitle" as="h2">
                Landing page preview
              </Heading>
              <PublishBlogPreviewCard
                blog={preview}
                publicationDate={publicationDate}
                publicationDateLabel={isScheduling ? 'Scheduled for' : 'Publishing today'}
              />
              <Text recipe="metadata">
                This is how the post will appear on the landing page once it is published.
              </Text>
            </Stack>
          </Grid>
        </Stack>
      </Section>
    </ContentContainer>
  )
}

export default PublishBlogPage

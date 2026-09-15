/**
 * The author's Series workspace: create one, then manage each one.
 *
 * `useOwnerSeries` still owns the list, the four mutations and the retry;
 * `loadAllOwnedBlogs` still pages through both owner views exactly as it did.
 * What changed is where a failure is shown. The page used to render every error
 * `useOwnerSeries` produced in one alert at the top, whichever Series or action
 * had caused it, and it swallowed a failed blog load entirely - `catch(() =>
 * setBlogs([]))` - which left the add-a-blog control claiming that every blog
 * the author owns already belongs to a Series.
 *
 * Now each failure is shown where it happened: a create failure under the create
 * form, a save or delete failure on the Series it belongs to, and a failed blog
 * load in the add control with a retry. The page-level state is reserved for the
 * one failure that has nothing to attach itself to - the list itself not
 * loading.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Box } from '@chakra-ui/react'
import { FiArrowLeft, FiPlus } from 'react-icons/fi'

import {
  ActionLink,
  Button,
  ContentContainer,
  EmptyState,
  ErrorState,
  Eyebrow,
  Field,
  Heading,
  Input,
  PageLoading,
  RetryAction,
  Section,
  Stack,
  Surface,
  Text,
  Textarea,
} from '../../../design-system'
import { componentTokens } from '../../../theme/tokens'
import { getBlogService } from '../../../core'
import SeriesManager, { SeriesBlogOption } from '../components/SeriesManager'
import { useOwnerSeries } from '../useOwnerSeries'

const loadAllOwnedBlogs = async (): Promise<SeriesBlogOption[]> => {
  const service = getBlogService()
  const result: SeriesBlogOption[] = []

  for (const status of ['published', 'draft'] as const) {
    let page = 1
    let total = 1
    while (result.filter((blog) => blog.status === status).length < total) {
      const response = await service.getCurrentUserPostsPage(status, page, 50)
      total = response.total
      result.push(
        ...response.posts.map((blog) => ({
          id: Number(blog.id),
          title: blog.title,
          status,
        })),
      )
      if (response.posts.length === 0) break
      page += 1
    }
  }
  return result.filter((blog) => Number.isInteger(blog.id) && blog.id > 0)
}

const ManageSeriesPage = () => {
  const owner = useOwnerSeries()
  const [blogs, setBlogs] = useState<SeriesBlogOption[]>([])
  const [blogsLoading, setBlogsLoading] = useState(true)
  const [blogsError, setBlogsError] = useState<string | undefined>(undefined)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const loadBlogs = useCallback(() => {
    setBlogsError(undefined)
    return loadAllOwnedBlogs()
      .then(setBlogs)
      .catch((error: unknown) => {
        setBlogs([])
        setBlogsError(
          error instanceof Error && error.message.trim().length > 0
            ? error.message
            : 'We could not load the blogs you own.',
        )
      })
      .finally(() => setBlogsLoading(false))
  }, [])

  useEffect(() => {
    void loadBlogs()
  }, [loadBlogs])

  const assignedSeriesByPostId = useMemo(() => {
    const result = new Map<number, number>()
    owner.series.forEach((series) => {
      series.parts.forEach((part) => result.set(part.postId, series.id))
    })
    return result
  }, [owner.series])

  const create = async () => {
    setCreating(true)
    setCreateError(null)
    try {
      await owner.create({ title, description })
      setTitle('')
      setDescription('')
    } catch (error) {
      setCreateError(
        error instanceof Error && error.message.trim().length > 0
          ? error.message
          : 'This Series could not be created.',
      )
    } finally {
      setCreating(false)
    }
  }

  if (owner.loading || blogsLoading) {
    return <PageLoading task="your Series" />
  }

  const canCreate = title.trim().length > 0 && !creating

  return (
    <ContentContainer>
      <Section>
        <Stack gap={8}>
          <Stack gap={3} alignItems="flex-start">
            <ActionLink
              to="/blog-editor"
              weight="secondary"
              iconStart={<FiArrowLeft aria-hidden="true" />}
            >
              Back to editor
            </ActionLink>
          </Stack>

          <Stack gap={3}>
            <Eyebrow as="p">Author workspace</Eyebrow>
            <Heading as="h1" recipe="pageTitle">
              Manage Series
            </Heading>
            <Text recipe="body">
              Group related blogs into one ordered Series. Each blog can belong to one Series.
            </Text>
          </Stack>

          {/*
            The one failure with nothing to attach itself to. Every other error
            `useOwnerSeries` reports belongs to a form that is on screen, and is
            shown there.
          */}
          {owner.error !== null && owner.series.length === 0 && createError === null ? (
            <ErrorState failedAction="load your Series" detail={owner.error}>
              <RetryAction
                failedAction="load your Series"
                onRetry={() => {
                  void owner.retry()
                }}
              />
            </ErrorState>
          ) : null}

          <Surface as="section" depth="raised">
            <Stack gap={4}>
              <Heading as="h2" recipe="cardTitle">
                Create a Series
              </Heading>

              <Field label="Series title" isRequired>
                <Input value={title} onChange={(event) => setTitle(event.target.value)} />
              </Field>

              <Field
                label="Description"
                hint="One or two sentences telling a reader what the Series covers."
              >
                <Textarea
                  rows={3}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </Field>

              {createError === null ? null : (
                <Text
                  recipe="metadata"
                  role="alert"
                  aria-live="assertive"
                  color={componentTokens.field.invalidText}
                >
                  {createError}
                </Text>
              )}

              <Stack direction="row" gap={3} collapseAt={undefined} flexWrap="wrap">
                <Button
                  tone="primary"
                  iconStart={<FiPlus aria-hidden="true" />}
                  isDisabled={!canCreate}
                  isLoading={creating}
                  loadingLabel="Creating this Series"
                  onClick={() => void create()}
                >
                  Create Series
                </Button>
              </Stack>

              {canCreate || creating ? null : (
                // A disabled control with no explanation is a dead end.
                <Text recipe="metadata" role="status" aria-live="polite">
                  A Series needs a title before it can be created.
                </Text>
              )}
            </Stack>
          </Surface>

          {owner.series.length === 0 ? (
            <EmptyState subject="Series" nextAction="Create the first one with the form above." />
          ) : (
            <Stack as="ul" gap={6}>
              {owner.series.map((series) => (
                <Box as="li" key={series.id} listStyleType="none">
                  <SeriesManager
                    series={series}
                    blogOptions={blogs}
                    assignedSeriesByPostId={assignedSeriesByPostId}
                    optionsError={blogsError}
                    onRetryOptions={() => {
                      void loadBlogs()
                    }}
                    onUpdate={owner.update}
                    onReplacePosts={owner.replacePosts}
                    onDelete={owner.remove}
                  />
                </Box>
              ))}
            </Stack>
          )}
        </Stack>
      </Section>
    </ContentContainer>
  )
}

export default ManageSeriesPage

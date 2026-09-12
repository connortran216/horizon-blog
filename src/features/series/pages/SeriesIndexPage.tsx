/**
 * Every published Series, paged.
 *
 * The first page lifts one Series out as the featured plate and puts the rest
 * in a grid; later pages are a plain grid, because "featured" on page four is
 * just the fourth page's first row wearing a label.
 */

import { useSearchParams } from 'react-router-dom'

import {
  ActionLink,
  ContentContainer,
  EmptyState,
  ErrorState,
  Eyebrow,
  Grid,
  Heading,
  Pagination,
  RetryAction,
  Section,
  Skeleton,
  Stack,
  Text,
} from '../../../design-system'
import SeriesCard from '../components/SeriesCard'
import { usePublicSeriesList } from '../usePublicSeriesList'

const PAGE_SIZE = 9
const SKELETON_COUNT = 3

const parsePage = (value: string | null) => {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

const SeriesIndexPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parsePage(searchParams.get('page'))
  const { data, items, loading, error, retry } = usePublicSeriesList({ page, limit: PAGE_SIZE })
  const featured = page === 1 ? items[0] : undefined
  const gridItems = page === 1 ? items.slice(1) : items

  const setPage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams)
    if (nextPage <= 1) next.delete('page')
    else next.set('page', String(nextPage))
    setSearchParams(next)
  }

  return (
    <ContentContainer>
      <Section>
        <Stack gap={12}>
          <Stack as="header" gap={4} maxW="3xl">
            <Eyebrow as="p">Series</Eyebrow>
            <Heading as="h1" recipe="pageTitle">
              Connected blogs, arranged to be read in order.
            </Heading>
            <Text recipe="prose">
              Follow an idea from its first question to its practical details, one blog at a time.
            </Text>
          </Stack>

          {loading ? (
            <Stack gap={8}>
              <Skeleton
                shape={{ shape: 'media', aspectRatio: '16 / 10' }}
                label="the Series list"
              />
              <Grid columns={3} gap={6}>
                {Array.from({ length: SKELETON_COUNT }, (_unused, index) => (
                  <Skeleton
                    key={`series-skeleton-${index}`}
                    shape={{ shape: 'media', aspectRatio: '16 / 10' }}
                  />
                ))}
              </Grid>
            </Stack>
          ) : error ? (
            <ErrorState failedAction="load the Series list" detail={error} align="start">
              <Stack direction="row" gap={3} collapseAt="sm" alignItems="center">
                <RetryAction failedAction="load the Series list" onRetry={retry} />
                <ActionLink to="/blog" underline="hover">
                  Browse blogs
                </ActionLink>
              </Stack>
            </ErrorState>
          ) : items.length === 0 ? (
            <EmptyState
              subject="Series"
              nextAction="New Series appear here as they are published."
              align="start"
            >
              <ActionLink to="/blog" underline="hover" color="action.primary" fontWeight="semibold">
                Browse the latest blogs
              </ActionLink>
            </EmptyState>
          ) : (
            <Stack gap={12}>
              {featured ? (
                <Stack as="section" gap={4} aria-labelledby="featured-series-heading">
                  <Heading id="featured-series-heading" as="h2" recipe="sectionTitle">
                    Featured Series
                  </Heading>
                  <SeriesCard series={featured} />
                </Stack>
              ) : null}

              {gridItems.length > 0 ? (
                <Stack as="section" gap={4} aria-labelledby="all-series-heading">
                  <Heading id="all-series-heading" as="h2" recipe="sectionTitle">
                    All series
                  </Heading>
                  <Grid columns={3} gap={6}>
                    {gridItems.map((series) => (
                      <SeriesCard key={series.id} series={series} />
                    ))}
                  </Grid>
                </Stack>
              ) : null}

              {data ? (
                <Pagination
                  page={data.page}
                  pageSize={data.limit}
                  totalItems={data.total}
                  onPageChange={setPage}
                  label="Series pagination"
                />
              ) : null}
            </Stack>
          )}
        </Stack>
      </Section>
    </ContentContainer>
  )
}

export default SeriesIndexPage

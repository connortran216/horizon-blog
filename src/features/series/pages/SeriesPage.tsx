/**
 * One public Series: its identity, its facts, and its blogs in order.
 *
 * Composition only. The book identity and the ordered parts belong to the
 * Series patterns, the three async states belong to the feedback primitives,
 * and the page decides what sits where.
 */

import { Box } from '@chakra-ui/react'
import { FiArrowLeft } from 'react-icons/fi'
import { useParams } from 'react-router-dom'

import {
  ActionLink,
  Chip,
  ContentContainer,
  ErrorState,
  Eyebrow,
  Heading,
  Metadata,
  MissingState,
  PageLoading,
  RetryAction,
  Section,
  Stack,
  Text,
  seriesFacts,
  seriesTotalMinutes,
} from '../../../design-system'
import { space } from '../../../theme/tokens'
import SeriesPartList from '../components/SeriesPartList'
import { seriesTopics, toSeriesDetailSummary, toSeriesParts } from '../series.presentation'
import { usePublicSeries } from '../usePublicSeries'

const SeriesPage = () => {
  const { slug } = useParams()
  const { series, loading, error, notFound, retry } = usePublicSeries(slug)

  const waysOnward = (
    <>
      <ActionLink
        standalone
        to="/series"
        underline="hover"
        iconStart={<FiArrowLeft aria-hidden="true" />}
      >
        All series
      </ActionLink>
      <ActionLink standalone to="/blog" underline="hover">
        Browse blogs
      </ActionLink>
    </>
  )

  if (loading) {
    return (
      <ContentContainer>
        <Section>
          <PageLoading task="this Series" />
        </Section>
      </ContentContainer>
    )
  }

  /*
   * A transient failure keeps its retry: the next request may well succeed.
   * Checked before the missing branch, which also has no `series` to show.
   */
  if (error) {
    return (
      <ContentContainer width="prose">
        <Section>
          <ErrorState failedAction="load this Series" detail={error} align="start">
            <Stack direction="row" gap={3} collapseAt="sm" alignItems="center">
              <RetryAction failedAction="load this Series" onRetry={retry} />
              {waysOnward}
            </Stack>
          </ErrorState>
        </Section>
      </ContentContainer>
    )
  }

  /*
   * Missing, private, or emptied of its published blogs. No retry: the second
   * request answers exactly as the first one did, and a button that cannot
   * work is worse than the two links that can.
   */
  if (notFound || !series) {
    return (
      <ContentContainer width="prose">
        <Section>
          <MissingState
            subject="this Series"
            detail="It may have been unpublished, or the link may be out of date."
            align="start"
          >
            <Stack direction="row" gap={3} collapseAt="sm" alignItems="center">
              {waysOnward}
            </Stack>
          </MissingState>
        </Section>
      </ContentContainer>
    )
  }

  const summary = toSeriesDetailSummary(series)
  const parts = toSeriesParts(series.parts)
  const facts = seriesFacts(summary, seriesTotalMinutes(parts))
  const topics = seriesTopics(series.parts)

  return (
    <ContentContainer>
      <Section>
        <Stack gap={12}>
          <Box>
            <ActionLink
              standalone
              to="/series"
              underline="hover"
              iconStart={<FiArrowLeft aria-hidden="true" />}
              color="text.secondary"
            >
              All series
            </ActionLink>
          </Box>

          <Stack as="header" gap={6}>
            <Eyebrow as="p">Series</Eyebrow>
            <Heading as="h1" recipe="pageTitle">
              {series.title}
            </Heading>
            {series.description ? <Text recipe="prose">{series.description}</Text> : null}
            <Metadata as="p">
              {facts.map((fact, index) => (
                <Box key={fact.kind} display="flex" alignItems="center" gap={space[2]}>
                  {index > 0 ? (
                    <Box as="span" aria-hidden="true" color="text.muted">
                      ·
                    </Box>
                  ) : null}
                  <Box as="span">{fact.label}</Box>
                </Box>
              ))}
            </Metadata>
            {/*
              A real list, because `aria-label` on a bare `div` lands on the
              generic role and is dropped: the group was named for assistive
              technology that never heard the name.
            */}
            {topics.length > 0 ? (
              <Box
                as="ul"
                display="flex"
                flexWrap="wrap"
                gap={space[2]}
                listStyleType="none"
                margin={0}
                padding={0}
                aria-label="Series topics"
              >
                {topics.map((topic) => (
                  <Box as="li" key={topic} display="inline-flex">
                    <Chip>{topic}</Chip>
                  </Box>
                ))}
              </Box>
            ) : null}
          </Stack>

          <Stack as="section" gap={4} aria-labelledby="series-parts-heading">
            <Stack gap={2}>
              <Eyebrow as="p">In this series</Eyebrow>
              <Heading id="series-parts-heading" as="h2" recipe="sectionTitle">
                Read the blogs in order
              </Heading>
            </Stack>
            <SeriesPartList parts={series.parts} />
          </Stack>
        </Stack>
      </Section>
    </ContentContainer>
  )
}

export default SeriesPage

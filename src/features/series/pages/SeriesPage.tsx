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
  const { series, loading, error, retry } = usePublicSeries(slug)

  if (loading) {
    return (
      <ContentContainer>
        <Section>
          <PageLoading task="this Series" />
        </Section>
      </ContentContainer>
    )
  }

  if (!series) {
    return (
      <ContentContainer width="prose">
        <Section>
          <ErrorState failedAction="load this Series" detail={error ?? undefined} align="start">
            <Stack direction="row" gap={3} collapseAt="sm" alignItems="center">
              <RetryAction failedAction="load this Series" onRetry={retry} />
              <ActionLink
                to="/series"
                underline="hover"
                iconStart={<FiArrowLeft aria-hidden="true" />}
              >
                All series
              </ActionLink>
              <ActionLink to="/blog" underline="hover">
                Browse blogs
              </ActionLink>
            </Stack>
          </ErrorState>
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
            {topics.length > 0 ? (
              <Box display="flex" flexWrap="wrap" gap={space[2]} aria-label="Series topics">
                {topics.map((topic) => (
                  <Chip key={topic}>{topic}</Chip>
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

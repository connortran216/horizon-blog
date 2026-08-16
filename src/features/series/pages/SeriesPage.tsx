import { Box, Button, Container, Heading, HStack, Progress, Stack, Text } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { FiArrowLeft } from 'react-icons/fi'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { LoadingPanel } from '../../../core'
import SeriesPartList from '../components/SeriesPartList'
import { readSeriesProgress, visibleSeriesProgress } from '../series.progress'
import { usePublicSeries } from '../usePublicSeries'

const SeriesPage = () => {
  const { slug } = useParams()
  const { series, loading, error, retry } = usePublicSeries(slug)
  const [visited, setVisited] = useState<number[]>([])

  useEffect(() => {
    if (series) setVisited(readSeriesProgress(series.id))
  }, [series])

  const visibleVisited = useMemo(
    () => visibleSeriesProgress(visited, series?.parts.map((part) => part.postId) ?? []),
    [series, visited],
  )
  const progress = series?.parts.length ? (visibleVisited.length / series.parts.length) * 100 : 0

  if (loading) {
    return <LoadingPanel label="Loading series" description="Preparing the learning path." />
  }

  if (!series) {
    return (
      <Container maxW="container.md" py={{ base: 10, md: 16 }}>
        <Stack spacing={5} align="start">
          <Heading color="text.primary">Series unavailable</Heading>
          <Text color="text.secondary">{error}</Text>
          <HStack>
            <Button onClick={retry}>Try again</Button>
            <Button as={RouterLink} to="/blog" variant="ghost" leftIcon={<FiArrowLeft />}>
              Back to blogs
            </Button>
          </HStack>
        </Stack>
      </Container>
    )
  }

  return (
    <Container maxW="container.lg" py={{ base: 8, md: 14 }}>
      <Stack spacing={{ base: 8, md: 10 }}>
        <Button
          as={RouterLink}
          to="/blog"
          variant="ghost"
          leftIcon={<FiArrowLeft />}
          alignSelf="flex-start"
        >
          Back to blogs
        </Button>

        <Box
          border="1px solid"
          borderColor="border.subtle"
          borderRadius="2xl"
          bg="bg.glass"
          p={{ base: 6, md: 9 }}
        >
          <Stack spacing={5}>
            <Text color="text.tertiary" fontSize="xs" fontWeight="bold" letterSpacing="0.14em">
              LEARNING PATH
            </Text>
            <Heading color="text.primary" size="2xl">
              {series.title}
            </Heading>
            {series.description ? (
              <Text color="text.secondary" fontSize={{ base: 'md', md: 'lg' }} maxW="3xl">
                {series.description}
              </Text>
            ) : null}
            <HStack color="text.tertiary" spacing={3} flexWrap="wrap">
              <Text>By {series.author.name}</Text>
              <Text aria-hidden>·</Text>
              <Text>{series.parts.length} blogs</Text>
              <Text aria-hidden>·</Text>
              <Text>{visibleVisited.length} opened here</Text>
            </HStack>
            <Progress
              value={progress}
              size="sm"
              borderRadius="full"
              bg="bg.tertiary"
              aria-label={`${visibleVisited.length} of ${series.parts.length} blogs opened`}
              sx={{ '& > div': { backgroundColor: 'var(--chakra-colors-action-primary)' } }}
            />
          </Stack>
        </Box>

        <Stack spacing={4}>
          <Heading size="lg" color="text.primary">
            Read in order
          </Heading>
          <SeriesPartList parts={series.parts} visitedPostIds={visibleVisited} />
        </Stack>
      </Stack>
    </Container>
  )
}

export default SeriesPage

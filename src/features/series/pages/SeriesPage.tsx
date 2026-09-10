import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Link,
  SimpleGrid,
  Stack,
  Text,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { FiArrowLeft, FiClock } from 'react-icons/fi'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { LoadingPanel } from '../../../core'
import SeriesPartList from '../components/SeriesPartList'
import SeriesBookCover from '../components/SeriesBookCover'
import { usePublicSeries } from '../usePublicSeries'
import '../signal-series.css'

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

const SeriesPage = () => {
  const { slug } = useParams()
  const { series, loading, error, retry } = usePublicSeries(slug)

  if (loading) {
    return <LoadingPanel label="Loading Series" description="Preparing the ordered blogs." />
  }

  if (!series) {
    return (
      <Container maxW="container.md" py={{ base: 10, md: 16 }}>
        <Stack spacing={5} align="start">
          <Heading color="text.primary">Series unavailable</Heading>
          <Text color="text.secondary">{error}</Text>
          <HStack flexWrap="wrap">
            <Button onClick={retry}>Try again</Button>
            <Button as={RouterLink} to="/series" variant="ghost" leftIcon={<FiArrowLeft />}>
              All series
            </Button>
            <Button as={RouterLink} to="/blog" variant="ghost">
              Browse blogs
            </Button>
          </HStack>
        </Stack>
      </Container>
    )
  }

  const totalReadingTime = series.parts.reduce((total, part) => total + part.readingTime, 0)
  const topics = Array.from(new Set(series.parts.flatMap((part) => part.tags))).slice(0, 8)

  return (
    <Box position="relative" pb={12}>
      <Box
        position="absolute"
        top={0}
        left="50%"
        transform="translateX(-50%)"
        w={{ base: '92%', md: '72%' }}
        h="280px"
        bg="accent.glow"
        filter="blur(120px)"
        opacity={0.62}
        pointerEvents="none"
      />
      <Container maxW="container.lg" py={{ base: 8, md: 14 }} position="relative">
        <Stack spacing={{ base: 8, md: 12 }}>
          <Link
            as={RouterLink}
            to="/series"
            alignSelf="flex-start"
            color="text.secondary"
            fontWeight="semibold"
            _hover={{ color: 'text.primary', textDecoration: 'none' }}
          >
            <HStack spacing={2}>
              <FiArrowLeft aria-hidden />
              <Text>All series</Text>
            </HStack>
          </Link>

          <SimpleGrid
            className="signal-series-hero"
            data-group=""
            columns={{ base: 1, md: 2 }}
            spacing={{ base: 8, md: 12 }}
            alignItems="center"
            border="1px solid"
            borderColor="border.subtle"
            borderRadius="3xl"
            bg="bg.glass"
            p={{ base: 6, md: 10 }}
            boxShadow="md"
          >
            <Box display="grid" placeItems="center" py={{ base: 3, md: 6 }}>
              <SeriesBookCover title={series.title} tone={series.id} size="hero" />
            </Box>
            <Stack spacing={6}>
              <Text
                color="text.tertiary"
                fontSize="sm"
                fontWeight="bold"
                letterSpacing="0.14em"
                textTransform="uppercase"
              >
                Series
              </Text>
              <Heading
                color="text.primary"
                fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
                lineHeight="1"
                letterSpacing="-0.055em"
              >
                {series.title}
              </Heading>
              {series.description ? (
                <Text
                  color="text.secondary"
                  fontSize={{ base: 'md', md: 'xl' }}
                  lineHeight="tall"
                  maxW="3xl"
                >
                  {series.description}
                </Text>
              ) : null}
              <HStack color="text.tertiary" spacing={3} flexWrap="wrap">
                <Text>By {series.author.name}</Text>
                <Text aria-hidden>·</Text>
                <Text>
                  {series.parts.length} {series.parts.length === 1 ? 'blog' : 'blogs'}
                </Text>
                <Text aria-hidden>·</Text>
                <HStack spacing={1.5}>
                  <FiClock aria-hidden />
                  <Text>{totalReadingTime} min total</Text>
                </HStack>
                <Text aria-hidden>·</Text>
                <Text>Updated {formatDate(series.updatedAt)}</Text>
              </HStack>
            </Stack>
          </SimpleGrid>

          {topics.length > 0 ? (
            <Wrap spacing={2} aria-label="Series topics">
              {topics.map((topic) => (
                <WrapItem key={topic}>
                  <Box
                    bg="bg.tertiary"
                    color="text.secondary"
                    borderRadius="full"
                    px={3}
                    py={1.5}
                    fontSize="sm"
                  >
                    {topic}
                  </Box>
                </WrapItem>
              ))}
            </Wrap>
          ) : null}

          <Stack spacing={5}>
            <Stack spacing={2}>
              <Text
                color="text.tertiary"
                fontSize="sm"
                textTransform="uppercase"
                letterSpacing="0.14em"
              >
                In this series
              </Text>
              <Heading size="lg" color="text.primary" letterSpacing="-0.03em">
                Read the blogs in order
              </Heading>
            </Stack>
            <SeriesPartList parts={series.parts} />
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}

export default SeriesPage

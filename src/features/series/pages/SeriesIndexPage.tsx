import {
  Box,
  Button,
  Container,
  Heading,
  Link,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import PaginationControls from '../../../components/PaginationControls'
import SeriesCard from '../components/SeriesCard'
import { usePublicSeriesList } from '../usePublicSeriesList'
import '../signal-series.css'

const PAGE_SIZE = 9

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
    <Box position="relative" pb={12}>
      <Box
        position="absolute"
        top={0}
        left="50%"
        transform="translateX(-50%)"
        w={{ base: '92%', md: '78%' }}
        h="300px"
        bg="accent.glow"
        filter="blur(120px)"
        opacity={0.65}
        pointerEvents="none"
      />
      <Container maxW="container.xl" py={{ base: 8, md: 12 }} position="relative">
        <Stack spacing={{ base: 8, md: 10 }}>
          <Stack spacing={4} maxW="3xl">
            <Text
              fontSize="sm"
              textTransform="uppercase"
              letterSpacing="0.14em"
              color="text.tertiary"
            >
              Series
            </Text>
            <Heading
              fontSize={{ base: '4xl', md: '5xl' }}
              lineHeight="1"
              letterSpacing="-0.05em"
              color="text.primary"
            >
              Connected blogs, arranged to be read in order.
            </Heading>
            <Text color="text.secondary" fontSize={{ base: 'md', md: 'lg' }} lineHeight="tall">
              Follow an idea from its first question to its practical details, one blog at a time.
            </Text>
          </Stack>

          {loading ? (
            <Stack spacing={6} aria-label="Loading Series">
              <Skeleton h={{ base: '240px', md: '280px' }} borderRadius="3xl" />
              <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={6}>
                {[0, 1, 2].map((item) => (
                  <Skeleton key={item} h="220px" borderRadius="3xl" />
                ))}
              </SimpleGrid>
            </Stack>
          ) : error ? (
            <Stack
              spacing={5}
              align="start"
              border="1px solid"
              borderColor="border.subtle"
              borderRadius="3xl"
              bg="bg.secondary"
              p={{ base: 6, md: 10 }}
            >
              <Heading size="lg" color="text.primary">
                Series could not load.
              </Heading>
              <Text color="text.secondary">{error}</Text>
              <Stack direction={{ base: 'column', sm: 'row' }}>
                <Button onClick={retry}>Try again</Button>
                <Button as={RouterLink} to="/blog" variant="ghost">
                  Browse blogs
                </Button>
              </Stack>
            </Stack>
          ) : items.length === 0 ? (
            <Stack
              spacing={4}
              border="1px solid"
              borderColor="border.subtle"
              borderRadius="3xl"
              bg="bg.secondary"
              p={{ base: 6, md: 10 }}
            >
              <Heading size="lg" color="text.primary">
                No Series have been published yet.
              </Heading>
              <Link as={RouterLink} to="/blog" color="action.primary" fontWeight="semibold">
                Browse the latest blogs
              </Link>
            </Stack>
          ) : (
            <Stack spacing={{ base: 8, md: 10 }}>
              {featured ? (
                <Stack spacing={4}>
                  <Text
                    color="text.tertiary"
                    fontSize="sm"
                    letterSpacing="0.14em"
                    textTransform="uppercase"
                  >
                    Featured Series
                  </Text>
                  <SeriesCard series={featured} featured />
                </Stack>
              ) : null}

              {gridItems.length > 0 ? (
                <Stack spacing={4}>
                  <Heading size="lg" color="text.primary" letterSpacing="-0.03em">
                    All series
                  </Heading>
                  <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={6}>
                    {gridItems.map((series) => (
                      <SeriesCard key={series.id} series={series} />
                    ))}
                  </SimpleGrid>
                </Stack>
              ) : null}

              {data && data.totalPages > 1 ? (
                <PaginationControls
                  currentPage={data.page}
                  totalPages={data.totalPages}
                  totalCount={data.total}
                  pageSize={data.limit}
                  onPageChange={setPage}
                  showOnlyWhenMultiple={false}
                />
              ) : null}
            </Stack>
          )}
        </Stack>
      </Container>
    </Box>
  )
}

export default SeriesIndexPage

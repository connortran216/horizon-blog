import { Box, Heading, HStack, Link, SimpleGrid, Skeleton, Stack, Text } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { usePublicSeriesList } from '../usePublicSeriesList'
import SeriesCard from './SeriesCard'

interface SeriesShelfProps {
  compact?: boolean
}

const SeriesShelf = ({ compact = false }: SeriesShelfProps) => {
  const { items, loading, error } = usePublicSeriesList({ limit: 2 })

  if (error || (!loading && items.length === 0)) return null

  return (
    <Box as="section" aria-labelledby={compact ? 'blog-series-heading' : 'home-series-heading'}>
      <Stack spacing={4}>
        <HStack justify="space-between" align="flex-end" flexWrap="wrap" gap={3}>
          <Stack spacing={2}>
            <Text
              fontSize="sm"
              textTransform="uppercase"
              letterSpacing="0.14em"
              color="text.tertiary"
            >
              Series
            </Text>
            <Heading
              id={compact ? 'blog-series-heading' : 'home-series-heading'}
              size={compact ? 'md' : 'lg'}
              color="text.primary"
              letterSpacing="-0.03em"
            >
              {compact
                ? 'Read connected blogs in order'
                : 'Ideas that unfold across more than one blog'}
            </Heading>
          </Stack>
          <Link as={RouterLink} to="/series" color="action.primary" fontWeight="semibold">
            View all series
          </Link>
        </HStack>

        {loading ? (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={compact ? 4 : 6}>
            {[0, 1].map((item) => (
              <Skeleton key={item} h={compact ? '180px' : '220px'} borderRadius="2xl" />
            ))}
          </SimpleGrid>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={compact ? 4 : 6}>
            {items.map((series) => (
              <SeriesCard key={series.id} series={series} compact={compact} />
            ))}
          </SimpleGrid>
        )}
      </Stack>
    </Box>
  )
}

export default SeriesShelf

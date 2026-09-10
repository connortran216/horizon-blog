import { Box, Heading, HStack, Icon, Stack, Text } from '@chakra-ui/react'
import { FiArrowRight } from 'react-icons/fi'
import { Link as RouterLink } from 'react-router-dom'
import { PublicSeriesSummary } from '../series.types'

interface SeriesCardProps {
  series: PublicSeriesSummary
  compact?: boolean
}

const formatUpdatedDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

const SeriesCard = ({ series, compact = false }: SeriesCardProps) => (
  <Box
    as={RouterLink}
    to={`/series/${series.slug}`}
    display="block"
    h="full"
    border="1px solid"
    borderColor="border.subtle"
    borderRadius={compact ? '2xl' : '3xl'}
    bg="bg.secondary"
    p={{ base: 5, md: compact ? 6 : 7 }}
    transition="transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease"
    _hover={{ borderColor: 'action.primary', transform: 'translateY(-2px)', boxShadow: 'md' }}
    _focusVisible={{ boxShadow: 'outline', borderColor: 'action.primary' }}
  >
    <Stack spacing={compact ? 3 : 5} h="full">
      <Text
        color="text.tertiary"
        fontSize="xs"
        fontWeight="bold"
        letterSpacing="0.14em"
        textTransform="uppercase"
      >
        Series · {series.partCount} {series.partCount === 1 ? 'blog' : 'blogs'}
      </Text>
      <Stack spacing={3} flex={1}>
        <Heading
          size={compact ? 'md' : 'lg'}
          color="text.primary"
          letterSpacing="-0.03em"
          noOfLines={2}
        >
          {series.title}
        </Heading>
        {series.description ? (
          <Text color="text.secondary" lineHeight="tall" noOfLines={compact ? 2 : 3}>
            {series.description}
          </Text>
        ) : null}
      </Stack>
      <HStack justify="space-between" align="center" gap={4}>
        <Text color="text.tertiary" fontSize="sm" noOfLines={1}>
          {series.author.name} · Updated {formatUpdatedDate(series.updatedAt)}
        </Text>
        <Icon as={FiArrowRight} color="action.primary" aria-hidden />
      </HStack>
    </Stack>
  </Box>
)

export default SeriesCard

import { Box, Heading, HStack, Icon, Stack, Text } from '@chakra-ui/react'
import { FiArrowRight } from 'react-icons/fi'
import { Link as RouterLink } from 'react-router-dom'
import { PublicSeriesSummary } from '../series.types'
import SeriesBookCover from './SeriesBookCover'

interface SeriesCardProps {
  series: PublicSeriesSummary
  compact?: boolean
  featured?: boolean
}

const formatUpdatedDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

const SeriesCard = ({ series, compact = false, featured = false }: SeriesCardProps) => (
  <Box
    as={RouterLink}
    to={`/series/${series.slug}`}
    display="block"
    data-group=""
    h="full"
    border="1px solid"
    borderColor="border.subtle"
    className={compact ? undefined : 'signal-series-card'}
    borderRadius={compact ? '2xl' : '3xl'}
    bg={compact ? 'bg.secondary' : 'bg.glass'}
    p={{ base: 5, md: compact ? 6 : featured ? 9 : 7 }}
    transition="transform 260ms cubic-bezier(0.22, 1, 0.36, 1), border-color 220ms ease, box-shadow 260ms ease"
    _hover={{ borderColor: 'action.primary', transform: 'translateY(-5px)', boxShadow: 'lg' }}
    _active={{ transform: 'scale(0.985)' }}
    _focusVisible={{ boxShadow: 'outline', borderColor: 'action.primary' }}
  >
    <Stack
      direction={compact ? 'column' : { base: 'row', md: featured ? 'row' : 'column' }}
      align={compact ? 'stretch' : { base: 'center', md: featured ? 'center' : 'flex-start' }}
      spacing={compact ? 3 : featured ? 10 : 6}
      h="full"
    >
      {!compact ? (
        <SeriesBookCover
          title={series.title}
          tone={series.id}
          size={featured ? 'hero' : 'standard'}
        />
      ) : null}
      <Stack spacing={compact ? 3 : 5} flex={1} minW={0} h="full">
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
          <Icon
            as={FiArrowRight}
            color="action.primary"
            aria-hidden
            transition="transform 220ms ease"
            _groupHover={{ transform: 'translateX(5px)' }}
          />
        </HStack>
      </Stack>
    </Stack>
  </Box>
)

export default SeriesCard

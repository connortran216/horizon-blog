import { Box, Button, HStack, Link, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi'
import { Link as RouterLink } from 'react-router-dom'
import { toPublicPostPath } from '../../../core'
import { PublicSeriesContext } from '../series.types'

interface SeriesContextCardProps {
  context: PublicSeriesContext
}

const SeriesContextCard = ({ context }: SeriesContextCardProps) => (
  <Box
    as="nav"
    aria-label="Series navigation"
    border="1px solid"
    borderColor="border.subtle"
    borderRadius="xl"
    bg="bg.secondary"
    p={{ base: 4, md: 5 }}
  >
    <Stack spacing={4}>
      <HStack justify="space-between" align="start" flexWrap="wrap" gap={3}>
        <Stack spacing={1}>
          <Text color="text.tertiary" fontSize="xs" fontWeight="bold" letterSpacing="0.12em">
            SERIES · PART {context.position} OF {context.total}
          </Text>
          <Link
            as={RouterLink}
            to={`/series/${context.series.slug}`}
            color="text.primary"
            fontWeight="semibold"
            _hover={{ color: 'action.hover', textDecoration: 'none' }}
          >
            {context.series.title}
          </Link>
        </Stack>
        <Link
          as={RouterLink}
          to={`/series/${context.series.slug}`}
          color="action.primary"
          fontSize="sm"
          fontWeight="semibold"
          _hover={{ color: 'action.hover', textDecoration: 'none' }}
        >
          View learning path
        </Link>
      </HStack>

      {context.previous || context.next ? (
        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
          {context.previous ? (
            <Button
              as={RouterLink}
              to={toPublicPostPath(context.previous.postId)}
              variant="outline"
              leftIcon={<FiArrowLeft />}
              justifyContent="flex-start"
              h="auto"
              py={3}
              whiteSpace="normal"
            >
              {context.previous.title}
            </Button>
          ) : (
            <Box display={{ base: 'none', sm: 'block' }} />
          )}
          {context.next ? (
            <Button
              as={RouterLink}
              to={toPublicPostPath(context.next.postId)}
              variant="outline"
              rightIcon={<FiArrowRight />}
              justifyContent="space-between"
              h="auto"
              py={3}
              whiteSpace="normal"
            >
              {context.next.title}
            </Button>
          ) : null}
        </SimpleGrid>
      ) : null}
    </Stack>
  </Box>
)

export default SeriesContextCard

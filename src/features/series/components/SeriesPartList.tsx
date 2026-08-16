import { Box, HStack, Link, Stack, Text } from '@chakra-ui/react'
import { FiCheck } from 'react-icons/fi'
import { Link as RouterLink } from 'react-router-dom'
import { toPublicPostPath } from '../../../core'
import { PublicSeriesPart } from '../series.types'

interface SeriesPartListProps {
  parts: PublicSeriesPart[]
  visitedPostIds?: number[]
}

const SeriesPartList = ({ parts, visitedPostIds = [] }: SeriesPartListProps) => {
  const visited = new Set(visitedPostIds)

  return (
    <Box as="ol" listStyleType="none" m={0} p={0} aria-label="Series blogs">
      <Stack spacing={3}>
        {parts.map((part) => {
          const isVisited = visited.has(part.postId)
          return (
            <Box
              as="li"
              key={part.postId}
              border="1px solid"
              borderColor="border.subtle"
              borderRadius="xl"
              bg="bg.secondary"
              transition="border-color 180ms ease, background-color 180ms ease"
              _hover={{ borderColor: 'action.primary', bg: 'action.subtle' }}
            >
              <Link
                as={RouterLink}
                to={toPublicPostPath(part.postId)}
                display="block"
                px={{ base: 4, md: 5 }}
                py={4}
                color="inherit"
                _hover={{ textDecoration: 'none' }}
                _focusVisible={{ boxShadow: 'outline' }}
              >
                <HStack align="start" spacing={4}>
                  <Text minW="2.5rem" color="text.tertiary" fontSize="sm" fontWeight="semibold">
                    {String(part.position).padStart(2, '0')}
                  </Text>
                  <Stack spacing={1} flex={1} minW={0}>
                    <Text color="text.primary" fontWeight="semibold">
                      {part.title}
                    </Text>
                    <Text color="text.tertiary" fontSize="sm">
                      {part.publishedAt
                        ? new Date(part.publishedAt).toLocaleDateString()
                        : `Part ${part.position}`}
                    </Text>
                  </Stack>
                  {isVisited ? (
                    <HStack spacing={1} color="action.primary" aria-label="Opened on this browser">
                      <FiCheck aria-hidden />
                      <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        display={{ base: 'none', sm: 'block' }}
                      >
                        Opened
                      </Text>
                    </HStack>
                  ) : null}
                </HStack>
              </Link>
            </Box>
          )
        })}
      </Stack>
    </Box>
  )
}

export default SeriesPartList

import { Badge, Box, HStack, Link, Stack, Text, Wrap, WrapItem } from '@chakra-ui/react'
import { FiArrowRight, FiClock } from 'react-icons/fi'
import { Link as RouterLink } from 'react-router-dom'
import { toPublicPostPath } from '../../../core'
import { PublicSeriesPart } from '../series.types'

interface SeriesPartListProps {
  parts: PublicSeriesPart[]
}

const SeriesPartList = ({ parts }: SeriesPartListProps) => (
  <Box as="ol" listStyleType="none" m={0} p={0} aria-label="Series blogs">
    <Stack spacing={4}>
      {parts.map((part) => {
        return (
          <Box
            as="li"
            key={part.postId}
            border="1px solid"
            borderColor="border.subtle"
            borderRadius="2xl"
            bg="bg.secondary"
            transition="border-color 180ms ease, transform 180ms ease, box-shadow 180ms ease"
            _hover={{
              borderColor: 'action.primary',
              transform: 'translateY(-1px)',
              boxShadow: 'sm',
            }}
          >
            <Link
              as={RouterLink}
              to={toPublicPostPath(part.postId)}
              display="block"
              px={{ base: 5, md: 7 }}
              py={{ base: 5, md: 6 }}
              color="inherit"
              _hover={{ textDecoration: 'none' }}
              _focusVisible={{ boxShadow: 'outline' }}
            >
              <HStack align="start" spacing={{ base: 4, md: 6 }}>
                <Text minW="2.5rem" color="text.tertiary" fontSize="lg" fontWeight="semibold">
                  {String(part.position).padStart(2, '0')}
                </Text>
                <Stack spacing={3} flex={1} minW={0}>
                  <Text
                    color="action.primary"
                    fontSize="xs"
                    fontWeight="bold"
                    letterSpacing="0.12em"
                    textTransform="uppercase"
                  >
                    {part.position === 1
                      ? 'Start here'
                      : `Part ${String(part.position).padStart(2, '0')}`}
                  </Text>
                  <Text
                    color="text.primary"
                    fontWeight="semibold"
                    fontSize={{ base: 'lg', md: 'xl' }}
                  >
                    {part.title}
                  </Text>
                  {part.excerpt ? (
                    <Text color="text.secondary" lineHeight="tall" noOfLines={3}>
                      {part.excerpt}
                    </Text>
                  ) : null}
                  <HStack spacing={4} color="text.tertiary" fontSize="sm" flexWrap="wrap">
                    <HStack spacing={1.5}>
                      <FiClock aria-hidden />
                      <Text>{part.readingTime} min read</Text>
                    </HStack>
                    {part.tags.length > 0 ? (
                      <Wrap spacing={2}>
                        {part.tags.slice(0, 3).map((tag) => (
                          <WrapItem key={tag}>
                            <Badge
                              bg="bg.tertiary"
                              color="text.secondary"
                              borderRadius="full"
                              px={2.5}
                              py={1}
                            >
                              {tag}
                            </Badge>
                          </WrapItem>
                        ))}
                      </Wrap>
                    ) : null}
                  </HStack>
                </Stack>
                <Box color="action.primary" pt={1} aria-hidden>
                  <FiArrowRight />
                </Box>
              </HStack>
            </Link>
          </Box>
        )
      })}
    </Stack>
  </Box>
)

export default SeriesPartList

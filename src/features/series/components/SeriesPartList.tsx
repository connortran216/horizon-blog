import { Badge, Box, HStack, Icon, Link, Stack, Text, Wrap, WrapItem } from '@chakra-ui/react'
import { FiArrowRight, FiClock } from 'react-icons/fi'
import { Link as RouterLink } from 'react-router-dom'
import { toPublicPostPath } from '../../../core'
import { PublicSeriesPart } from '../series.types'

interface SeriesPartListProps {
  parts: PublicSeriesPart[]
}

const SeriesPartList = ({ parts }: SeriesPartListProps) => (
  <Box
    as="ol"
    className="signal-series-parts"
    position="relative"
    listStyleType="none"
    m={0}
    p={0}
    aria-label="Series blogs"
    _before={{
      content: '""',
      position: 'absolute',
      top: 8,
      bottom: 8,
      left: { base: '23px', md: '27px' },
      w: '2px',
      bg: 'border.subtle',
    }}
  >
    <Stack spacing={5}>
      {parts.map((part) => (
        <HStack as="li" key={part.postId} position="relative" align="stretch" spacing={4}>
          <Box
            position="relative"
            zIndex={1}
            display="grid"
            placeItems="center"
            alignSelf="flex-start"
            w={{ base: '48px', md: '56px' }}
            h={{ base: '48px', md: '56px' }}
            flexShrink={0}
            border="1px solid"
            borderColor={part.position === 1 ? 'action.primary' : 'border.subtle'}
            borderRadius="full"
            bg={part.position === 1 ? 'action.primary' : 'bg.surface'}
            color={part.position === 1 ? 'text.onAction' : 'text.primary'}
            fontWeight="bold"
            boxShadow="sm"
            transition="transform 220ms ease, background-color 220ms ease, border-color 220ms ease"
            className="signal-series-part-marker"
          >
            {String(part.position).padStart(2, '0')}
          </Box>

          <Box
            data-group=""
            flex={1}
            minW={0}
            border="1px solid"
            borderColor="border.subtle"
            borderRadius="2xl"
            bg="bg.surface"
            boxShadow="sm"
            transition="border-color 220ms ease, transform 260ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 260ms ease"
            _hover={{
              borderColor: 'action.primary',
              transform: 'translateX(6px)',
              boxShadow: 'lg',
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
              _active={{ transform: 'scale(0.987)' }}
              _focusVisible={{ boxShadow: 'outline' }}
            >
              <HStack align="start" spacing={{ base: 4, md: 6 }}>
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
                <Icon
                  as={FiArrowRight}
                  color="action.primary"
                  mt={1}
                  flexShrink={0}
                  transition="transform 220ms ease"
                  _groupHover={{ transform: 'translateX(5px)' }}
                />
              </HStack>
            </Link>
          </Box>
        </HStack>
      ))}
    </Stack>
  </Box>
)

export default SeriesPartList

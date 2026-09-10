import { Badge, Box, Button, HStack, Skeleton, Text, Wrap, WrapItem } from '@chakra-ui/react'
import { BlogArchiveTag } from '../blog.types'

interface BlogFilterToolbarProps {
  popularTags: BlogArchiveTag[]
  activeTags: string[]
  activeQuery: string
  loading: boolean
  onToggleTag: (tagName: string) => void
  onClearQuery: () => void
  onRemoveTag: (tagName: string) => void
  onClearAll: () => void
}

const BlogFilterToolbar = ({
  popularTags,
  activeTags,
  activeQuery,
  loading,
  onToggleTag,
  onClearQuery,
  onRemoveTag,
  onClearAll,
}: BlogFilterToolbarProps) => {
  const hasFilters = Boolean(activeQuery || activeTags.length > 0)

  return (
    <Box
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="3xl"
      bg="bg.glass"
      backdropFilter="blur(18px)"
      px={{ base: 5, md: 6 }}
      py={{ base: 5, md: 6 }}
      boxShadow="sm"
    >
      <Wrap spacing={3} align="center">
        <WrapItem>
          <Text
            fontSize="sm"
            textTransform="uppercase"
            letterSpacing="0.14em"
            color="text.tertiary"
          >
            Popular topics
          </Text>
        </WrapItem>

        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <WrapItem key={`tag-skeleton-${index}`}>
                <Skeleton h="34px" w="88px" borderRadius="full" />
              </WrapItem>
            ))
          : popularTags.map((tag) => {
              const isActive = activeTags.includes(tag.name)
              return (
                <WrapItem key={tag.id}>
                  <Button
                    size="sm"
                    borderRadius="full"
                    variant="ghost"
                    bg={isActive ? 'action.subtle' : 'bg.page'}
                    color={isActive ? 'action.primary' : 'text.secondary'}
                    _hover={{ bg: isActive ? 'action.subtle' : 'bg.tertiary' }}
                    onClick={() => onToggleTag(tag.name)}
                  >
                    #{tag.name}
                  </Button>
                </WrapItem>
              )
            })}
      </Wrap>

      {hasFilters && (
        <Wrap mt={5} spacing={3} align="center">
          <WrapItem>
            <Text
              fontSize="sm"
              textTransform="uppercase"
              letterSpacing="0.14em"
              color="text.tertiary"
            >
              Active filters
            </Text>
          </WrapItem>

          {activeQuery && (
            <WrapItem>
              <Badge
                px={3}
                py={2}
                borderRadius="full"
                bg="bg.page"
                color="text.primary"
                textTransform="none"
              >
                <HStack spacing={2}>
                  <Text>Search: {activeQuery}</Text>
                  <Button
                    size="xs"
                    variant="ghost"
                    minW="auto"
                    h="20px"
                    px={1}
                    onClick={onClearQuery}
                  >
                    x
                  </Button>
                </HStack>
              </Badge>
            </WrapItem>
          )}

          {activeTags.map((tag) => (
            <WrapItem key={tag}>
              <Badge
                px={3}
                py={2}
                borderRadius="full"
                bg="bg.page"
                color="text.primary"
                textTransform="none"
              >
                <HStack spacing={2}>
                  <Text>#{tag}</Text>
                  <Button
                    size="xs"
                    variant="ghost"
                    minW="auto"
                    h="20px"
                    px={1}
                    onClick={() => onRemoveTag(tag)}
                  >
                    x
                  </Button>
                </HStack>
              </Badge>
            </WrapItem>
          ))}

          <WrapItem>
            <Button size="sm" variant="ghost" color="action.primary" onClick={onClearAll}>
              Clear all
            </Button>
          </WrapItem>
        </Wrap>
      )}
    </Box>
  )
}

export default BlogFilterToolbar

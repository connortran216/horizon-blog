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
    <Box borderY="1px solid" borderColor="border.subtle" px={0} py={{ base: 4, md: 5 }}>
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
                    bg={isActive ? 'action.primary' : 'bg.surface'}
                    color={isActive ? 'text.onAction' : 'text.secondary'}
                    border="1px solid"
                    borderColor={isActive ? 'action.primary' : 'border.subtle'}
                    _hover={{
                      bg: isActive ? 'action.hover' : 'bg.tertiary',
                      color: isActive ? 'text.onAction' : 'text.primary',
                      transform: 'translateY(-2px)',
                      boxShadow: 'sm',
                    }}
                    _active={{ transform: 'scale(0.97)' }}
                    transition="transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease"
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

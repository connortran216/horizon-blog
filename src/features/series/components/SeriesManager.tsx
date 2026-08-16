import {
  Badge,
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Select,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { FiArrowDown, FiArrowUp, FiPlus, FiSave, FiTrash2 } from 'react-icons/fi'
import { OwnerSeries } from '../series.types'

export interface SeriesBlogOption {
  id: number
  title: string
  status: 'draft' | 'published'
}

interface SeriesManagerProps {
  series: OwnerSeries
  blogOptions: SeriesBlogOption[]
  assignedSeriesByPostId: Map<number, number>
  onUpdate: (seriesId: number, input: { title: string; description: string }) => Promise<void>
  onReplacePosts: (seriesId: number, postIds: number[]) => Promise<void>
  onDelete: (seriesId: number) => Promise<void>
}

const SeriesManager = ({
  series,
  blogOptions,
  assignedSeriesByPostId,
  onUpdate,
  onReplacePosts,
  onDelete,
}: SeriesManagerProps) => {
  const [title, setTitle] = useState(series.title)
  const [description, setDescription] = useState(series.description)
  const [postIds, setPostIds] = useState(series.parts.map((part) => part.postId))
  const [selectedPostId, setSelectedPostId] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setTitle(series.title)
    setDescription(series.description)
    setPostIds(series.parts.map((part) => part.postId))
  }, [series])

  const optionById = useMemo(
    () => new Map(blogOptions.map((blog) => [blog.id, blog])),
    [blogOptions],
  )
  const addableBlogs = blogOptions.filter(
    (blog) => !postIds.includes(blog.id) && !assignedSeriesByPostId.has(blog.id),
  )

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= postIds.length) return
    setPostIds((current) => {
      const next = [...current]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const add = () => {
    const postId = Number(selectedPostId)
    if (!postId) return
    setPostIds((current) => [...current, postId])
    setSelectedPostId('')
  }

  const run = async (action: () => Promise<void>) => {
    setSaving(true)
    try {
      await action()
    } catch {
      // The owner hook exposes a calm inline error for failed mutations.
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="2xl"
      bg="bg.secondary"
      p={{ base: 5, md: 7 }}
    >
      <Stack spacing={6}>
        <Stack spacing={4}>
          <FormControl>
            <FormLabel>Series title</FormLabel>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} bg="bg.page" />
          </FormControl>
          <FormControl>
            <FormLabel>Description</FormLabel>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              bg="bg.page"
              resize="vertical"
            />
          </FormControl>
          <HStack justify="space-between" flexWrap="wrap" gap={3}>
            <Button
              leftIcon={<FiSave />}
              isLoading={saving}
              onClick={() => run(() => onUpdate(series.id, { title, description }))}
            >
              Save details
            </Button>
            <Button
              variant="ghost"
              colorScheme="red"
              leftIcon={<FiTrash2 />}
              onClick={() => {
                if (window.confirm(`Delete “${series.title}”? The blogs will remain.`)) {
                  void run(() => onDelete(series.id))
                }
              }}
            >
              Delete series
            </Button>
          </HStack>
        </Stack>

        <Stack spacing={3}>
          <Text color="text.primary" fontWeight="semibold">
            Ordered blogs
          </Text>
          <Text color="text.tertiary" fontSize="sm">
            Each blog can belong to one series. Saving replaces this complete order.
          </Text>
          {postIds.length === 0 ? (
            <Text color="text.secondary">No blogs in this series yet.</Text>
          ) : (
            postIds.map((postId, index) => {
              const blog = optionById.get(postId)
              const fallback = series.parts.find((part) => part.postId === postId)
              return (
                <HStack
                  key={postId}
                  border="1px solid"
                  borderColor="border.subtle"
                  borderRadius="xl"
                  bg="bg.page"
                  p={3}
                  align="center"
                >
                  <Text color="text.tertiary" minW="2rem" fontSize="sm">
                    {index + 1}
                  </Text>
                  <Stack spacing={1} flex={1} minW={0}>
                    <Text color="text.primary" fontWeight="medium" noOfLines={2}>
                      {blog?.title ?? fallback?.title ?? `Blog ${postId}`}
                    </Text>
                    <Badge
                      alignSelf="flex-start"
                      textTransform="none"
                      colorScheme={blog?.status === 'published' ? 'green' : 'gray'}
                    >
                      {blog?.status ?? fallback?.status ?? 'draft'}
                    </Badge>
                  </Stack>
                  <IconButton
                    aria-label={`Move ${blog?.title ?? 'blog'} up`}
                    icon={<FiArrowUp />}
                    variant="ghost"
                    isDisabled={index === 0}
                    onClick={() => move(index, -1)}
                  />
                  <IconButton
                    aria-label={`Move ${blog?.title ?? 'blog'} down`}
                    icon={<FiArrowDown />}
                    variant="ghost"
                    isDisabled={index === postIds.length - 1}
                    onClick={() => move(index, 1)}
                  />
                  <IconButton
                    aria-label={`Remove ${blog?.title ?? 'blog'} from series`}
                    icon={<FiTrash2 />}
                    variant="ghost"
                    onClick={() => setPostIds((current) => current.filter((id) => id !== postId))}
                  />
                </HStack>
              )
            })
          )}

          <HStack align="end">
            <FormControl>
              <FormLabel>Add an owned blog</FormLabel>
              <Select
                value={selectedPostId}
                onChange={(event) => setSelectedPostId(event.target.value)}
                bg="bg.page"
              >
                <option value="">Choose a blog</option>
                {addableBlogs.map((blog) => (
                  <option key={blog.id} value={blog.id}>
                    {blog.title} ({blog.status})
                  </option>
                ))}
              </Select>
            </FormControl>
            <IconButton
              aria-label="Add selected blog"
              icon={<FiPlus />}
              isDisabled={!selectedPostId}
              onClick={add}
            />
          </HStack>
          <Button
            variant="outline"
            leftIcon={<FiSave />}
            isLoading={saving}
            onClick={() => run(() => onReplacePosts(series.id, postIds))}
          >
            Save blog order
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}

export default SeriesManager

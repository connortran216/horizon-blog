import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { FiArrowLeft, FiPlus } from 'react-icons/fi'
import { Link as RouterLink } from 'react-router-dom'
import { getBlogService, LoadingPanel } from '../../../core'
import SeriesManager, { SeriesBlogOption } from '../components/SeriesManager'
import { useOwnerSeries } from '../useOwnerSeries'

const loadAllOwnedBlogs = async (): Promise<SeriesBlogOption[]> => {
  const service = getBlogService()
  const result: SeriesBlogOption[] = []

  for (const status of ['published', 'draft'] as const) {
    let page = 1
    let total = 1
    while (result.filter((blog) => blog.status === status).length < total) {
      const response = await service.getCurrentUserPostsPage(status, page, 50)
      total = response.total
      result.push(
        ...response.posts.map((blog) => ({
          id: Number(blog.id),
          title: blog.title,
          status,
        })),
      )
      if (response.posts.length === 0) break
      page += 1
    }
  }
  return result.filter((blog) => Number.isInteger(blog.id) && blog.id > 0)
}

const ManageSeriesPage = () => {
  const owner = useOwnerSeries()
  const [blogs, setBlogs] = useState<SeriesBlogOption[]>([])
  const [blogsLoading, setBlogsLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadAllOwnedBlogs()
      .then(setBlogs)
      .catch(() => setBlogs([]))
      .finally(() => setBlogsLoading(false))
  }, [])

  const assignedSeriesByPostId = useMemo(() => {
    const result = new Map<number, number>()
    owner.series.forEach((series) => {
      series.parts.forEach((part) => result.set(part.postId, series.id))
    })
    return result
  }, [owner.series])

  const create = async () => {
    setCreating(true)
    try {
      await owner.create({ title, description })
      setTitle('')
      setDescription('')
    } catch {
      // The owner hook exposes a calm inline error for failed mutations.
    } finally {
      setCreating(false)
    }
  }

  if (owner.loading || blogsLoading) {
    return <LoadingPanel label="Loading your series" description="Preparing your learning paths." />
  }

  return (
    <Container maxW="container.lg" py={{ base: 8, md: 12 }}>
      <Stack spacing={{ base: 8, md: 10 }}>
        <Button
          as={RouterLink}
          to="/blog-editor"
          variant="ghost"
          leftIcon={<FiArrowLeft />}
          alignSelf="flex-start"
        >
          Back to editor
        </Button>

        <Stack spacing={3}>
          <Text color="text.tertiary" fontSize="xs" fontWeight="bold" letterSpacing="0.14em">
            AUTHOR WORKSPACE
          </Text>
          <Heading color="text.primary">Manage series</Heading>
          <Text color="text.secondary" maxW="2xl">
            Group related blogs into one ordered learning path. Each blog can belong to one series.
          </Text>
        </Stack>

        {owner.error ? (
          <Alert status="error" borderRadius="xl">
            <AlertIcon />
            <AlertDescription>{owner.error}</AlertDescription>
          </Alert>
        ) : null}

        <Box
          border="1px solid"
          borderColor="border.subtle"
          borderRadius="2xl"
          bg="bg.secondary"
          p={{ base: 5, md: 7 }}
        >
          <Stack spacing={4}>
            <Heading size="md" color="text.primary">
              Create a series
            </Heading>
            <FormControl isRequired>
              <FormLabel>Series title</FormLabel>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                bg="bg.page"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                bg="bg.page"
              />
            </FormControl>
            <Button
              leftIcon={<FiPlus />}
              alignSelf="flex-start"
              isLoading={creating}
              onClick={() => void create()}
            >
              Create series
            </Button>
          </Stack>
        </Box>

        {owner.series.length === 0 ? (
          <Text color="text.secondary">No series yet. Create the first learning path above.</Text>
        ) : (
          <Stack spacing={6}>
            {owner.series.map((series) => (
              <SeriesManager
                key={series.id}
                series={series}
                blogOptions={blogs}
                assignedSeriesByPostId={assignedSeriesByPostId}
                onUpdate={owner.update}
                onReplacePosts={owner.replacePosts}
                onDelete={owner.remove}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Container>
  )
}

export default ManageSeriesPage

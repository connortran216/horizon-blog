import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Input,
  Radio,
  SimpleGrid,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react'
import { FiArrowLeft } from 'react-icons/fi'
import { useLocation, useNavigate } from 'react-router-dom'
import { LoadingPanel, toPublicPostPath } from '../../../core'
import { PublicPostRecord } from '../../../core/types/blog.types'
import { mapApiPostToSummary } from '../../../core/utils/blog-mapping.utils'
import { useAuth } from '../../../context/AuthContext'
import PublishBlogPreviewCard from '../components/PublishBlogPreviewCard'
import { getEditorPostService } from '../editor-post.service'

type PublishMode = 'now' | 'schedule'

const localDateValue = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

const localTimeValue = (date: Date) =>
  [date.getHours(), date.getMinutes()].map((value) => value.toString().padStart(2, '0')).join(':')

const PublishBlogPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const { user } = useAuth()
  const postId = new URLSearchParams(location.search).get('id')
  const tomorrow = useMemo(() => {
    const value = new Date()
    value.setDate(value.getDate() + 1)
    return value
  }, [])
  const [blog, setBlog] = useState<PublicPostRecord | null>(null)
  const [mode, setMode] = useState<PublishMode>('now')
  const [date, setDate] = useState(localDateValue(tomorrow))
  const [time, setTime] = useState('09:00')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const existingSchedule = blog?.scheduled_publish_at

  useEffect(() => {
    if (!postId || !user) return
    getEditorPostService()
      .loadEditablePost(postId, user.id)
      .then(setBlog)
      .catch(() => navigate(user.username ? `/profile/${user.username}` : '/', { replace: true }))
  }, [navigate, postId, user])

  useEffect(() => {
    if (!existingSchedule) return
    const scheduled = new Date(existingSchedule)
    if (!Number.isFinite(scheduled.getTime())) return

    setMode('schedule')
    setDate(localDateValue(scheduled))
    setTime(localTimeValue(scheduled))
  }, [existingSchedule])

  const scheduledAt = useMemo(() => new Date(`${date}T${time}`), [date, time])
  const hasValidSchedule = Number.isFinite(scheduledAt.getTime())
  const publicationDate = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(mode === 'schedule' && hasValidSchedule ? scheduledAt : new Date())
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const preview = blog ? mapApiPostToSummary(blog) : null

  const chooseMode = (nextMode: PublishMode) => {
    setMode(nextMode)
    setError('')
  }

  const submit = async () => {
    if (!blog || !postId) return
    if (mode === 'schedule' && (!hasValidSchedule || scheduledAt <= new Date())) {
      setError('Choose a publication time in the future.')
      return
    }

    setIsSubmitting(true)
    setError('')
    try {
      if (mode === 'now') {
        const published = await getEditorPostService().publish(postId, {
          title: blog.title,
          content_markdown: blog.content_markdown,
          content_json: blog.content_json || '{}',
          tag_names: blog.tags?.map((tag) => tag.name),
        })
        navigate(toPublicPostPath(published.id))
        return
      }
      await getEditorPostService().schedule(postId, scheduledAt.toISOString())
      toast({
        title: 'Blog scheduled',
        description: `It will go live ${scheduledAt.toLocaleString()}.`,
        status: 'success',
        duration: 4000,
        isClosable: true,
      })
      navigate(user?.username ? `/profile/${user.username}` : '/')
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Publishing failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!blog || !preview) {
    return <LoadingPanel label="Preparing publishing" description="Loading your saved blog." />
  }

  return (
    <Container maxW="7xl" px={{ base: 4, md: 6 }} py={{ base: 6, md: 10 }}>
      <Button
        variant="ghost"
        leftIcon={<FiArrowLeft />}
        color="text.secondary"
        mb={6}
        onClick={() =>
          navigate(`/blog-editor?id=${blog.id}`, { state: { blog, authorizedEdit: true } })
        }
      >
        Back to editor
      </Button>
      <Heading color="text.primary" mb={8}>
        Publish your blog
      </Heading>

      <SimpleGrid columns={{ base: 1, lg: 12 }} spacing={{ base: 8, lg: 6 }} alignItems="start">
        <Stack
          gridColumn={{ lg: 'span 5' }}
          spacing={6}
          p={{ base: 5, md: 7 }}
          border="1px solid"
          borderColor="border.subtle"
          borderRadius="2xl"
          bg="bg.secondary"
          position={{ lg: 'sticky' }}
          top={{ lg: 24 }}
        >
          <Text color="text.tertiary" fontSize="xs" fontWeight="bold" letterSpacing="0.14em">
            PUBLISH SETTINGS
          </Text>
          <Heading size="lg" color="text.primary">
            When should it go live?
          </Heading>

          {(
            [
              ['now', 'Publish now', 'Make it public immediately.'],
              ['schedule', 'Schedule for later', 'Choose a date and time.'],
            ] as const
          ).map(([value, label, description]) => (
            <Box
              key={value}
              as="label"
              p={5}
              border="1px solid"
              borderColor={mode === value ? 'action.primary' : 'border.default'}
              borderRadius="xl"
              bg={mode === value ? 'action.subtle' : 'bg.page'}
              cursor="pointer"
              onClick={() => chooseMode(value)}
              _focusWithin={{
                outline: '2px solid',
                outlineColor: 'action.primary',
                outlineOffset: '2px',
              }}
            >
              <HStack align="start" spacing={4}>
                <Radio
                  value={value}
                  isChecked={mode === value}
                  mt={1}
                  _checked={{
                    bg: 'action.primary',
                    borderColor: 'action.primary',
                  }}
                  onChange={() => chooseMode(value)}
                />
                <Stack spacing={1}>
                  <Text color="text.primary" fontWeight="semibold">
                    {label}
                  </Text>
                  <Text color="text.secondary">{description}</Text>
                </Stack>
              </HStack>
            </Box>
          ))}

          {mode === 'schedule' ? (
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
              <FormControl isInvalid={Boolean(error)}>
                <FormLabel color="text.secondary">Publication date</FormLabel>
                <Input
                  type="date"
                  min={localDateValue(new Date())}
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  bg="bg.page"
                  borderColor="border.default"
                />
              </FormControl>
              <FormControl isInvalid={Boolean(error)}>
                <FormLabel color="text.secondary">Publication time</FormLabel>
                <Input
                  type="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  bg="bg.page"
                  borderColor="border.default"
                />
              </FormControl>
            </SimpleGrid>
          ) : null}

          {mode === 'schedule' ? (
            <Text color="text.tertiary" fontSize="sm">
              {timezone} ·{' '}
              {hasValidSchedule ? scheduledAt.toLocaleString() : 'Select a date and time'}
            </Text>
          ) : null}
          {error ? (
            <FormControl isInvalid>
              <FormErrorMessage>{error}</FormErrorMessage>
            </FormControl>
          ) : null}
          <Button
            variant="solid"
            isLoading={isSubmitting}
            loadingText={mode === 'now' ? 'Publishing' : 'Scheduling'}
            onClick={submit}
          >
            {mode === 'now' ? 'Publish now' : 'Schedule blog'}
          </Button>
        </Stack>

        <Stack
          gridColumn={{ lg: 'span 7' }}
          spacing={4}
          p={{ base: 4, md: 6 }}
          border="1px solid"
          borderColor="border.subtle"
          borderRadius="2xl"
          bg="bg.page"
        >
          <Text color="text.tertiary" fontSize="xs" fontWeight="bold" letterSpacing="0.14em">
            LANDING PAGE PREVIEW
          </Text>
          <PublishBlogPreviewCard blog={preview} publicationDate={publicationDate} />
          <Text color="text.tertiary" fontSize="sm">
            This is how your blog will appear on the landing page.
          </Text>
        </Stack>
      </SimpleGrid>
    </Container>
  )
}

export default PublishBlogPage

import {
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
} from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import DefaultPostCover from '../../media/components/DefaultPostCover'
import { getResponsiveImageAttributes } from '../../media/media.presentation'
import { useResolvedCoverMedia } from '../../media/useResolvedCoverImage'
import { ProfileBlogPost } from '../profile.types'
import {
  formatLastUpdated,
  formatScheduleExact,
  formatScheduleRelative,
  formatScheduleTimezone,
  getScheduleDisplayState,
} from '../schedule-display.utils'

interface ProfileScheduledRowProps {
  blog: ProfileBlogPost
  now: Date
  onEdit: (blogId: string) => void
  onReschedule: (blogId: string) => void
  onPublishNow: (blogId: string) => void
  onCancelSchedule: (blog: ProfileBlogPost) => void
  onDelete: (blogId: string) => void
}

const STATUS_CONTENT = {
  scheduled: { label: 'Scheduled', colorScheme: 'blue' },
  publishing: { label: 'Publishing', colorScheme: 'purple' },
  needs_attention: { label: 'Needs attention', colorScheme: 'orange' },
} as const

const ProfileScheduledRow = ({
  blog,
  now,
  onEdit,
  onReschedule,
  onPublishNow,
  onCancelSchedule,
  onDelete,
}: ProfileScheduledRowProps) => {
  const scheduledAt = blog.scheduledPublishAt || ''
  const state = getScheduleDisplayState(scheduledAt, now)
  const status = STATUS_CONTENT[state]
  const coverMedia = useResolvedCoverMedia(blog.featuredImage)
  const cover = coverMedia
    ? getResponsiveImageAttributes(coverMedia, '(max-width: 768px) 100vw, 180px')
    : undefined

  return (
    <Stack
      direction={{ base: 'column', md: 'row' }}
      spacing={0}
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="2xl"
      overflow="hidden"
      bg="bg.page"
    >
      <Box w={{ base: 'full', md: '180px' }} minH={{ base: '150px', md: '168px' }} flexShrink={0}>
        {cover ? (
          <Image {...cover} alt="" w="full" h="full" objectFit="cover" />
        ) : (
          <DefaultPostCover title={blog.title} eyebrow="Publication" h="full" />
        )}
      </Box>

      <Stack flex={1} p={{ base: 5, md: 6 }} spacing={4} justify="space-between">
        <Stack spacing={3}>
          <HStack justify="space-between" align="flex-start" spacing={4} flexWrap="wrap">
            <Badge
              colorScheme={status.colorScheme}
              borderRadius="full"
              px={3}
              py={1}
              textTransform="uppercase"
              letterSpacing="0.1em"
              fontSize="10px"
            >
              {status.label}
            </Badge>
            <Text color="text.tertiary" fontSize="sm">
              {formatLastUpdated(blog.updatedAt)}
            </Text>
          </HStack>

          <Heading size="md" color="text.primary" lineHeight="1.2">
            {blog.title}
          </Heading>

          <Box>
            <Text color="text.primary" fontWeight="semibold">
              {formatScheduleExact(scheduledAt)}
            </Text>
            <Text color="text.secondary" fontSize="sm" mt={1}>
              {formatScheduleTimezone(scheduledAt)} · {formatScheduleRelative(scheduledAt, now)}
            </Text>
          </Box>
        </Stack>

        <HStack spacing={3} justify={{ base: 'stretch', sm: 'flex-end' }} flexWrap="wrap">
          <Button
            size="sm"
            h={{ base: '44px', md: '32px' }}
            flex={{ base: 1, sm: 'initial' }}
            variant="outline"
            onClick={() => onEdit(blog.id)}
          >
            Edit
          </Button>
          <Menu placement="bottom-end" isLazy>
            <MenuButton
              as={Button}
              size="sm"
              h={{ base: '44px', md: '32px' }}
              flex={{ base: 1, sm: 'initial' }}
              colorScheme="blue"
              rightIcon={<ChevronDownIcon />}
              aria-label={`Manage schedule for ${blog.title}`}
            >
              Manage
            </MenuButton>
            <MenuList zIndex="tooltip">
              <MenuItem onClick={() => onReschedule(blog.id)}>Reschedule</MenuItem>
              <MenuItem onClick={() => onPublishNow(blog.id)}>Publish now</MenuItem>
              <MenuItem onClick={() => onCancelSchedule(blog)}>Cancel schedule</MenuItem>
              <MenuItem color="red.500" onClick={() => onDelete(blog.id)}>
                Delete blog
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Stack>
    </Stack>
  )
}

export default ProfileScheduledRow

/**
 * The scheduled tab's list and its pager.
 *
 * A real `ol`: these rows are a queue with an order the author reads as one, and
 * the legacy `VStack` said nothing about that to a screen reader.
 */

import { useRef } from 'react'
import { Box } from '@chakra-ui/react'

import { Pagination, Stack, Text } from '../../../design-system'
import { ProfileBlogPost, ProfilePaginationState } from '../profile.types'
import ProfileScheduledRow from './ProfileScheduledRow'

interface ProfileScheduledListProps {
  blogs: ProfileBlogPost[]
  pagination: ProfilePaginationState
  now: Date
  onPageChange: (page: number) => void
  onEdit: (blogId: string) => void
  onReschedule: (blogId: string) => void
  onPublishNow: (blogId: string) => void
  onCancelSchedule: (blog: ProfileBlogPost) => void
  onDelete: (blogId: string) => void
}

const ProfileScheduledList = ({
  blogs,
  pagination,
  now,
  onPageChange,
  onEdit,
  onReschedule,
  onPublishNow,
  onCancelSchedule,
  onDelete,
}: ProfileScheduledListProps) => {
  // The block the pager pages: the note, the queue and the pager together.
  const regionRef = useRef<HTMLElement>(null)

  return (
    <Stack ref={regionRef} gap={4}>
      <Text recipe="metadata">
        Every publication below is still a draft. The server publishes it at the time shown.
      </Text>

      <Stack as="ol" gap={4}>
        {blogs.map((blog) => (
          <Box as="li" key={blog.id} listStyleType="none">
            <ProfileScheduledRow
              blog={blog}
              now={now}
              onEdit={onEdit}
              onReschedule={onReschedule}
              onPublishNow={onPublishNow}
              onCancelSchedule={onCancelSchedule}
              onDelete={onDelete}
            />
          </Box>
        ))}
      </Stack>

      <Pagination
        page={pagination.page}
        pageSize={pagination.limit}
        totalItems={pagination.total}
        onPageChange={onPageChange}
        regionRef={regionRef}
        label="Scheduled publications pagination"
      />
    </Stack>
  )
}

export default ProfileScheduledList

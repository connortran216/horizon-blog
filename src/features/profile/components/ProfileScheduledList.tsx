import { VStack } from '@chakra-ui/react'
import PaginationControls from '../../../components/PaginationControls'
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
}: ProfileScheduledListProps) => (
  <VStack spacing={4} align="stretch">
    {blogs.map((blog) => (
      <ProfileScheduledRow
        key={blog.id}
        blog={blog}
        now={now}
        onEdit={onEdit}
        onReschedule={onReschedule}
        onPublishNow={onPublishNow}
        onCancelSchedule={onCancelSchedule}
        onDelete={onDelete}
      />
    ))}
    <PaginationControls
      currentPage={pagination.page}
      totalPages={Math.ceil(pagination.total / pagination.limit)}
      totalCount={pagination.total}
      pageSize={pagination.limit}
      onPageChange={onPageChange}
      textColor="text.tertiary"
    />
  </VStack>
)

export default ProfileScheduledList

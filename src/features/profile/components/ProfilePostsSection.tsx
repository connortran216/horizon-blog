import { Box, Heading, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from '@chakra-ui/react'
import ProfileBlogGrid from './ProfileBlogGrid'
import { ProfileBlogPost, ProfilePaginationState } from '../profile.types'

interface ProfilePostsSectionProps {
  postsLoading: boolean
  profileUsername: string
  publishedBlogs: ProfileBlogPost[]
  draftBlogs: ProfileBlogPost[]
  publishedPagination: ProfilePaginationState
  draftPagination: ProfilePaginationState
  onPublishedPageChange: (page: number) => void
  onDraftPageChange: (page: number) => void
  onEdit: (blogId: string) => void
  onDelete: (blogId: string) => void
}

const ProfilePostsSection = ({
  postsLoading,
  profileUsername,
  publishedBlogs,
  draftBlogs,
  publishedPagination,
  draftPagination,
  onPublishedPageChange,
  onDraftPageChange,
  onEdit,
  onDelete,
}: ProfilePostsSectionProps) => {
  const tabColor = 'text.secondary'
  const tabSelectedColor = 'accent.primary'
  const tabBorderColor = 'accent.primary'

  return (
    <Box>
      <Heading size="md" color="text.primary" mb={4}>
        My Articles
      </Heading>
      {postsLoading ? (
        <Text textAlign="center">Loading articles...</Text>
      ) : (
        <Tabs>
          <TabList>
            <Tab
              color={tabColor}
              _selected={{
                color: tabSelectedColor,
                borderColor: tabBorderColor,
              }}
            >
              Published Blogs
            </Tab>
            <Tab
              color={tabColor}
              _selected={{
                color: tabSelectedColor,
                borderColor: tabBorderColor,
              }}
            >
              Draft Blogs
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              {publishedBlogs.length === 0 ? (
                <Text textAlign="center">No published articles yet.</Text>
              ) : (
                <ProfileBlogGrid
                  blogs={publishedBlogs}
                  totalCount={publishedPagination.total}
                  currentPage={publishedPagination.page}
                  pageSize={publishedPagination.limit}
                  onPageChange={onPublishedPageChange}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  profileUsername={profileUsername}
                />
              )}
            </TabPanel>
            <TabPanel>
              {draftBlogs.length === 0 ? (
                <Text textAlign="center">No draft articles.</Text>
              ) : (
                <ProfileBlogGrid
                  blogs={draftBlogs}
                  totalCount={draftPagination.total}
                  currentPage={draftPagination.page}
                  pageSize={draftPagination.limit}
                  onPageChange={onDraftPageChange}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  profileUsername={profileUsername}
                />
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}
    </Box>
  )
}

export default ProfilePostsSection

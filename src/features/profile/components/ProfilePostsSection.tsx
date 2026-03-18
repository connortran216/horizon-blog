import {
  Badge,
  Box,
  Heading,
  HStack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
} from '@chakra-ui/react'
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
  const tabSelectedColor = 'action.primary'
  const tabBorderColor = 'action.primary'

  return (
    <Box
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="3xl"
      bg="bg.glass"
      backdropFilter="blur(18px)"
      px={{ base: 6, md: 8 }}
      py={{ base: 7, md: 8 }}
      boxShadow="md"
    >
      <VStack align="stretch" spacing={6}>
        <HStack justify="space-between" align="flex-end" flexWrap="wrap" spacing={4}>
          <Box>
            <Text
              fontSize="sm"
              textTransform="uppercase"
              letterSpacing="0.14em"
              color="text.tertiary"
            >
              Blogs
            </Text>
            <Heading mt={2} size="lg" color="text.primary" letterSpacing="-0.03em">
              Your blogs and works in progress
            </Heading>
          </Box>
          <Badge
            px={3}
            py={1.5}
            borderRadius="full"
            bg="bg.tertiary"
            color="text.secondary"
            textTransform="uppercase"
            letterSpacing="0.14em"
            fontSize="10px"
          >
            {publishedPagination.total + draftPagination.total} total blogs
          </Badge>
        </HStack>

        {postsLoading ? (
          <Text textAlign="center" color="text.secondary">
            Loading blogs...
          </Text>
        ) : (
          <Tabs variant="unstyled">
            <TabList gap={3} flexWrap="wrap">
              <Tab
                borderRadius="full"
                px={4}
                py={2}
                bg="bg.page"
                color={tabColor}
                _selected={{
                  bg: 'action.subtle',
                  color: tabSelectedColor,
                  borderColor: tabBorderColor,
                }}
              >
                Blogs ({publishedPagination.total})
              </Tab>
              <Tab
                borderRadius="full"
                px={4}
                py={2}
                bg="bg.page"
                color={tabColor}
                _selected={{
                  bg: 'action.subtle',
                  color: tabSelectedColor,
                  borderColor: tabBorderColor,
                }}
              >
                Drafts ({draftPagination.total})
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel px={0} pt={6}>
                {publishedBlogs.length === 0 ? (
                  <Box
                    border="1px solid"
                    borderColor="border.subtle"
                    borderRadius="2xl"
                    bg="bg.page"
                    px={6}
                    py={10}
                    textAlign="center"
                  >
                    <Text color="text.secondary">No blogs yet.</Text>
                  </Box>
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
              <TabPanel px={0} pt={6}>
                {draftBlogs.length === 0 ? (
                  <Box
                    border="1px solid"
                    borderColor="border.subtle"
                    borderRadius="2xl"
                    bg="bg.page"
                    px={6}
                    py={10}
                    textAlign="center"
                  >
                    <Text color="text.secondary">No draft articles.</Text>
                  </Box>
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
      </VStack>
    </Box>
  )
}

export default ProfilePostsSection

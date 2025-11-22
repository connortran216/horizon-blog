import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Avatar,
  SimpleGrid,
  Tag,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from '@chakra-ui/react'
import { MotionWrapper, AnimatedCard, Glassmorphism } from '../core'
import PaginationControls from '../components/PaginationControls'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useParams, Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getBlogRepository } from '../core/di/container'
import { FiMoreVertical } from 'react-icons/fi'

// Local BlogPost type that matches the old format
interface BlogPost {
  id: string
  title: string
  subtitle?: string
  createdAt: string
  status: string
}

const Profile = () => {
  const { username } = useParams()
  const { user, status } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [publishedBlogs, setPublishedBlogs] = useState<BlogPost[]>([])
  const [draftBlogs, setDraftBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [publishedPagination, setPublishedPagination] = useState({ page: 1, limit: 6, total: 0 })
  const [draftPagination, setDraftPagination] = useState({ page: 1, limit: 6, total: 0 })

  useEffect(() => {
    // Don't load posts if user is not authenticated or auth is still loading
    if (status === 'loading' || status === 'unauthenticated' || !user) {
      setLoading(false)
      return
    }

    // Load the current user's posts using /users/me/posts endpoint
    const loadUserPosts = async () => {
      setLoading(true)
      getBlogRepository().clearCache?.()

      try {
        // Fetch published posts
        const publishedResult = await getBlogRepository().getCurrentUserPosts(
          'published',
          publishedPagination.page,
          publishedPagination.limit,
        )
        if (publishedResult.success && publishedResult.data) {
          const mappedPublished = publishedResult.data.map((post) => ({
            id: String(post.id),
            title: post.title,
            subtitle: post.subtitle || post.excerpt,
            createdAt: post.createdAt,
            status: post.status,
          }))
          setPublishedBlogs(mappedPublished)
          // Set total from metadata if available
          const publishedTotal = publishedResult.metadata?.total
          if (publishedTotal !== undefined) {
            setPublishedPagination((prev) => ({ ...prev, total: publishedTotal }))
          } else {
            setPublishedPagination((prev) => ({ ...prev, total: 0 }))
          }
        }

        // Fetch draft posts
        const draftsResult = await getBlogRepository().getCurrentUserPosts(
          'draft',
          draftPagination.page,
          draftPagination.limit,
        )
        if (draftsResult.success && draftsResult.data) {
          const mappedDrafts = draftsResult.data.map((post) => ({
            id: String(post.id),
            title: post.title,
            subtitle: post.subtitle || post.excerpt,
            createdAt: post.createdAt,
            status: post.status,
          }))
          setDraftBlogs(mappedDrafts)
          // Set total from metadata if available
          const draftTotal = draftsResult.metadata?.total
          if (draftTotal !== undefined) {
            setDraftPagination((prev) => ({ ...prev, total: draftTotal }))
          }
        }
      } catch (error) {
        console.error('Error loading user posts:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserPosts()
  }, [
    location.pathname,
    user,
    status,
    publishedPagination.page,
    publishedPagination.limit,
    draftPagination.page,
    draftPagination.limit,
  ])

  // Clear data when user becomes unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated' || !user) {
      setPublishedBlogs([])
      setDraftBlogs([])
      setLoading(false)
    }
  }, [status, user])

  const loadBlogs = async () => {
    const publishedResult = await getBlogRepository().getCurrentUserPosts(
      'published',
      publishedPagination.page,
      publishedPagination.limit,
    )
    if (publishedResult.success && publishedResult.data) {
      const mappedPublished = publishedResult.data.map((post) => ({
        id: String(post.id),
        title: post.title,
        subtitle: post.subtitle || post.excerpt,
        createdAt: post.createdAt,
        status: post.status,
      }))
      setPublishedBlogs(mappedPublished)
      const publishedTotal = publishedResult.metadata?.total
      if (publishedTotal !== undefined) {
        setPublishedPagination((prev) => ({ ...prev, total: publishedTotal }))
      }
    }

    const draftsResult = await getBlogRepository().getCurrentUserPosts(
      'draft',
      draftPagination.page,
      draftPagination.limit,
    )
    if (draftsResult.success && draftsResult.data) {
      const mappedDrafts = draftsResult.data.map((post) => ({
        id: String(post.id),
        title: post.title,
        subtitle: post.subtitle || post.excerpt,
        createdAt: post.createdAt,
        status: post.status,
      }))
      setDraftBlogs(mappedDrafts)
      const draftTotalInLoadBlogs = draftsResult.metadata?.total
      if (draftTotalInLoadBlogs !== undefined) {
        setDraftPagination((prev) => ({ ...prev, total: draftTotalInLoadBlogs }))
      }
    }
  }

  const handleDelete = async (blogId: string) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        const result = await getBlogRepository().deletePost(blogId)

        if (result.success) {
          // Refresh the blogs lists with current pagination
          await loadBlogs()
        }
      } catch (error) {
        console.error('Error deleting blog post:', error)
      }
    }
  }

  const handleEdit = (blogId: string) => {
    // Navigate with state to indicate authorized edit from profile
    navigate(`/blog-editor?id=${blogId}`, {
      state: { fromProfile: true, authorizedEdit: true },
    })
  }

  const handlePublishedPageChange = (page: number) => {
    setPublishedPagination((prev) => ({ ...prev, page }))
  }

  const handleDraftPageChange = (page: number) => {
    setDraftPagination((prev) => ({ ...prev, page }))
  }

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const BlogGrid = ({
    blogs,
    totalCount,
    currentPage,
    pageSize,
    onPageChange,
  }: {
    blogs: BlogPost[]
    totalCount: number
    currentPage: number
    pageSize: number
    onPageChange: (page: number) => void
  }) => {
    const dateMeta = 'text.tertiary'

    return (
      <VStack spacing={6} align="stretch">
        <SimpleGrid columns={{ base: 1 }} spacing={4}>
          {blogs.map((blog, index) => (
            <Box key={blog.id} position="relative">
              <RouterLink to={`/profile/${username}/blog/${blog.id}`}>
                <Box height="100%" display="flex">
                  <AnimatedCard
                    maxW="100%"
                    overflow="hidden"
                    intensity="medium"
                    staggerDelay={0.15}
                    index={index}
                    animation="fadeInUp"
                  >
                    <HStack minHeight="140px" align="stretch">
                      <Box
                        width="100px"
                        bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        color="white"
                        fontSize="xl"
                        fontWeight="bold"
                        borderTopLeftRadius="md"
                        borderBottomLeftRadius="md"
                      >
                        {blog.title.substring(0, 2).toUpperCase()}
                      </Box>
                      <VStack p={4} spacing={2} align="stretch" flex={1} justify="space-between">
                        <Tag
                          colorScheme={blog.status === 'published' ? 'green' : 'gray'}
                          size="sm"
                          w="fit-content"
                          variant="subtle"
                        >
                          {blog.status}
                        </Tag>

                        <Heading size="sm" color="text.primary" noOfLines={2} lineHeight="1.3">
                          {blog.title}
                        </Heading>

                        <HStack spacing={2} align="center" flex={1}>
                          <Text fontSize="xs" color={dateMeta}>
                            {formatDate(blog.createdAt)}
                          </Text>
                        </HStack>
                      </VStack>
                    </HStack>
                  </AnimatedCard>
                </Box>
              </RouterLink>

              <Box position="absolute" top={1} right={1} zIndex="10">
                <Menu>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <MenuButton
                      as={IconButton}
                      icon={<FiMoreVertical />}
                      variant="ghost"
                      size="sm"
                      aria-label="Options"
                    />
                  </motion.div>
                  <MenuList zIndex="tooltip">
                    <MenuItem onClick={() => handleEdit(blog.id)}>Edit Blog</MenuItem>
                    <MenuItem onClick={() => handleDelete(blog.id)} color="red.500">
                      Delete Blog
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Box>
            </Box>
          ))}
        </SimpleGrid>

        <PaginationControls
          currentPage={currentPage}
          totalPages={Math.ceil(totalCount / pageSize)}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={onPageChange}
          textColor={dateMeta}
        />
      </VStack>
    )
  }

  const profileText = 'text.secondary'

  // Tab color mode values
  const tabColor = 'text.secondary'
  const tabSelectedColor = 'accent.primary'
  const tabBorderColor = 'accent.primary'

  return (
    <MotionWrapper>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Glassmorphism backdropBlur="15px" bg="rgba(255, 255, 255, 0.1)" borderRadius="3xl" p={8}>
            <VStack spacing={6} align="center" height="100%" justify="center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <Avatar size="2xl" src={user?.avatar} name={username} />
              </motion.div>
              <VStack spacing={2} textAlign="center">
                <Heading size="lg" color="text.primary">
                  {username}
                </Heading>
                <Text color={profileText}>
                  Passionate developer sharing insights about web development
                </Text>
              </VStack>
            </VStack>
          </Glassmorphism>

          <Box>
            <Heading size="md" color="text.primary" mb={4}>
              My Articles
            </Heading>
            {loading ? (
              <Text textAlign="center">Loading articles...</Text>
            ) : publishedBlogs.length === 0 && draftBlogs.length === 0 ? (
              <Text textAlign="center">No articles published yet.</Text>
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
                      <BlogGrid
                        blogs={publishedBlogs}
                        totalCount={publishedPagination.total}
                        currentPage={publishedPagination.page}
                        pageSize={publishedPagination.limit}
                        onPageChange={handlePublishedPageChange}
                      />
                    )}
                  </TabPanel>
                  <TabPanel>
                    {draftBlogs.length === 0 ? (
                      <Text textAlign="center">No draft articles.</Text>
                    ) : (
                      <BlogGrid
                        blogs={draftBlogs}
                        totalCount={draftPagination.total}
                        currentPage={draftPagination.page}
                        pageSize={draftPagination.limit}
                        onPageChange={handleDraftPageChange}
                      />
                    )}
                  </TabPanel>
                </TabPanels>
              </Tabs>
            )}
          </Box>
        </VStack>
      </Container>
    </MotionWrapper>
  )
}

export default Profile

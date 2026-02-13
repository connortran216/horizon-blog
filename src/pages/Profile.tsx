import {
  Avatar,
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Icon,
  IconButton,
  Image,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Spinner,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  Text,
  Textarea,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react'
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Link as RouterLink, useNavigate, useLocation, useParams } from 'react-router-dom'
import { FaUsers, FaPenNib, FaGithub, FaTwitter } from 'react-icons/fa'
import { FiMoreVertical } from 'react-icons/fi'
import { MotionWrapper, AnimatedCard, AnimatedGhostButton } from '../core'
import PaginationControls from '../components/PaginationControls'
import { useAuth } from '../context/AuthContext'
import { getBlogRepository, getProfileService } from '../core/di/container'
import { ApiError } from '../core/services/api.service'
import { UserProfile } from '../core/types/profile.types'
import { resolveMediaUrls } from '../features/media/media.api'

interface BlogPost {
  id: string
  title: string
  subtitle?: string
  createdAt: string
  status: string
  featuredImage?: string
}

interface ProfileFormValues {
  name: string
  bio: string
  website: string
  location: string
}

const DEFAULT_PROFILE_FORM: ProfileFormValues = {
  name: '',
  bio: '',
  website: '',
  location: '',
}

const buildProfileFormValues = (profile: UserProfile | null): ProfileFormValues => {
  if (!profile) {
    return DEFAULT_PROFILE_FORM
  }

  return {
    name: profile.name || '',
    bio: profile.bio || '',
    website: profile.website || '',
    location: profile.location || '',
  }
}

const buildFallbackProfile = (
  profile: UserProfile | null,
  authUser: {
    id: number
    username: string
    email?: string
  } | null,
): UserProfile => {
  if (profile) {
    return profile
  }

  return {
    id: authUser?.id || 0,
    name: authUser?.username || '',
    email: authUser?.email || '',
    bio: '',
    website: '',
    location: '',
    avatarUrl: undefined,
  }
}

const getProfileErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof ApiError) {
    if (error.status === 400) return 'Invalid profile data. Please check your inputs.'
    if (error.status === 401) return 'Session expired. Please log in again.'
    if (error.status === 413) return 'Max 5MB'
    if (error.status === 415) return 'Use JPG/PNG'
    if (error.status >= 500) return 'Something went wrong. Please try again.'
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

const sanitizeImageSrc = (value?: string): string | undefined => {
  if (!value) return undefined

  const trimmed = value.trim()
  if (!trimmed) return undefined
  if (trimmed.startsWith('media://')) return undefined

  if (
    /^https?:\/\//i.test(trimmed) ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('/')
  ) {
    return trimmed
  }

  return undefined
}

const Profile = () => {
  const { username } = useParams()
  const { user, status, refreshUserProfile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [publishedBlogs, setPublishedBlogs] = useState<BlogPost[]>([])
  const [draftBlogs, setDraftBlogs] = useState<BlogPost[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [publishedPagination, setPublishedPagination] = useState({ page: 1, limit: 6, total: 0 })
  const [draftPagination, setDraftPagination] = useState({ page: 1, limit: 6, total: 0 })

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileForm, setProfileForm] = useState<ProfileFormValues>(DEFAULT_PROFILE_FORM)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false)
  const [avatarRefreshAttempted, setAvatarRefreshAttempted] = useState(false)

  const avatarInputRef = useRef<HTMLInputElement | null>(null)

  const resolveFeaturedImages = async (
    posts: Array<{ featuredImage?: string }>,
  ): Promise<Record<string, string>> => {
    const tokenToMediaId = new Map<string, string>()

    posts.forEach((post) => {
      const cover = post.featuredImage
      if (!cover) return
      const match = cover.match(/^media:\/\/([a-zA-Z0-9_-]+)$/)
      if (match?.[1]) tokenToMediaId.set(cover, match[1])
    })

    if (tokenToMediaId.size === 0) return {}

    try {
      const mediaMap = await resolveMediaUrls(Array.from(tokenToMediaId.values()))
      const resolvedByToken: Record<string, string> = {}

      tokenToMediaId.forEach((mediaId, token) => {
        const resolved = mediaMap[mediaId]?.url
        if (resolved) resolvedByToken[token] = resolved
      })

      return resolvedByToken
    } catch {
      return {}
    }
  }

  const loadCurrentProfile = useCallback(
    async (showErrorToast = false, resetAvatarRetry = true): Promise<UserProfile | null> => {
      if (status !== 'authenticated') {
        setProfile(null)
        setProfileForm(DEFAULT_PROFILE_FORM)
        setProfileLoading(false)
        return null
      }

      setProfileLoading(true)

      try {
        const currentProfile = await getProfileService().getCurrentProfile()
        setProfile(currentProfile)
        setProfileForm(buildProfileFormValues(currentProfile))
        if (resetAvatarRetry) {
          setAvatarRefreshAttempted(false)
        }
        return currentProfile
      } catch (error) {
        if (showErrorToast) {
          toast({
            title: 'Failed to load profile',
            description: getProfileErrorMessage(error, 'Unable to load your profile.'),
            status: 'error',
            duration: 3000,
            isClosable: true,
          })
        }

        return null
      } finally {
        setProfileLoading(false)
      }
    },
    [status, toast],
  )

  useEffect(() => {
    void loadCurrentProfile(true)
  }, [loadCurrentProfile])

  useEffect(() => {
    if (status === 'loading' || status === 'unauthenticated' || !user) {
      setPostsLoading(false)
      return
    }

    const loadUserPosts = async () => {
      setPostsLoading(true)
      getBlogRepository().clearCache?.()

      try {
        const publishedResult = await getBlogRepository().getCurrentUserPosts(
          'published',
          publishedPagination.page,
          publishedPagination.limit,
        )

        if (publishedResult.success && publishedResult.data) {
          const resolvedPublishedImages = await resolveFeaturedImages(publishedResult.data)
          const mappedPublished = publishedResult.data.map((post) => ({
            featuredImage: sanitizeImageSrc(
              post.featuredImage
                ? resolvedPublishedImages[post.featuredImage] || post.featuredImage
                : undefined,
            ),
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
          } else {
            setPublishedPagination((prev) => ({ ...prev, total: 0 }))
          }
        }

        const draftsResult = await getBlogRepository().getCurrentUserPosts(
          'draft',
          draftPagination.page,
          draftPagination.limit,
        )

        if (draftsResult.success && draftsResult.data) {
          const resolvedDraftImages = await resolveFeaturedImages(draftsResult.data)
          const mappedDrafts = draftsResult.data.map((post) => ({
            featuredImage: sanitizeImageSrc(
              post.featuredImage
                ? resolvedDraftImages[post.featuredImage] || post.featuredImage
                : undefined,
            ),
            id: String(post.id),
            title: post.title,
            subtitle: post.subtitle || post.excerpt,
            createdAt: post.createdAt,
            status: post.status,
          }))
          setDraftBlogs(mappedDrafts)

          const draftTotal = draftsResult.metadata?.total
          if (draftTotal !== undefined) {
            setDraftPagination((prev) => ({ ...prev, total: draftTotal }))
          }
        }
      } catch (error) {
        console.error('Error loading user posts:', error)
      } finally {
        setPostsLoading(false)
      }
    }

    void loadUserPosts()
  }, [
    location.pathname,
    user,
    status,
    publishedPagination.page,
    publishedPagination.limit,
    draftPagination.page,
    draftPagination.limit,
  ])

  useEffect(() => {
    if (status === 'unauthenticated' || !user) {
      setPublishedBlogs([])
      setDraftBlogs([])
      setPostsLoading(false)
      setProfile(null)
      setProfileForm(DEFAULT_PROFILE_FORM)
    }
  }, [status, user])

  const loadBlogs = async () => {
    const publishedResult = await getBlogRepository().getCurrentUserPosts(
      'published',
      publishedPagination.page,
      publishedPagination.limit,
    )
    if (publishedResult.success && publishedResult.data) {
      const resolvedPublishedImages = await resolveFeaturedImages(publishedResult.data)
      const mappedPublished = publishedResult.data.map((post) => ({
        featuredImage: sanitizeImageSrc(
          post.featuredImage
            ? resolvedPublishedImages[post.featuredImage] || post.featuredImage
            : undefined,
        ),
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
      const resolvedDraftImages = await resolveFeaturedImages(draftsResult.data)
      const mappedDrafts = draftsResult.data.map((post) => ({
        featuredImage: sanitizeImageSrc(
          post.featuredImage
            ? resolvedDraftImages[post.featuredImage] || post.featuredImage
            : undefined,
        ),
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
          await loadBlogs()
        }
      } catch (error) {
        console.error('Error deleting blog post:', error)
      }
    }
  }

  const handleEdit = (blogId: string) => {
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

  const handleOpenProfileEditor = () => {
    const fallbackProfile = buildFallbackProfile(profile, user)
    setProfileForm(buildProfileFormValues(fallbackProfile))
    onOpen()
  }

  const handleProfileFormChange = (field: keyof ProfileFormValues, value: string) => {
    setProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSaveProfile = async () => {
    const fallbackProfile = buildFallbackProfile(profile, user)
    const normalizedName = profileForm.name.trim() || fallbackProfile.name.trim()

    if (!normalizedName) {
      toast({
        title: 'Name is required',
        description: 'Please enter your display name before saving.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsSavingProfile(true)
    try {
      const updatedProfile = await getProfileService().updateCurrentProfile(fallbackProfile, {
        ...profileForm,
        name: normalizedName,
      })
      setProfile(updatedProfile)
      setProfileForm(buildProfileFormValues(updatedProfile))
      setAvatarRefreshAttempted(false)
      void refreshUserProfile()

      toast({
        title: 'Profile updated',
        description: 'Your profile has been saved successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      onClose()
    } catch (error) {
      toast({
        title: 'Profile update failed',
        description: getProfileErrorMessage(error, 'Failed to update profile.'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleSelectAvatar = () => {
    avatarInputRef.current?.click()
  }

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    setIsUploadingAvatar(true)
    try {
      const updatedProfile = await getProfileService().uploadAvatar(file)
      setProfile(updatedProfile)
      setProfileForm(buildProfileFormValues(updatedProfile))
      setAvatarRefreshAttempted(false)
      void refreshUserProfile()

      toast({
        title: 'Avatar updated',
        description: 'Your avatar has been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Avatar upload failed',
        description: getProfileErrorMessage(error, 'Failed to upload avatar.'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleRemoveAvatar = async () => {
    if (!profile?.avatarUrl) {
      return
    }

    setIsRemovingAvatar(true)
    try {
      await getProfileService().removeAvatar()
      setProfile((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          avatarUrl: undefined,
        }
      })
      setAvatarRefreshAttempted(false)
      void refreshUserProfile()

      toast({
        title: 'Avatar removed',
        description: 'Your avatar has been removed.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Avatar removal failed',
        description: getProfileErrorMessage(error, 'Failed to remove avatar.'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsRemovingAvatar(false)
    }
  }

  useEffect(() => {
    const safeAvatarUrl = sanitizeImageSrc(profile?.avatarUrl)
    if (!safeAvatarUrl || avatarRefreshAttempted) {
      return
    }

    let isMounted = true
    const imageProbe = new window.Image()
    imageProbe.src = safeAvatarUrl
    imageProbe.onerror = () => {
      if (!isMounted) return

      setAvatarRefreshAttempted(true)
      void loadCurrentProfile(false, false).then((refreshedProfile) => {
        if (refreshedProfile) {
          void refreshUserProfile()
        }
      })
    }

    return () => {
      isMounted = false
    }
  }, [profile?.avatarUrl, avatarRefreshAttempted, loadCurrentProfile, refreshUserProfile])

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
    const profileUsername = user?.username || username || ''

    return (
      <VStack spacing={6} align="stretch">
        <SimpleGrid columns={{ base: 1 }} spacing={4}>
          {blogs.map((blog, index) => (
            <Box key={blog.id} position="relative">
              <RouterLink to={`/profile/${profileUsername}/blog/${blog.id}`}>
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
                      {blog.featuredImage ? (
                        <Box
                          width="100px"
                          overflow="hidden"
                          borderTopLeftRadius="md"
                          borderBottomLeftRadius="md"
                        >
                          <Image
                            src={blog.featuredImage}
                            alt={blog.title}
                            width="100%"
                            height="100%"
                            objectFit="cover"
                          />
                        </Box>
                      ) : (
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
                      )}
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

  const tabColor = 'text.secondary'
  const tabSelectedColor = 'accent.primary'
  const tabBorderColor = 'accent.primary'

  const profileName = profile?.name || user?.username || username || 'My Profile'
  const avatarSrc = sanitizeImageSrc(profile?.avatarUrl) || sanitizeImageSrc(user?.avatar)

  return (
    <MotionWrapper>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <AnimatedCard overflow="hidden" intensity="medium">
            <Box p={8} overflow="hidden" pos="relative">
              {profileLoading ? (
                <Flex justify="center" align="center" minH="160px">
                  <Spinner size="lg" />
                </Flex>
              ) : (
                <Flex
                  direction={{ base: 'column', md: 'row' }}
                  align={{ base: 'center', md: 'flex-start' }}
                  gap={6}
                >
                  <Box pos="relative">
                    <Avatar size={{ base: 'xl', md: 'xl' }} src={avatarSrc} name={profileName} />
                  </Box>

                  <VStack flex={1} align={{ base: 'center', md: 'stretch' }} spacing={3}>
                    <Heading size="3xl" color="text.primary">
                      {profileName}
                    </Heading>

                    {profile?.email && (
                      <Text color="text.tertiary" textAlign={{ base: 'center', md: 'left' }}>
                        {profile.email}
                      </Text>
                    )}

                    <Text
                      color="text.secondary"
                      textAlign={{ base: 'center', md: 'left' }}
                      maxW="lg"
                    >
                      {profile?.bio || 'Tell readers a bit about yourself.'}
                    </Text>

                    <HStack
                      spacing={4}
                      flexWrap="wrap"
                      justify={{ base: 'center', md: 'flex-start' }}
                    >
                      {profile?.location && <Text color="text.secondary">{profile.location}</Text>}
                      {profile?.website && (
                        <Text
                          as="a"
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          color="link.default"
                          _hover={{ color: 'link.hover' }}
                        >
                          Website
                        </Text>
                      )}
                    </HStack>

                    <Stack
                      direction="row"
                      spacing={6}
                      justify={{ base: 'center', md: 'flex-start' }}
                    >
                      <HStack spacing={2}>
                        <Icon as={FaUsers} color="accent.primary" />
                        <Text color="text.secondary">
                          <Text as="span" fontWeight="bold" color="text.primary">
                            1.2k
                          </Text>{' '}
                          Followers
                        </Text>
                      </HStack>
                      <HStack spacing={2}>
                        <Icon as={FaPenNib} color="accent.primary" />
                        <Text color="text.secondary">
                          <Text as="span" fontWeight="bold" color="text.primary">
                            {publishedPagination.total}
                          </Text>{' '}
                          Articles
                        </Text>
                      </HStack>
                      <HStack
                        spacing={3}
                        ml={2}
                        borderLeft="1px solid"
                        borderColor="border.default"
                        pl={4}
                      >
                        <IconButton
                          as="a"
                          href="#"
                          aria-label="GitHub"
                          icon={<Icon as={FaGithub} />}
                          variant="ghost"
                          size="sm"
                          color="text.secondary"
                          _hover={{ color: 'text.primary' }}
                        />
                        <IconButton
                          as="a"
                          href="#"
                          aria-label="Twitter"
                          icon={<Icon as={FaTwitter} />}
                          variant="ghost"
                          size="sm"
                          color="text.secondary"
                          _hover={{ color: '#1DA1F2' }}
                        />
                      </HStack>
                    </Stack>
                  </VStack>

                  <VStack alignSelf={{ base: 'center', md: 'flex-start' }} spacing={3}>
                    <AnimatedGhostButton
                      px={5}
                      py={2}
                      onClick={handleOpenProfileEditor}
                      isDisabled={profileLoading}
                    >
                      Edit Profile
                    </AnimatedGhostButton>
                    <AnimatedGhostButton
                      px={5}
                      py={2}
                      onClick={handleSelectAvatar}
                      isLoading={isUploadingAvatar}
                      isDisabled={profileLoading || isRemovingAvatar}
                    >
                      Change Avatar
                    </AnimatedGhostButton>
                    <AnimatedGhostButton
                      px={5}
                      py={2}
                      onClick={handleRemoveAvatar}
                      isLoading={isRemovingAvatar}
                      isDisabled={profileLoading || isUploadingAvatar || !profile?.avatarUrl}
                    >
                      Remove Avatar
                    </AnimatedGhostButton>
                    <Input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handleAvatarChange}
                      display="none"
                    />
                  </VStack>
                </Flex>
              )}
            </Box>
          </AnimatedCard>

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

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Profile</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={profileForm.name}
                  onChange={(event) => handleProfileFormChange('name', event.target.value)}
                  placeholder="Your name"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Bio</FormLabel>
                <Textarea
                  value={profileForm.bio}
                  onChange={(event) => handleProfileFormChange('bio', event.target.value)}
                  placeholder="Tell readers about you"
                  rows={4}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Website</FormLabel>
                <Input
                  value={profileForm.website}
                  onChange={(event) => handleProfileFormChange('website', event.target.value)}
                  placeholder="https://example.com"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Location</FormLabel>
                <Input
                  value={profileForm.location}
                  onChange={(event) => handleProfileFormChange('location', event.target.value)}
                  placeholder="City, Country"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              bg="accent.primary"
              color="white"
              _hover={{ bg: 'accent.hover' }}
              onClick={handleSaveProfile}
              isLoading={isSavingProfile}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </MotionWrapper>
  )
}

export default Profile

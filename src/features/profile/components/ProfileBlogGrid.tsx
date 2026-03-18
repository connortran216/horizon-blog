import {
  Badge,
  Box,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  SimpleGrid,
  Tag,
  Text,
  VStack,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Link as RouterLink } from 'react-router-dom'
import { FiArrowRight, FiMoreVertical } from 'react-icons/fi'
import PaginationControls from '../../../components/PaginationControls'
import { AnimatedCard } from '../../../core'
import DefaultPostCover from '../../media/components/DefaultPostCover'
import { ProfileBlogPost } from '../profile.types'
import { formatBlogDate } from '../profile.utils'

interface ProfileBlogGridProps {
  blogs: ProfileBlogPost[]
  totalCount: number
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
  onEdit: (blogId: string) => void
  onDelete: (blogId: string) => void
  profileUsername: string
}

const ProfileBlogGrid = ({
  blogs,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onEdit,
  onDelete,
  profileUsername,
}: ProfileBlogGridProps) => {
  const dateMeta = 'text.tertiary'
  const getStatusLabel = (status: string) => (status === 'published' ? 'Blog' : 'Draft')
  const getStatusStyles = (status: string) =>
    status === 'published'
      ? { bg: 'action.primary', color: 'white' }
      : { bg: 'bg.tertiary', color: 'text.secondary' }
  const getSupportText = (status: string) =>
    status === 'published'
      ? 'Live on the blog and ready to revisit.'
      : 'Still being shaped before publication.'

  return (
    <VStack spacing={6} align="stretch">
      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={6}>
        {blogs.map((blog, index) => (
          <Box key={blog.id} position="relative">
            <Box as={RouterLink} to={`/profile/${profileUsername}/blog/${blog.id}`} display="block">
              <Box height="100%" display="flex">
                <AnimatedCard
                  maxW="100%"
                  overflow="hidden"
                  intensity="light"
                  staggerDelay={0.12}
                  index={index}
                  animation="fadeInUp"
                >
                  <VStack align="stretch" spacing={0}>
                    <Box h="210px" overflow="hidden" position="relative">
                      {blog.featuredImage ? (
                        <Image
                          src={blog.featuredImage}
                          alt={blog.title}
                          w="full"
                          h="full"
                          objectFit="cover"
                        />
                      ) : (
                        <DefaultPostCover title={blog.title} eyebrow={blog.status} h="full" />
                      )}
                    </Box>

                    <VStack p={5} spacing={4} align="stretch" flex={1}>
                      <HStack justify="space-between" align="center" spacing={4}>
                        <Badge
                          px={3}
                          py={1}
                          borderRadius="full"
                          fontSize="10px"
                          textTransform="uppercase"
                          letterSpacing="0.12em"
                          {...getStatusStyles(blog.status)}
                        >
                          {getStatusLabel(blog.status)}
                        </Badge>
                        <Text fontSize="sm" color={dateMeta}>
                          {formatBlogDate(blog.createdAt)}
                        </Text>
                      </HStack>

                      <Heading size="md" color="text.primary" noOfLines={3} lineHeight="1.15">
                        {blog.title}
                      </Heading>

                      <Text color="text.secondary" lineHeight="tall" noOfLines={2}>
                        {getSupportText(blog.status)}
                      </Text>

                      <Flex
                        pt={3}
                        mt="auto"
                        borderTop="1px solid"
                        borderColor="border.subtle"
                        align="center"
                        justify="space-between"
                        gap={4}
                      >
                        <Tag size="sm" borderRadius="full" bg="bg.tertiary" color="text.secondary">
                          {blog.status === 'published' ? 'Live blog' : 'Private draft'}
                        </Tag>
                        <HStack spacing={2} color="action.primary" fontWeight="semibold">
                          <Text fontSize="sm">Open blog</Text>
                          <Icon as={FiArrowRight} />
                        </HStack>
                      </Flex>
                    </VStack>
                  </VStack>
                </AnimatedCard>
              </Box>
            </Box>

            <Box position="absolute" top={1} right={1} zIndex="10">
              <Menu isLazy lazyBehavior="unmount" placement="bottom-end">
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
                  <MenuItem onClick={() => onEdit(blog.id)}>Edit Blog</MenuItem>
                  <MenuItem onClick={() => onDelete(blog.id)} color="red.500">
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

export default ProfileBlogGrid

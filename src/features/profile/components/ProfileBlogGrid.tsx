import {
  Box,
  Heading,
  HStack,
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
import { FiMoreVertical } from 'react-icons/fi'
import PaginationControls from '../../../components/PaginationControls'
import { AnimatedCard } from '../../../core'
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
                          {formatBlogDate(blog.createdAt)}
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

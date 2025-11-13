import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Avatar,
  Button,
  Divider,
  useToast,
  Badge,
} from '@chakra-ui/react'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { apiService } from '../core/services/api.service'
import { useAuth } from '../context/AuthContext'
import MilkdownReader from '../components/reader/MilkdownReader'

interface BlogPost {
  id: number
  title: string
  content_markdown: string
  content_json: string
  status: string
  user_id: number
  created_at: string
  updated_at: string
  user?: {
    name: string
    email: string
  }
}

const ProfileBlogDetail = () => {
  const { username, id } = useParams<{ username: string; id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        try {
          const response = await apiService.get<{ data: BlogPost }>(`/posts/${id}`)
          const foundPost = response.data

          if (foundPost) {
            // Check if the post belongs to the profile being viewed
            if (foundPost.user?.name !== username) {
              toast({
                title: 'Access Denied',
                description: 'This post does not belong to this user.',
                status: 'error',
                duration: 5000,
                isClosable: true,
              })
              navigate(`/profile/${username}`)
              return
            }
            setPost(foundPost)
          } else {
            toast({
              title: 'Post not found',
              description: 'The blog post you are looking for does not exist.',
              status: 'error',
              duration: 5000,
              isClosable: true,
            })
            navigate(`/profile/${username}`)
          }
        } catch (error: unknown) {
          console.error('Error fetching post:', error)
          toast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to load blog post.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
          navigate(`/profile/${username}`)
        } finally {
          setLoading(false)
        }
      }

      fetchPost()
    }
  }, [id, username, navigate, toast])

  // Render content using MilkdownReader (read-only)
  const renderContent = () => {
    if (!post || !post.content_markdown) {
      return <Text>No content available</Text>
    }

    // Use MilkdownReader for read-only display
    return <MilkdownReader content={post.content_markdown} />
  }

  // Check if current user is viewing their own profile
  const isOwnProfile = user && username === user.username

  if (loading) {
    return (
      <Container maxW="container.md" py={10}>
        <Text>Loading...</Text>
      </Container>
    )
  }

  if (!post) {
    return (
      <Container maxW="container.md" py={10}>
        <Text>Post not found</Text>
      </Container>
    )
  }

  return (
    <Container maxW="container.md" py={10}>
      <Button
        leftIcon={<ArrowBackIcon />}
        variant="ghost"
        mb={6}
        onClick={() => navigate(`/profile/${username}`)}
      >
        Back to Profile
      </Button>

      <VStack spacing={6} align="stretch">
        <HStack justify="space-between" align="start">
          <Heading as="h1" size="2xl">
            {post.title}
          </Heading>
          {post.status === 'draft' && (
            <Badge colorScheme="yellow" fontSize="md" px={3} py={1}>
              Draft
            </Badge>
          )}
        </HStack>

        <HStack spacing={4}>
          <Avatar size="md" name={post.user?.name || 'Anonymous'} />
          <Box>
            <Text fontWeight="bold">{post.user?.name || 'Anonymous'}</Text>
            <Text fontSize="sm" color="gray.500">
              {post.status === 'published' ? 'Published' : 'Created'} on{' '}
              {new Date(post.created_at).toLocaleDateString()}
              {post.created_at !== post.updated_at &&
                ` • Updated on ${new Date(post.updated_at).toLocaleDateString()}`}
            </Text>
          </Box>
        </HStack>

        {isOwnProfile && (
          <Text fontSize="sm" color="gray.600" fontStyle="italic">
            This is a read-only view. To edit this post, go back to your profile and use the Edit
            option from the menu.
          </Text>
        )}

        <Divider my={4} />

        {renderContent()}
      </VStack>
    </Container>
  )
}

export default ProfileBlogDetail

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { apiService } from '../core/services/api.service';
import { useAuth } from '../context/AuthContext';
import MilkdownEditor from '../components/editor/MilkdownEditor';

interface BlogPost {
  id: number;
  title: string;
  content_markdown: string;
  content_json: string;
  status: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  user?: {
    name: string;
    email: string;
  };
}

const BlogDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        try {
          const response = await apiService.get<{ data: BlogPost }>(`/posts/${id}`);
          const foundPost = response.data;

          if (foundPost) {
            setPost(foundPost);
          } else {
            toast({
              title: 'Post not found',
              description: 'The blog post you are looking for does not exist.',
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
            navigate('/blog');
          }
        } catch (error: any) {
          console.error('Error fetching post:', error);
          toast({
            title: 'Error',
            description: error.message || 'Failed to load blog post.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          navigate('/blog');
        } finally {
          setLoading(false);
        }
      };

      fetchPost();
    }
  }, [id, navigate, toast]);

  // Render content using Milkdown in read-only mode
  const renderContent = () => {
    if (!post || !post.content_markdown) {
      return <Text>No content available</Text>;
    }

    // Use MilkdownEditor in read-only mode (view mode)
    return <MilkdownEditor initialContent={post.content_markdown} readOnly={true} />;
  };

  // Check if current user is the owner
  const isOwner = user && post && post.user_id === user.id;

  if (loading) {
    return (
      <Container maxW="container.md" py={10}>
        <Text>Loading...</Text>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container maxW="container.md" py={10}>
        <Text>Post not found</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={10}>
      <Button
        leftIcon={<ArrowBackIcon />}
        variant="ghost"
        mb={6}
        onClick={() => navigate('/blog')}
      >
        Back to Blog
      </Button>

      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="2xl">{post.title}</Heading>

        <HStack spacing={4}>
          <Avatar size="md" name={post.user?.name || 'Anonymous'} />
          <Box>
            <Text fontWeight="bold">{post.user?.name || 'Anonymous'}</Text>
            <Text fontSize="sm" color="gray.500">
              Published on {new Date(post.created_at).toLocaleDateString()}
              {post.created_at !== post.updated_at &&
                ` • Updated on ${new Date(post.updated_at).toLocaleDateString()}`}
            </Text>
          </Box>
        </HStack>

        {isOwner && (
          <HStack>
            <Button
              size="sm"
              colorScheme="blue"
              onClick={() => navigate(`/blog-editor?id=${post.id}`, { state: { blog: post } })}
            >
              Edit Post
            </Button>
          </HStack>
        )}

        <Divider my={4} />

        {renderContent()}
      </VStack>
    </Container>
  );
};

export default BlogDetail;

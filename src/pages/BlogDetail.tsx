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
  useColorModeValue,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { apiService } from '../core/services/api.service';
import MilkdownReader from '../components/reader/MilkdownReader';

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

  // Render content using MilkdownReader (read-only)
  const renderContent = () => {
    if (!post || !post.content_markdown) {
      return <Text color={useColorModeValue('gray.600', 'text.secondary')}>No content available</Text>;
    }

    // Use MilkdownReader for read-only display
    return <MilkdownReader content={post.content_markdown} />;
  };

  const loadingTextColor = useColorModeValue('gray.600', 'text.secondary');
  const headingColor = useColorModeValue('gray.900', 'text.primary');
  const authorNameColor = useColorModeValue('gray.900', 'text.primary');
  const dateColor = useColorModeValue('gray.500', 'text.tertiary');
  const dividerColor = useColorModeValue('gray.200', 'border.subtle');

  if (loading) {
    return (
      <Container maxW="container.md" py={10}>
        <Text color={loadingTextColor}>Loading...</Text>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container maxW="container.md" py={10}>
        <Text color={loadingTextColor}>Post not found</Text>
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
        <Heading as="h1" size="2xl" color={headingColor}>{post.title}</Heading>

        <HStack spacing={4}>
          <Avatar size="md" name={post.user?.name || 'Anonymous'} />
          <Box>
            <Text fontWeight="bold" color={authorNameColor}>{post.user?.name || 'Anonymous'}</Text>
            <Text fontSize="sm" color={dateColor}>
              Published on {new Date(post.created_at).toLocaleDateString()}
              {post.created_at !== post.updated_at &&
                ` • Updated on ${new Date(post.updated_at).toLocaleDateString()}`}
            </Text>
          </Box>
        </HStack>

        <Divider my={4} borderColor={dividerColor} />

        {renderContent()}
      </VStack>
    </Container>
  );
};

export default BlogDetail;

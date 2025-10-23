import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Text,
  VStack,
  HStack,
  Tag,
  Button,
  Avatar,
  useColorModeValue,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import { apiService } from '../core/services/api.service';

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

const BlogCard = ({ post }: { post: BlogPost }) => {
  // Extract excerpt from markdown content
  const getExcerpt = (markdown: string): string => {
    if (!markdown) return 'No content';

    // Remove markdown syntax (simple approach)
    let plainText = markdown
      .replace(/#{1,6}\s+/g, '') // Remove headings
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
      .replace(/`([^`]+)`/g, '$1') // Remove inline code
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/>\s+/g, '') // Remove blockquotes
      .replace(/[-*+]\s+/g, '') // Remove list markers
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();

    return plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
  };

  // Calculate reading time (rough estimate: 200 words per minute)
  const getReadingTime = (markdown: string): number => {
    const words = markdown.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  return (
    <Box
      maxW="100%"
      bg={useColorModeValue('white', 'gray.800')}
      boxShadow="xl"
      rounded="md"
      overflow="hidden"
      transition="transform 0.2s"
      _hover={{ transform: 'translateY(-4px)' }}
    >
      <Box
        height="200px"
        width="100%"
        bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        color="white"
        fontSize="3xl"
        fontWeight="bold"
      >
        {post.title.substring(0, 2).toUpperCase()}
      </Box>
      <VStack p={6} spacing={3} align="stretch">
        <HStack spacing={2} justify="space-between">
          <Tag colorScheme={post.status === 'published' ? 'green' : 'gray'}>
            {post.status}
          </Tag>
          <Text fontSize="sm" color="gray.500">
            {getReadingTime(post.content_markdown)} min read
          </Text>
        </HStack>
        <Heading size="md" noOfLines={2}>
          {post.title}
        </Heading>
        <Text color="gray.600" noOfLines={3}>
          {getExcerpt(post.content_markdown)}
        </Text>
        <HStack spacing={2} align="center">
          <Avatar size="xs" name={post.user?.name || 'Anonymous'} />
          <Text fontSize="sm" color="gray.500">
            {post.user?.name || 'Anonymous'}
          </Text>
          <Text fontSize="sm" color="gray.400">
            •
          </Text>
          <Text fontSize="sm" color="gray.500">
            {new Date(post.created_at).toLocaleDateString()}
          </Text>
        </HStack>
        <Button
          bg="black"
          color="white"
          _hover={{
            bg: 'gray.800'
          }}
          as={RouterLink}
          to={`/blog/${post.id}`}
          mt={2}
        >
          Read More
        </Button>
      </VStack>
    </Box>
  );
};

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Load blog posts from API
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const response = await apiService.get<{
          data: BlogPost[];
          page: number;
          limit: number;
          total: number;
        }>('/posts', { page, limit });

        // Only show published posts
        const publishedPosts = response.data.filter(post => post.status === 'published');
        setBlogPosts(publishedPosts);
        setTotal(response.total || 0);
        setTotalPages(Math.ceil((response.total || 0) / limit));
      } catch (error) {
        console.error('Failed to load blog posts:', error);
        setBlogPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [page]);

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.content_markdown.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8}>
        <Box textAlign="center">
          <Heading>Blog Posts</Heading>
          <Text mt={4} color="gray.600">
            Explore our latest articles and tutorials
          </Text>
        </Box>

        <InputGroup maxW="600px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>

        {loading && (
          <Text textAlign="center" color="gray.500">
            Loading posts...
          </Text>
        )}

        {!loading && (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} width="100%">
            {filteredPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </SimpleGrid>
        )}

        {!loading && filteredPosts.length === 0 && (
          <Text textAlign="center" color="gray.500">
            {searchQuery ? 'No posts found matching your search.' : 'No posts available yet.'}
          </Text>
        )}

        {!loading && totalPages > 1 && !searchQuery && (
          <HStack spacing={4} justify="center">
            <Button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              isDisabled={page === 1}
              bg="black"
              color="white"
              _hover={{ bg: 'gray.800' }}
            >
              Previous
            </Button>
            <Text>
              Page {page} of {totalPages} ({total} total posts)
            </Text>
            <Button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              isDisabled={page === totalPages}
              bg="black"
              color="white"
              _hover={{ bg: 'gray.800' }}
            >
              Next
            </Button>
          </HStack>
        )}
      </VStack>
    </Container>
  );
};

export default Blog;

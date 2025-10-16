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
  Image,
  VStack,
  HStack,
  Tag,
  Button,
  Select,
  useColorModeValue,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import { getBlogPosts } from '../services/blogStorage';
import { BlogPost } from '../types/blog';

// Now using real data from localStorage
const categories = ['All', 'React', 'TypeScript', 'UI/UX', 'JavaScript'];

const BlogCard = ({ post }: { post: BlogPost }) => {
  // Extract the first paragraph of content for the excerpt
  const getExcerpt = (post: BlogPost): string => {
    try {
      // Check if post has the new content structure
      if ((post as any).content?.blocks) {
        const contentBlocks = (post as any).content.blocks;
        if (typeof contentBlocks === 'string') {
          const parsed = JSON.parse(contentBlocks);
          if (parsed.root?.children?.length > 0) {
            const firstBlock = parsed.root.children[0];
            if (firstBlock?.children?.length > 0) {
              return firstBlock.children.map((child: any) => child.text || '').join('').substring(0, 150) + '...';
            }
          }
        }
      }

      // Fallback to old structure
      const blocks = (post as any).blocks;
      if (!blocks || blocks.length === 0) return 'No content';

      // Try to extract text from the first paragraph
      const firstBlock = blocks[0];
      if (firstBlock && firstBlock.children && firstBlock.children.length > 0) {
        return firstBlock.children.map((child: any) => child.text || '').join('').substring(0, 150) + '...';
      }

      return 'No content';
    } catch (error) {
      console.error('Error extracting excerpt:', error);
      return 'No content';
    }
  };

  return (
    <Box
      maxW="100%"
      bg={useColorModeValue('white', 'gray.800')}
      boxShadow="xl"
      rounded="md"
      overflow="hidden"
    >
      <Box 
        height="200px"
        width="100%"
        bg="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {post.author.avatar ? (
          <Image
            src={post.author.avatar}
            alt={post.title}
            height="200px"
            width="100%"
            objectFit="cover"
          />
        ) : (
          <Text fontSize="xl" color="gray.500">No Image</Text>
        )}
      </Box>
      <VStack p={6} spacing={3} align="stretch">
        <HStack spacing={2}>
          <Tag bg="black" color="white">{post.status}</Tag>
          <Text fontSize="sm" color="gray.500">
            {new Date(post.createdAt).toLocaleDateString()}
          </Text>
        </HStack>
        <Heading size="md" noOfLines={2}>
          {post.title}
        </Heading>
        <Text color="gray.500" noOfLines={3}>
          {getExcerpt(post)}
        </Text>
        <Text fontSize="sm" color="gray.500">
          By {post.author.username}
        </Text>
        <Button
          bg="black"
          color="white"
          _hover={{
            bg: "gray.800"
          }}
          as={RouterLink}
          to={`/blog/${post.id}`}
        >
          Read More
        </Button>
      </VStack>
    </Box>
  );
};

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  
  // Load blog posts from storage
  useEffect(() => {
    const loadPosts = async () => {
      try {
        const posts = await getBlogPosts();
        // Only show published posts
        setBlogPosts(posts.filter(post => post.status === 'published'));
      } catch (error) {
        console.error('Failed to load blog posts:', error);
        setBlogPosts([]);
      }
    };

    loadPosts();
  }, []);

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
    // For simplicity, we're not filtering by category yet (you can add category support later)
    const matchesCategory = true; // selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
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

        <HStack spacing={4} width="100%">
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
          <Select
            width="200px"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} width="100%">
          {filteredPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </SimpleGrid>

        {filteredPosts.length === 0 && (
          <Text textAlign="center" color="gray.500">
            No posts found matching your criteria.
          </Text>
        )}
      </VStack>
    </Container>
  );
};

export default Blog;

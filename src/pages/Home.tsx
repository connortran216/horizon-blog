import {
  Box,
  Heading,
  Container,
  Text,
  Button,
  Stack,
  SimpleGrid,
  useColorModeValue,
  Image,
  Flex,
  Icon,
  Avatar,
  HStack,
  Divider,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaBookmark, FaClock } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { getBlogPosts } from '../services/blogStorage';
import { BlogPost } from '../types/blog';
import { useAuth } from '../context/AuthContext';

// Default avatar for posts without author avatar
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60';
// Default image for posts without featured image
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60';

const BlogCard = ({ post }: { post: BlogPost }) => {
  // Format date to a readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <Box
      as="article"
      w="full"
      py={8}
      _hover={{ cursor: 'pointer' }}
      borderBottom="1px"
      borderColor="gray.200"
    >
      <Flex gap={6} align="start">
        <Stack flex="1" spacing={4}>
          <HStack spacing={3}>
            <Avatar src={post.author.avatar || DEFAULT_AVATAR} size="xs" />
            <Text fontSize="sm" color="gray.700">{post.author.username}</Text>
            <Text fontSize="sm" color="gray.500">·</Text>
            <Text fontSize="sm" color="gray.500">{formatDate(post.createdAt)}</Text>
          </HStack>
          
          <Heading
            as={RouterLink}
            to={`/blog/${post.id}`}
            fontSize="24px"
            fontFamily="gt-super, Georgia, serif"
            fontWeight="bold"
            color="gray.900"
            _hover={{ color: "gray.700" }}
          >
            {post.title}
          </Heading>
          
          <Text 
            color="gray.600" 
            fontSize="16px"
            noOfLines={2}
            lineHeight="tall"
          >
            {post.subtitle || ''}
          </Text>

          <HStack spacing={4} mt={2}>
            {post.tags && post.tags.length > 0 && (
              <Text
                px={3}
                py={1}
                bg="gray.100"
                color="gray.700"
                fontSize="sm"
                rounded="full"
              >
                {post.tags[0]}
              </Text>
            )}
            <HStack spacing={1} color="gray.500">
              <Icon as={FaClock} w={3} h={3} />
              <Text fontSize="sm">{post.readingTime || 1} min read</Text>
            </HStack>
            <Icon 
              as={FaBookmark} 
              w={4} 
              h={4} 
              color="gray.400"
              _hover={{ color: "gray.600" }}
              ml="auto" 
            />
          </HStack>
        </Stack>

        <Box 
          w="200px" 
          h="134px" 
          rounded="md" 
          overflow="hidden"
          flexShrink={0}
        >
          <Image
            src={post.featuredImage || DEFAULT_IMAGE}
            alt={post.title}
            w="full"
            h="full"
            objectFit="cover"
          />
        </Box>
      </Flex>
    </Box>
  );
};

const Home = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadBlogPosts = () => {
      try {
        const posts = getBlogPosts().filter(post => post.status === 'published');
        setBlogPosts(posts);
      } catch (error) {
        console.error('Error loading blog posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBlogPosts();
  }, []);

  return (
    <Box bg="#faf9f7">
      {/* Hero Section */}
      <Box borderBottom="1px" borderColor="gray.200" bg="#faf9f7" position="relative" overflow="hidden">
        <Container maxW="container.xl" py={{ base: 20, md: 28 }}>
          <Flex 
            direction={{ base: 'column', md: 'row' }}
            align="center"
            justify="space-between"
            gap={10}
          >
            {/* Left side content */}
            <Stack spacing={6} maxW="640px" px={{ base: 4, md: 8 }}>
              <Heading
                fontFamily="gt-super, Georgia, serif"
                fontSize={{ base: '4xl', md: '6xl', lg: '7xl' }}
                fontWeight="400"
                color="gray.900"
                lineHeight="1.1"
                letterSpacing="-0.05em"
              >
                Human stories & ideas
              </Heading>
              <Text
                fontSize={{ base: 'lg', md: 'xl' }}
                color="gray.600"
                maxW="400px"
                lineHeight="tall"
              >
                A place to read, write, and deepen your understanding
              </Text>
              <Button
                as={RouterLink}
                to={user ? "/blog" : "/register"}
                bg="black"
                color="white"
                rounded="full"
                px={8}
                size="lg"
                fontSize="md"
                fontWeight="normal"
                _hover={{
                  bg: 'gray.800',
                }}
                width="fit-content"
              >
                {user ? "Continue reading" : "Start reading"}
              </Button>
            </Stack>

            {/* Right side illustration */}
            <Box 
              position="relative" 
              width={{ base: "full", md: "50%" }}
              height={{ base: "300px", md: "500px" }}
              display={{ base: 'none', md: 'block' }}
            >
              <Box
                position="absolute"
                right="-100px"
                top="50%"
                transform="translateY(-50%)"
                width="600px"
                height="600px"
              >
                <Box
                  position="absolute"
                  top="50px"
                  right="100px"
                  width="150px"
                  height="150px"
                  bg="black"
                  borderRadius="full"
                  opacity="0.8"
                />
                <Box
                  position="absolute"
                  top="200px"
                  right="200px"
                  width="100px"
                  height="100px"
                  bg="black"
                  transform="rotate(45deg)"
                  opacity="0.6"
                />
                <Box
                  position="absolute"
                  top="0"
                  right="300px"
                  width="80px"
                  height="80px"
                  bg="black"
                  borderRadius="full"
                  opacity="0.4"
                />
                {/* Add some decorative dots */}
                {[...Array(6)].map((_, i) => (
                  <Box
                    key={i}
                    position="absolute"
                    top={`${Math.random() * 400}px`}
                    right={`${Math.random() * 400}px`}
                    width="4px"
                    height="4px"
                    bg="#1a8917"
                    borderRadius="full"
                    opacity="0.3"
                  />
                ))}
              </Box>
            </Box>
          </Flex>
        </Container>
      </Box>

      {/* Trending Section */}
      <Box py={10} borderBottom="1px" borderColor="gray.200" bg="white">
        <Container maxW="container.md">
          <HStack spacing={2} mb={6}>
            <Icon as={FaBookmark} w={4} h={4} color="gray.900" />
            <Text fontWeight="bold" color="gray.900">
              Trending on Horizon
            </Text>
          </HStack>
          
          {isLoading ? (
            <Text>Loading trending posts...</Text>
          ) : blogPosts.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              {blogPosts.slice(0, 2).map((post, index) => (
                <HStack key={post.id} align="start" spacing={4}>
                  <Text
                    fontSize="32px"
                    fontWeight="bold"
                    color="gray.200"
                    lineHeight="1"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </Text>
                  <Stack spacing={2}>
                    <HStack spacing={2}>
                      <Avatar src={post.author.avatar || DEFAULT_AVATAR} size="xs" />
                      <Text fontSize="sm">{post.author.username}</Text>
                    </HStack>
                    <Heading
                      as={RouterLink}
                      to={`/blog/${post.id}`}
                      fontSize="16px"
                      fontWeight="bold"
                      color="gray.900"
                      _hover={{ color: "gray.700" }}
                    >
                      {post.title}
                    </Heading>
                    <HStack spacing={2} color="gray.500" fontSize="sm">
                      <Text>{new Date(post.createdAt).toLocaleDateString()}</Text>
                      <Text>·</Text>
                      <Text>{post.readingTime || 1} min read</Text>
                    </HStack>
                  </Stack>
                </HStack>
              ))}
            </SimpleGrid>
          ) : (
            <Text>No trending posts available. Start writing to see your posts here!</Text>
          )}
        </Container>
      </Box>

      {/* Main Content */}
      <Box bg="white">
        <Container maxW="container.md" py={10}>
          {isLoading ? (
            <Text>Loading blog posts...</Text>
          ) : blogPosts.length > 0 ? (
            <Stack spacing={0} divider={<Divider />}>
              {blogPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </Stack>
          ) : (
            <Box textAlign="center" py={10}>
              <Heading size="md" mb={4}>No blog posts available yet</Heading>
              <Text mb={6}>Be the first to publish a story!</Text>
              <Button
                as={RouterLink}
                to="/editor"
                colorScheme="teal"
                size="md"
              >
                Start Writing
              </Button>
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 
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

// Dummy data - This will be replaced with API calls
const featuredPosts = [
  {
    id: 1,
    title: 'Getting Started with React and TypeScript',
    excerpt: 'Learn how to set up a new React project with TypeScript and start building modern web applications.',
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60',
    date: '2024-03-01',
    author: {
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60',
    },
    readTime: '5 min read',
    category: 'TypeScript',
  },
  {
    id: 2,
    title: 'Building Responsive Layouts with Chakra UI',
    excerpt: 'Discover how to create beautiful and responsive user interfaces using Chakra UI components.',
    imageUrl: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&auto=format&fit=crop&q=60',
    date: '2024-02-28',
    author: {
      name: 'Mike Wilson',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60',
    },
    readTime: '7 min read',
    category: 'Design',
  },
  {
    id: 3,
    title: 'State Management in React Applications',
    excerpt: 'Explore different state management solutions for React applications and when to use them.',
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60',
    date: '2024-02-27',
    author: {
      name: 'Alex Kumar',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60',
    },
    readTime: '6 min read',
    category: 'React',
  },
];

const BlogCard = ({ post }: { post: typeof featuredPosts[0] }) => {
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
            <Avatar src={post.author.avatar} size="xs" />
            <Text fontSize="sm" color="gray.700">{post.author.name}</Text>
            <Text fontSize="sm" color="gray.500">·</Text>
            <Text fontSize="sm" color="gray.500">{post.date}</Text>
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
            {post.excerpt}
          </Text>

          <HStack spacing={4} mt={2}>
            <Text
              px={3}
              py={1}
              bg="gray.100"
              color="gray.700"
              fontSize="sm"
              rounded="full"
            >
              {post.category}
            </Text>
            <HStack spacing={1} color="gray.500">
              <Icon as={FaClock} w={3} h={3} />
              <Text fontSize="sm">{post.readTime}</Text>
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
            src={post.imageUrl}
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
                to="/register"
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
                Start reading
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
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
            {featuredPosts.slice(0, 2).map((post, index) => (
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
                    <Avatar src={post.author.avatar} size="xs" />
                    <Text fontSize="sm">{post.author.name}</Text>
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
                    <Text>{post.date}</Text>
                    <Text>·</Text>
                    <Text>{post.readTime}</Text>
                  </HStack>
                </Stack>
              </HStack>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Main Content */}
      <Box bg="white">
        <Container maxW="container.md" py={10}>
          <Stack spacing={0} divider={<Divider />}>
            {featuredPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 
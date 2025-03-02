import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Avatar,
  SimpleGrid,
  Button,
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { username } = useParams();
  const { user } = useAuth();

  // Temporary mock data for user's blogs
  const userBlogs = [
    {
      id: 1,
      title: 'Getting Started with React',
      excerpt: 'Learn the basics of React and start building modern web applications.',
      date: '2024-03-01',
    },
    {
      id: 2,
      title: 'Understanding TypeScript',
      excerpt: 'A comprehensive guide to TypeScript and its features.',
      date: '2024-02-28',
    },
  ];

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Avatar
            size="2xl"
            src={user?.avatar}
            name={username}
            mb={4}
          />
          <Heading size="lg">{username}</Heading>
          <Text color="gray.600" mt={2}>
            Passionate developer sharing insights about web development
          </Text>
        </Box>

        <Box>
          <Heading size="md" mb={4}>My Articles</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {userBlogs.map(blog => (
              <Box
                key={blog.id}
                p={6}
                bg="white"
                shadow="md"
                rounded="lg"
              >
                <Text fontSize="sm" color="gray.500" mb={2}>
                  {blog.date}
                </Text>
                <Heading size="md" mb={2}>
                  {blog.title}
                </Heading>
                <Text color="gray.600" mb={4}>
                  {blog.excerpt}
                </Text>
                <Button
                  variant="outline"
                  color="black"
                  _hover={{ bg: 'gray.50' }}
                >
                  Read more
                </Button>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </VStack>
    </Container>
  );
};

export default Profile; 
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
import { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserPosts } from '../services/blogStorage';
import { BlogPost } from '../types/blog';

const Profile = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const [userBlogs, setUserBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (username) {
      // Load the user's blog posts
      const posts = getUserPosts(username);
      setUserBlogs(posts);
      setLoading(false);
    }
  }, [username]);

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
          {loading ? (
            <Text textAlign="center">Loading articles...</Text>
          ) : userBlogs.length === 0 ? (
            <Text textAlign="center">No articles published yet.</Text>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {userBlogs.map((blog) => (
                <Box
                  key={blog.id}
                  p={6}
                  bg="white"
                  shadow="md"
                  rounded="lg"
                >
                  <Text fontSize="sm" color="gray.500" mb={2}>
                    {formatDate(blog.createdAt)}
                  </Text>
                  <Heading size="md" mb={2}>
                    {blog.title}
                  </Heading>
                  <Text color="gray.600" mb={4}>
                    {blog.subtitle || 'No description available'}
                  </Text>
                  <Button
                    variant="outline"
                    color="black"
                    _hover={{ bg: 'gray.50' }}
                    as={RouterLink}
                    to={`/blog/${blog.id}`}
                  >
                    Read more
                  </Button>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </Box>
      </VStack>
    </Container>
  );
};

export default Profile; 
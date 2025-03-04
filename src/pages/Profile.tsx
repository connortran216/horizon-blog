import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Avatar,
  SimpleGrid,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserPosts, deleteBlogPost } from '../services/blogStorage';
import { BlogPost } from '../types/blog';
import { FiMoreVertical } from 'react-icons/fi';

const Profile = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
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

  const handleDelete = (blogId: string) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      deleteBlogPost(blogId);
      // Refresh the blogs list
      const posts = getUserPosts(username || '');
      setUserBlogs(posts);
    }
  };

  const handleEdit = (blogId: string) => {
    navigate(`/blog/edit/${blogId}`);
  };

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Separate published and draft blogs
  const publishedBlogs = userBlogs.filter(blog => blog.status === 'published');
  const draftBlogs = userBlogs.filter(blog => blog.status === 'draft');

  const BlogGrid = ({ blogs }: { blogs: BlogPost[] }) => (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
      {blogs.map((blog) => (
        <Box
          key={blog.id}
          p={6}
          bg="white"
          shadow="md"
          rounded="lg"
          position="relative"
        >
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FiMoreVertical />}
              variant="ghost"
              position="absolute"
              top={2}
              right={2}
              aria-label="Options"
            />
            <MenuList>
              <MenuItem onClick={() => handleEdit(blog.id)}>Edit Blog</MenuItem>
              <MenuItem onClick={() => handleDelete(blog.id)} color="red.500">Delete Blog</MenuItem>
            </MenuList>
          </Menu>
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
  );

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
            <Tabs>
              <TabList>
                <Tab>Published Blogs</Tab>
                <Tab>Draft Blogs</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  {publishedBlogs.length === 0 ? (
                    <Text textAlign="center">No published articles yet.</Text>
                  ) : (
                    <BlogGrid blogs={publishedBlogs} />
                  )}
                </TabPanel>
                <TabPanel>
                  {draftBlogs.length === 0 ? (
                    <Text textAlign="center">No draft articles.</Text>
                  ) : (
                    <BlogGrid blogs={draftBlogs} />
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          )}
        </Box>
      </VStack>
    </Container>
  );
};

export default Profile; 
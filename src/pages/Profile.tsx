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
  useColorModeValue,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../core/services/storage.service';
import { FiMoreVertical } from 'react-icons/fi';

// Local BlogPost type that matches the old format
interface BlogPost {
  id: string;
  title: string;
  subtitle?: string;
  createdAt: string;
  status: string;
}

const Profile = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [publishedBlogs, setPublishedBlogs] = useState<BlogPost[]>([]);
  const [draftBlogs, setDraftBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load the current user's posts using /users/me/posts endpoint
    const loadUserPosts = async () => {
      try {
        // Fetch published posts
        const publishedResult = await storageService.getCurrentUserPosts('published');
        if (publishedResult.success && publishedResult.data) {
          const mappedPublished = publishedResult.data.map((post: any) => ({
            id: String(post.id),
            title: post.title,
            subtitle: post.subtitle || post.excerpt,
            createdAt: post.createdAt || post.created_at,
            status: post.status
          }));
          setPublishedBlogs(mappedPublished);
        }

        // Fetch draft posts
        const draftsResult = await storageService.getCurrentUserPosts('draft');
        if (draftsResult.success && draftsResult.data) {
          const mappedDrafts = draftsResult.data.map((post: any) => ({
            id: String(post.id),
            title: post.title,
            subtitle: post.subtitle || post.excerpt,
            createdAt: post.createdAt || post.created_at,
            status: post.status
          }));
          setDraftBlogs(mappedDrafts);
        }
      } catch (error) {
        console.error('Error loading user posts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserPosts();
  }, []);

  const handleDelete = async (blogId: string) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        const result = await storageService.deleteBlogPost(blogId);

        if (result.success) {
          // Refresh the blogs lists
          const publishedResult = await storageService.getCurrentUserPosts('published');
          if (publishedResult.success && publishedResult.data) {
            const mappedPublished = publishedResult.data.map((post: any) => ({
              id: String(post.id),
              title: post.title,
              subtitle: post.subtitle || post.excerpt,
              createdAt: post.createdAt || post.created_at,
              status: post.status
            }));
            setPublishedBlogs(mappedPublished);
          }

          const draftsResult = await storageService.getCurrentUserPosts('draft');
          if (draftsResult.success && draftsResult.data) {
            const mappedDrafts = draftsResult.data.map((post: any) => ({
              id: String(post.id),
              title: post.title,
              subtitle: post.subtitle || post.excerpt,
              createdAt: post.createdAt || post.created_at,
              status: post.status
            }));
            setDraftBlogs(mappedDrafts);
          }
        }
      } catch (error) {
        console.error('Error deleting blog post:', error);
      }
    }
  };

  const handleEdit = (blogId: string) => {
    // Navigate with state to indicate authorized edit from profile
    navigate(`/blog-editor?id=${blogId}`, {
      state: { fromProfile: true, authorizedEdit: true }
    });
  };

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const BlogGrid = ({ blogs }: { blogs: BlogPost[] }) => {
    const cardBg = useColorModeValue('white', 'bg.secondary');
    const dateMeta = useColorModeValue('gray.500', 'text.tertiary');
    const bodyText = useColorModeValue('gray.600', 'text.secondary');
    const buttonColor = useColorModeValue('black', 'accent.primary');
    const buttonHoverBg = useColorModeValue('gray.50', 'bg.tertiary');

    return (
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {blogs.map((blog) => (
          <Box
            key={blog.id}
            p={6}
            bg={cardBg}
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
            <Text fontSize="sm" color={dateMeta} mb={2}>
              {formatDate(blog.createdAt)}
            </Text>
            <Heading size="md" mb={2}>
              {blog.title}
            </Heading>
            <Text color={bodyText} mb={4}>
              {blog.subtitle || 'No description available'}
            </Text>
            <Button
              variant="outline"
              color={buttonColor}
              _hover={{ bg: buttonHoverBg }}
              as={RouterLink}
              to={`/profile/${username}/blog/${blog.id}`}
            >
              Read more
            </Button>
          </Box>
        ))}
      </SimpleGrid>
    );
  };

  const profileText = useColorModeValue('gray.600', 'text.secondary');

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
          <Text color={profileText} mt={2}>
            Passionate developer sharing insights about web development
          </Text>
        </Box>

        <Box>
          <Heading size="md" mb={4}>My Articles</Heading>
          {loading ? (
            <Text textAlign="center">Loading articles...</Text>
          ) : publishedBlogs.length === 0 && draftBlogs.length === 0 ? (
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

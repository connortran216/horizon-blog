import { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  useColorModeValue,
  Stack,
  Container,
  Avatar,
  useToast,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { saveBlogPost } from '../../services/blogStorage';

// Use a simpler definition for editor content that matches the Lexical editor format
type EditorContent = any; // Use any for flexibility

// Declare global interface for window object
declare global {
  interface Window {
    editorState?: {
      title: string;
      content: EditorContent;
      handlePublish: () => Promise<boolean>;
    };
  }
}

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
}

const NavLink = ({ to, children }: NavLinkProps) => (
  <RouterLink to={to}>
    <Button variant="ghost" px={2} py={1} rounded="md">
      {children}
    </Button>
  </RouterLink>
);

const Links = [
  { name: 'Home', path: '/' },
  { name: 'Blog', path: '/blog' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

const Navbar = () => {
  const { isOpen, onToggle } = useDisclosure();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditorPage = location.pathname === '/blog-editor';
  const toast = useToast();
  const [editorState, setEditorState] = useState<{
    editor?: any;
    title: string;
    content: EditorContent | null;
    handlePublish?: () => Promise<boolean>;
  }>({ title: '', content: null });

  // Use effect to access the editor state
  useEffect(() => {
    // Access editor state from window object if available
    const checkEditorState = () => {
      if (window.editorState) {
        setEditorState(window.editorState);
      }
    };
    
    // Check immediately and then at intervals
    checkEditorState();
    const interval = setInterval(checkEditorState, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handlePublish = async () => {
    // If we have access to the editor's handlePublish function, use it
    if (editorState.handlePublish) {
      console.log("Using editor's handlePublish");
      const success = await editorState.handlePublish();
      if (!success) {
        console.log("Publishing was not successful via editor's handlePublish");
      }
      return;
    }

    console.log("Fallback publishing in Navbar");
    console.log("Title:", editorState.title);
    console.log("Content:", editorState.content);
    
    // Just require title for publishing
    if (!editorState.title?.trim()) {
      toast({
        title: 'Error',
        description: 'Title is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Prepare content for saving
    let contentToSave = editorState.content;
    
    // If we don't have content, create minimal fallback
    if (!contentToSave) {
      // Create a minimal Lexical editor state
      contentToSave = JSON.stringify({
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: "normal",
                  style: "",
                  text: "Empty content",
                  type: "text",
                  version: 1
                }
              ],
              direction: "ltr",
              format: "",
              indent: 0,
              type: "paragraph",
              version: 1
            }
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "root",
          version: 1
        }
      });
    }

    console.log("Content to save:", contentToSave);

    try {
      // Save the blog post using our updated storage service
      const blogPost = {
        title: editorState.title.trim(),
        content: {
          blocks: contentToSave
        },
        author: {
          username: user?.username || 'Anonymous',
          avatar: user?.avatar
        },
        status: 'published' as const,
      };

      const result = await saveBlogPost(blogPost as any);
      const newPost = result;

      toast({
        title: 'Success',
        description: 'Your story has been published.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      navigate(`/blog/${newPost.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to publish your story. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box bg={useColorModeValue('white', 'gray.800')} px={4} boxShadow="sm">
      <Container maxW="container.xl">
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <IconButton
            size="md"
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label="Open Menu"
            display={{ md: 'none' }}
            onClick={onToggle}
          />

          <HStack spacing={8} alignItems="center">
            <Box fontWeight="bold" fontSize="xl">
              <RouterLink to="/">Horizon</RouterLink>
            </Box>
            <HStack as="nav" spacing={4} display={{ base: 'none', md: 'flex' }}>
              {Links.map((link) => (
                <NavLink key={link.path} to={link.path}>
                  {link.name}
                </NavLink>
              ))}
            </HStack>
          </HStack>

          <Flex alignItems="center" gap={4}>
            {user && !isEditorPage && (
              <Button
                as={RouterLink}
                to="/blog-editor"
                leftIcon={<Box as="span" fontSize="xl">✍️</Box>}
                variant="ghost"
                color="black"
              >
                Write
              </Button>
            )}
            {user && isEditorPage && (
              <Button
                onClick={handlePublish}
                colorScheme="green"
                mr={2}
              >
                Publish
              </Button>
            )}
            {user && (
              <Menu>
                <MenuButton>
                  <Avatar size="sm" src={user.avatar} name={user.username} />
                </MenuButton>
                <MenuList>
                  <MenuItem as={RouterLink} to={`/profile/${user.username}`}>
                    Profile
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    Sign out
                  </MenuItem>
                </MenuList>
              </Menu>
            )}
            {!user && (
              <Button
                as={RouterLink}
                to="/login"
                bg="black"
                color="white"
                _hover={{ bg: "gray.800" }}
              >
                Sign in
              </Button>
            )}
          </Flex>
        </Flex>

        {/* Mobile menu */}
        {isOpen && (
          <Box pb={4} display={{ md: 'none' }}>
            <Stack as="nav" spacing={4}>
              {Links.map((link) => (
                <NavLink key={link.path} to={link.path}>
                  {link.name}
                </NavLink>
              ))}
            </Stack>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Navbar;

import { useEffect, useState, useCallback, useRef } from 'react';
import { Box, Container, Input, VStack, useToast, Avatar, HStack, Text, Tag, TagLabel, TagCloseButton, Wrap, WrapItem } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import MilkdownEditor from '../components/editor/MilkdownEditor';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { apiService } from '../core/services/api.service';

// Declare global interface for window object
declare global {
  interface Window {
    editorState?: {
      content_markdown: string;
      title: string;
      handlePublish: () => Promise<boolean>;
    };
  }
}

const AUTO_SAVE_DELAY = 5000; // 5 seconds delay for backend auto-save
const LOCAL_SAVE_DELAY = 1000; // 1 second for localStorage backup

const BlogEditor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const location = useLocation();

  // Parse URL parameters and router state
  const postIdParam = new URLSearchParams(location.search).get('id');
  const routerPost = location.state?.blog;

  // State management
  const [title, setTitle] = useState('');
  const [postId, setPostId] = useState<number | null>(null);
  const [contentMarkdown, setContentMarkdown] = useState('');
  const [contentJSON, setContentJSON] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Refs for auto-save timers and initial content tracking
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const localSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialContentSet = useRef<boolean>(false);
  const editorInitialContent = useRef<string>('');

  // Load post content on mount
  useEffect(() => {
    console.log('🚀 BlogEditor mounted with postIdParam:', postIdParam, 'routerPost:', routerPost?.id);

    const loadPost = async () => {
      setIsLoading(true);
      try {
        let post = routerPost;

        // Load by ID if URL parameter exists and no router state
        if (postIdParam && !post) {
          console.log('🔗 Loading post by ID:', postIdParam);
          const response = await apiService.get<{ data: any }>(`/posts/${postIdParam}`);
          post = response.data;

          if (!post) {
            console.error('❌ Post not found for ID:', postIdParam);
            toast({
              title: 'Error',
              description: 'Post not found',
              status: 'error',
              duration: 3000,
              isClosable: true,
            });
            setIsLoading(false);
            return;
          }
        }

        // Initialize state from loaded post
        if (post) {
          console.log('📋 Loading post:', post.title, 'with content length:', post.content_markdown?.length || 0);
          setTitle(post.title || '');
          setPostId(post.id);
          setContentMarkdown(post.content_markdown || '');
          setContentJSON(post.content_json || '');
          // Load tags if available
          if (post.tags && Array.isArray(post.tags)) {
            const tagNames = post.tags.map((tag: any) => typeof tag === 'string' ? tag : tag.name);
            setTags(tagNames);
          }
          // Set initial content for editor (only once)
          editorInitialContent.current = post.content_markdown || '';
          console.log('✅ Post loaded successfully, initialContentSet:', true);
        } else {
          // New post
          console.log('🆕 Initializing new post');
          editorInitialContent.current = '';
        }
        initialContentSet.current = true;
      } catch (error) {
        console.error('❌ Error loading post:', error);
        toast({
          title: 'Error',
          description: 'Failed to load post',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        console.log('✅ Loading complete, isLoading set to false');
        setIsLoading(false);
      }
    };

    loadPost();
  }, [postIdParam, routerPost, toast]);

  // Share editor state with Navbar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.editorState = {
        content_markdown: contentMarkdown,
        title: title,
        handlePublish: handlePublish
      };
    }

    return () => {
      // Clean up global state
      if (typeof window !== 'undefined') {
        window.editorState = undefined;
      }
    };
  }, [contentMarkdown, contentJSON, title]);

  // Local storage backup (1 second debounce)
  const saveToLocalStorage = useCallback(() => {
    if (!title.trim() || !contentMarkdown) return;

    try {
      localStorage.setItem('blog_draft_backup', JSON.stringify({
        title,
        contentMarkdown,
        contentJSON,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [title, contentMarkdown, contentJSON]);

  // Backend auto-save (5 second debounce)
  const autoSave = useCallback(async () => {
    if (!title.trim() || !contentMarkdown) return;

    setSaveStatus('saving');
    setIsSaving(true);

    try {
      const postData = {
        title: title.trim(),
        content_markdown: contentMarkdown,
        content_json: contentJSON || '{}',
        status: 'draft',
        tag_names: tags
      };

      let response;
      if (postId) {
        // Update existing post
        response = await apiService.patch<{ data: any }>(`/posts/${postId}`, postData);
      } else {
        // Create new post
        response = await apiService.post<{ data: any }>('/posts', postData);
        if (response.data?.id) {
          setPostId(response.data.id);
        }
      }

      setSaveStatus('saved');
      console.log('✅ Auto-saved to backend');
    } catch (error) {
      console.error('Error auto-saving to backend:', error);
      setSaveStatus('error');
      // Don't show toast for auto-save errors to avoid interrupting user
    } finally {
      setIsSaving(false);
    }
  }, [title, contentMarkdown, contentJSON, postId, tags]);

  // Set up auto-save timers
  useEffect(() => {
    // Clear existing timers
    if (localSaveTimer.current) {
      clearTimeout(localSaveTimer.current);
    }
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    // Set new timers
    localSaveTimer.current = setTimeout(saveToLocalStorage, LOCAL_SAVE_DELAY);
    autoSaveTimer.current = setTimeout(autoSave, AUTO_SAVE_DELAY);

    return () => {
      if (localSaveTimer.current) {
        clearTimeout(localSaveTimer.current);
      }
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [saveToLocalStorage, autoSave]);

  // Handle editor content changes - memoized to prevent unnecessary re-renders
  const handleEditorChange = useCallback((markdown: string, prosemirrorJSON: string) => {
    setContentMarkdown(markdown);

    // Validate and store ProseMirror JSON
    try {
      // Validate that it's proper JSON
      const parsed = JSON.parse(prosemirrorJSON);

      // Validate it has the expected ProseMirror structure
      if (parsed && typeof parsed === 'object') {
        setContentJSON(prosemirrorJSON);
      } else {
        console.warn('⚠️ Invalid ProseMirror JSON structure, using fallback');
        setContentJSON('{}');
      }
    } catch (error) {
      console.error('❌ Failed to parse ProseMirror JSON:', error);
      setContentJSON('{}');
    }
  }, []); // Empty deps - this function never needs to change

  // Handle publishing a post
  const handlePublish = async () => {
    if (!title.trim()) {
      toast({
        title: 'Error',
        description: 'Please add a title for your blog post',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (!contentMarkdown.trim()) {
      toast({
        title: 'Error',
        description: 'Please add content to your blog post',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    try {
      const postData = {
        title: title.trim(),
        content_markdown: contentMarkdown,
        content_json: contentJSON || '{}',
        status: 'published',
        tag_names: tags
      };

      let response;
      if (postId) {
        // Update existing post
        response = await apiService.put<{ data: any }>(`/posts/${postId}`, postData);
      } else {
        // Create new post
        response = await apiService.post<{ data: any }>('/posts', postData);
      }

      const savedPost = response.data;

      if (!savedPost) {
        throw new Error('Failed to save blog post');
      }

      // Clear localStorage backup
      localStorage.removeItem('blog_draft_backup');

      // Display success message
      toast({
        title: 'Success',
        description: `Blog post ${postId ? 'updated' : 'published'} successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Navigate to the blog post
      navigate(`/blog/${savedPost.id}`);
      return true;
    } catch (error: any) {
      console.error('Error publishing blog post:', error);

      // Display error message
      toast({
        title: 'Error',
        description: error.message || `Failed to ${postId ? 'update' : 'publish'} blog post`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });

      return false;
    }
  };

  // Save status text
  const getSaveStatusText = () => {
    if (isSaving || saveStatus === 'saving') return 'Saving...';
    if (saveStatus === 'error') return 'Save failed';
    if (postId) return 'Draft saved';
    return 'Draft';
  };

  // Handle tag addition
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  // Handle tag removal
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <Container maxW="container.xl" p={5}>
      <VStack spacing={6} align="stretch">
        {/* Author Info and Save Status */}
        <HStack spacing={3} justify="space-between">
          <HStack spacing={3}>
            <Avatar size="sm" src={user?.avatar} name={user?.username} />
            <Text fontSize="sm" color="gray.700">
              {user?.username || 'Anonymous'}
            </Text>
          </HStack>
          <Text
            fontSize="sm"
            color={saveStatus === 'error' ? 'red.500' : saveStatus === 'saving' ? 'blue.500' : 'green.500'}
          >
            {getSaveStatusText()}
          </Text>
        </HStack>

        {/* Title Input */}
        <Input
          placeholder="Blog Title"
          size="lg"
          fontSize="2xl"
          fontWeight="bold"
          border="none"
          _focus={{ border: 'none', boxShadow: 'none' }}
          _hover={{ border: 'none' }}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          isDisabled={isLoading}
        />

        {/* Tags Input */}
        <Box>
          <Input
            placeholder="Add tags (press Enter)"
            size="sm"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            isDisabled={isLoading}
          />
          <Wrap mt={2} spacing={2}>
            {tags.map((tag) => (
              <WrapItem key={tag}>
                <Tag size="md" colorScheme="blue" borderRadius="full">
                  <TagLabel>{tag}</TagLabel>
                  <TagCloseButton onClick={() => handleRemoveTag(tag)} />
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        </Box>

        {/* Milkdown Editor */}
        {!isLoading && initialContentSet.current && (
          <ErrorBoundary>
            <MilkdownEditor
              initialContent={editorInitialContent.current}
              onChange={handleEditorChange}
              placeholder="Start writing your blog post..."
            />
          </ErrorBoundary>
        )}

        {isLoading && (
          <Box
            border="1px"
            borderColor="gray.200"
            borderRadius="md"
            minH="500px"
            bg="white"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text color="gray.500">Loading editor...</Text>
          </Box>
        )}
      </VStack>
    </Container>
  );
};

export default BlogEditor;

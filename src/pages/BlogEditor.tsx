import { useEffect, useState } from 'react';
import { Box, Container, Input, VStack, useToast, Avatar, HStack, Text } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveBlogPost, saveDraft, updateBlogPost, deleteBlogPost, deleteDraft, generateId } from '../services/blogStorage';
import { BlogPost } from '../types/blog';
import { css, Global } from '@emotion/react';
// Lexical Editor imports
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table';
import { ListNode, ListItemNode } from '@lexical/list';
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS } from '@lexical/markdown';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import ToolbarPlugin from '../components/editor/ToolbarPlugin';

// Declare global interface for window object
declare global {
  interface Window {
    editorState?: {
      content: any;
      title: string;
      handlePublish: () => boolean;
    };
  }
}

// Define the Lexical editor theme
const theme = {
  // Theme styling goes here
  paragraph: 'editor-paragraph',
  heading: {
    h1: 'editor-heading-h1',
    h2: 'editor-heading-h2',
    h3: 'editor-heading-h3',
  },
  list: {
    ul: 'editor-list-ul',
    ol: 'editor-list-ol',
    listitem: 'editor-listitem',
  },
  quote: 'editor-quote',
  link: 'editor-link',
  text: {
    bold: 'editor-bold',
    italic: 'editor-italic',
    underline: 'editor-underline',
    strikethrough: 'editor-strikethrough',
  }
};

// Editor configuration
const editorConfig = {
  namespace: 'Blog Editor',
  theme,
  onError(error: Error) {
    console.error('Lexical Editor Error:', error);
  },
  nodes: [
    HeadingNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    CodeNode,
    CodeHighlightNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    AutoLinkNode,
    LinkNode
  ]
};

// Create a function to convert Lexical state to serializable format for storage
function serializeLexicalState(editorState: any) {
  return JSON.stringify(editorState);
}

// Create a wrapper component to bypass TypeScript type checking
// This is a workaround for the ErrorBoundary type issue
const RichTextPluginWrapper = (props: any) => {
  // @ts-ignore - Ignore the TypeScript error for ErrorBoundary
  return <RichTextPlugin {...props} />;
};

const BlogEditor = () => {
  const [title, setTitle] = useState('');
  const [editorState, setEditorState] = useState<any>(null);
  const [draftId, setDraftId] = useState<string>('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const location = useLocation();
  const blogToEdit = location.state?.blog;

  useEffect(() => {
    // If we have a blog to edit, set the initial state
    if (blogToEdit) {
      setTitle(blogToEdit.title);
      // Set draft ID only for drafts
      if (blogToEdit.status === 'draft') {
        setDraftId(blogToEdit.id);
      }
      // If the blocks are stored as a string, parse them
      if (typeof blogToEdit.blocks === 'string') {
        try {
          setEditorState(JSON.parse(blogToEdit.blocks));
        } catch (e) {
          console.error('Failed to parse blog content:', e);
          toast({
            title: 'Error',
            description: 'Failed to load blog content',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      } else {
        setEditorState(blogToEdit.blocks);
      }
    } else {
      // Generate a new draft ID for new posts
      setDraftId(generateId());
    }
  }, [blogToEdit]);

  useEffect(() => {
    // Share editor state with Navbar
    if (typeof window !== 'undefined') {
      window.editorState = {
        content: editorState,
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
  }, [editorState, title]);

  // Handle editor content changes
  const handleEditorChange = (state: any) => {
    setEditorState(state);
    
    // Auto-save as draft only for new posts or existing drafts
    if (title.trim() && blogToEdit?.status !== 'published') {
      const draftPost: BlogPost = {
        id: draftId,
        title,
        blocks: state,
        author: {
          username: user?.username || 'Anonymous',
          avatar: user?.avatar
        },
        createdAt: blogToEdit?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'draft' as const,
        readingTime: 1
      };

      // Save to drafts storage
      saveDraft(draftPost);
    }
  };

  // Handle publishing a post
  const handlePublish = () => {
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

    try {
      // Create or update the blog post
      const blogPost: BlogPost = {
        id: blogToEdit?.status === 'published' ? blogToEdit.id : draftId,
        title: title.trim(),
        blocks: editorState,
        author: {
          username: user?.username || 'Anonymous',
          avatar: user?.avatar
        },
        createdAt: blogToEdit?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'published' as const,
        readingTime: 1
      };

      // Save the post
      const savedPost = saveBlogPost(blogPost);
      
      if (!savedPost) {
        throw new Error('Failed to save blog post');
      }

      // Only attempt to delete draft if draftId exists
      if (draftId) {
        try {
          deleteDraft(draftId);
        } catch (error) {
          console.error('Error deleting draft:', error);
          // Continue execution even if draft deletion fails
        }
      }
      
      // Display success message
      toast({
        title: 'Success',
        description: `Blog post ${blogToEdit ? 'updated' : 'published'} successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Navigate to the blog post
      navigate(`/blog/${savedPost.id}`);
      return true;
    } catch (error) {
      console.error('Error publishing blog post:', error);
      
      // Display error message
      toast({
        title: 'Error',
        description: `Failed to ${blogToEdit ? 'update' : 'publish'} blog post`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      
      return false;
    }
  };

  // Component to capture editor changes
  function OnChangeComponent() {
    const [editor] = useLexicalComposerContext();
    
    useEffect(() => {
      // Subscribe to editor changes
      return editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          // Serialize the editor state to JSON
          const serializedState = serializeLexicalState(editorState);
          handleEditorChange(serializedState);
        });
      });
    }, [editor]);
    
    return null;
  }

  return (
    <Container maxW="container.xl" p={5}>
      <Global
        styles={css`
          .editor-container {
            border: 1px solid #ccc;
            border-radius: 4px;
            margin-bottom: 20px;
            position: relative;
          }
          
          .editor-input {
            min-height: 500px;
            resize: none;
            font-size: 16px;
            caret-color: rgb(5, 5, 5);
            padding: 20px;
            margin-top: 40px;
            position: relative;
            tab-size: 1;
            outline: 0;
            width: 100%;
            line-height: 1.5;
          }
          
          .editor-placeholder {
            color: #999;
            overflow: hidden;
            position: absolute;
            text-overflow: ellipsis;
            top: 60px;
            left: 20px;
            font-size: 16px;
            user-select: none;
            display: inline-block;
            pointer-events: none;
            z-index: 0;
            line-height: 1.5;
          }
          
          .editor-paragraph {
            margin: 0 0 15px 0;
            line-height: 1.5;
          }
          
          .editor-heading-h1 {
            font-size: 24px;
            font-weight: bold;
            margin: 20px 0 10px 0;
          }
          
          .editor-heading-h2 {
            font-size: 20px;
            font-weight: bold;
            margin: 15px 0 10px 0;
          }
          
          .editor-heading-h3 {
            font-size: 18px;
            font-weight: bold;
            margin: 10px 0 5px 0;
          }
          
          .editor-quote {
            border-left: 4px solid #ccc;
            padding-left: 16px;
            margin: 15px 0;
            color: #555;
          }
          
          .editor-list-ol {
            padding-left: 20px;
            margin: 15px 0;
          }
          
          .editor-list-ul {
            padding-left: 20px;
            margin: 15px 0;
            list-style-type: disc;
          }
          
          .editor-listitem {
            margin: 6px 0;
          }
          
          .editor-link {
            color: rgb(33, 111, 219);
            text-decoration: underline;
            cursor: pointer;
          }

          .editor-underline {
            text-decoration: underline;
          }

          .editor-strikethrough {
            text-decoration: line-through;
          }

          .editor-bold {
            font-weight: bold;
          }

          .editor-italic {
            font-style: italic;
          }
        `}
      />
      <VStack spacing={6} align="stretch">
        {/* Author Info */}
        <HStack spacing={3}>
          <Avatar size="sm" src={user?.avatar} name={user?.username} />
          <Text fontSize="sm" color="gray.700">
            {user?.username || 'Anonymous'} • Draft
          </Text>
        </HStack>

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
        />
        
        <Box 
          border="1px"
          borderColor="gray.200"
          borderRadius="md"
          minH="500px"
          bg="white"
        >
          <LexicalComposer initialConfig={editorConfig}>
            <div className="editor-container">
              <ToolbarPlugin />
              <RichTextPluginWrapper
                contentEditable={<ContentEditable className="editor-input" />}
                placeholder={<div className="editor-placeholder">Tell your story...</div>}
              />
              <HistoryPlugin />
              <AutoFocusPlugin />
              <ListPlugin />
              <LinkPlugin />
              <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
              <OnChangeComponent />
            </div>
          </LexicalComposer>
        </Box>
      </VStack>
    </Container>
  );
};

export default BlogEditor; 
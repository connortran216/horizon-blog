import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Avatar,
  Button,
  Divider,
  useToast,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { getBlogPostById } from '../services/blogStorage';
import { BlogPost } from '../types/blog';

const BlogDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        try {
          const foundPost = await getBlogPostById(id);

          if (foundPost) {
            setPost(foundPost);
          } else {
            toast({
              title: 'Post not found',
              description: 'The blog post you are looking for does not exist.',
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
            navigate('/blog');
          }
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to load blog post.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          navigate('/blog');
        } finally {
          setLoading(false);
        }
      };

      fetchPost();
    }
  }, [id, navigate, toast]);

  // Helper function to get the Lexical editor content
  const getLexicalContent = (post: BlogPost): any => {
    try {
      // Check if post has the new content structure
      if ((post as any).content?.blocks) {
        const contentBlocks = (post as any).content.blocks;
        if (typeof contentBlocks === 'string') {
          return JSON.parse(contentBlocks);
        }
        return contentBlocks;
      }

      // Fallback to old structure for backward compatibility
      const blocks = (post as any).blocks;
      console.log('Original post blocks data:', blocks);

      // If it's a string, try to parse it
      if (typeof blocks === 'string') {
        try {
          return JSON.parse(blocks);
        } catch (e) {
          console.error('Failed to parse blocks string:', e);
          return null;
        }
      }

      // If it's already an object, return it
      if (blocks && typeof blocks === 'object') {
        return blocks;
      }

      console.log('Could not extract Lexical content from post data:', blocks);
      return null;
    } catch (error) {
      console.error('Error parsing blog content:', error);
      return null;
    }
  };

  // Update the renderContent function to handle the Lexical content structure
  const renderContent = () => {
    if (!post) return <Text>No content available</Text>;
    
    console.log("Rendering post:", post);
    
    // Try to get Lexical content
    const lexicalContent = getLexicalContent(post);
    
    if (!lexicalContent) {
      return <Text>No content available</Text>;
    }
    
    // For Lexical content, we start with the root node
    if (lexicalContent.root) {
      return renderLexicalNode(lexicalContent.root, 0);
    }
    
    // Fallback to basic rendering
    return <Text>Content format not recognized</Text>;
  };

  // Fix the renderLexicalNode function - simpler approach that just adds keys
  const renderLexicalNode = (node: any, index: number): JSX.Element | null => {
    if (!node) return null;
    
    // Text node
    if (node.type === 'text') {
      let textContent = node.text;
      
      // Apply text formatting
      if (node.format & 1) { // Bold
        textContent = <strong key={`text-${index}`}>{textContent}</strong>;
      }
      if (node.format & 2) { // Italic
        textContent = <em key={`text-${index}`}>{textContent}</em>;
      }
      if (node.format & 4) { // Underline
        textContent = <u key={`text-${index}`}>{textContent}</u>;
      }
      if (node.format & 8) { // Strikethrough
        textContent = <s key={`text-${index}`}>{textContent}</s>;
      }
      
      return <>{textContent}</>;
    }
    
    // Paragraph
    if (node.type === 'paragraph') {
      return (
        <Text key={`p-${index}`} my={2}>
          {node.children?.map((child: any, childIndex: number) => 
            <span key={`p-child-${childIndex}`}>
              {renderLexicalNode(child, childIndex)}
            </span>
          )}
        </Text>
      );
    }
    
    // Add more node types with similar pattern...

    // Root node - just render children
    if (node.type === 'root') {
      return (
        <Box key={`root-${index}`}>
          {node.children?.map((child: any, childIndex: number) => 
            <div key={`root-child-${childIndex}`}>
              {renderLexicalNode(child, childIndex)}
            </div>
          )}
        </Box>
      );
    }
    
    // Handle unknown node types
    console.log(`Unknown node type: ${node.type}`, node);
    return null;
  };

  if (loading) {
    return (
      <Container maxW="container.md" py={10}>
        <Text>Loading...</Text>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container maxW="container.md" py={10}>
        <Text>Post not found</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={10}>
      <Button 
        leftIcon={<ArrowBackIcon />} 
        variant="ghost" 
        mb={6}
        onClick={() => navigate('/blog')}
      >
        Back to Blog
      </Button>
      
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="2xl">{post.title}</Heading>
        
        <HStack spacing={4}>
          <Avatar size="md" name={post.author.username} src={post.author.avatar} />
          <Box>
            <Text fontWeight="bold">{post.author.username}</Text>
            <Text fontSize="sm" color="gray.500">
              Published on {new Date(post.createdAt).toLocaleDateString()}
              {post.createdAt !== post.updatedAt && 
                ` • Updated on ${new Date(post.updatedAt).toLocaleDateString()}`}
            </Text>
          </Box>
        </HStack>
        
        <Text fontSize="lg" color="gray.600">
          {post.readingTime} min read
        </Text>
        
        <Divider my={4} />
        
        {renderContent()}
      </VStack>
    </Container>
  );
};

export default BlogDetail;

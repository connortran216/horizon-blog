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
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css';
import { apiService } from '../core/services/api.service';
import { useAuth } from '../context/AuthContext';
import { parseWikiLinks } from '../components/editor/plugins/wikiLinkPlugin';
import { parseHashtags } from '../components/editor/plugins/hashtagPlugin';

interface BlogPost {
  id: number;
  title: string;
  content_markdown: string;
  content_json: string;
  status: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  user?: {
    name: string;
    email: string;
  };
}

const BlogDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        try {
          const response = await apiService.get<{ data: BlogPost }>(`/posts/${id}`);
          const foundPost = response.data;

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
        } catch (error: any) {
          console.error('Error fetching post:', error);
          toast({
            title: 'Error',
            description: error.message || 'Failed to load blog post.',
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

  // Render individual ProseMirror nodes (kept for backward compatibility)
  const renderProseMirrorNode = (node: any, key: string = '0'): JSX.Element | null => {
    if (!node) return null;

    switch (node.type) {
      case 'doc':
        return (
          <Box key={key}>
            {node.content?.map((child: any, index: number) =>
              renderProseMirrorNode(child, `${key}-${index}`)
            )}
          </Box>
        );

      case 'paragraph':
        return (
          <Text key={key} mb={4}>
            {node.content?.map((child: any, index: number) =>
              renderProseMirrorNode(child, `${key}-${index}`)
            ) || ''}
          </Text>
        );

      case 'heading':
        const level = node.attrs?.level || 1;
        const sizes: any = { 1: 'xl', 2: 'lg', 3: 'md', 4: 'sm', 5: 'sm', 6: 'xs' };
        return (
          <Heading key={key} as={`h${level}` as any} size={sizes[level]} mt={6} mb={3}>
            {node.content?.map((child: any, index: number) =>
              renderProseMirrorNode(child, `${key}-${index}`)
            )}
          </Heading>
        );

      case 'text':
        let textElement: any = node.text;
        if (node.marks) {
          node.marks.forEach((mark: any) => {
            switch (mark.type) {
              case 'bold':
              case 'strong':
                textElement = <strong>{textElement}</strong>;
                break;
              case 'italic':
              case 'em':
                textElement = <em>{textElement}</em>;
                break;
              case 'strike':
                textElement = <s>{textElement}</s>;
                break;
              case 'code':
                textElement = <code style={{ backgroundColor: '#f5f5f5', padding: '2px 4px', borderRadius: '3px' }}>{textElement}</code>;
                break;
              case 'link':
                textElement = <a href={mark.attrs?.href} style={{ color: '#3182ce', textDecoration: 'underline' }}>{textElement}</a>;
                break;
            }
          });
        }
        return <span key={key}>{textElement}</span>;

      case 'bulletList':
      case 'bullet_list':
        return (
          <Box as="ul" key={key} pl={6} mb={4}>
            {node.content?.map((child: any, index: number) =>
              renderProseMirrorNode(child, `${key}-${index}`)
            )}
          </Box>
        );

      case 'orderedList':
      case 'ordered_list':
        return (
          <Box as="ol" key={key} pl={6} mb={4}>
            {node.content?.map((child: any, index: number) =>
              renderProseMirrorNode(child, `${key}-${index}`)
            )}
          </Box>
        );

      case 'listItem':
      case 'list_item':
        return (
          <Box as="li" key={key} mb={2}>
            {node.content?.map((child: any, index: number) =>
              renderProseMirrorNode(child, `${key}-${index}`)
            )}
          </Box>
        );

      case 'blockquote':
        return (
          <Box
            key={key}
            as="blockquote"
            borderLeft="4px solid"
            borderColor="gray.300"
            pl={4}
            py={2}
            mb={4}
            fontStyle="italic"
            color="gray.600"
          >
            {node.content?.map((child: any, index: number) =>
              renderProseMirrorNode(child, `${key}-${index}`)
            )}
          </Box>
        );

      case 'codeBlock':
      case 'code_block':
        const code = node.content?.map((child: any) => child.text).join('\n') || '';
        return (
          <Box
            key={key}
            as="pre"
            bg="gray.900"
            color="white"
            p={4}
            borderRadius="md"
            mb={4}
            overflowX="auto"
          >
            <code>{code}</code>
          </Box>
        );

      case 'hardBreak':
      case 'hard_break':
        return <br key={key} />;

      default:
        console.log('Unknown ProseMirror node type:', node.type);
        return null;
    }
  };

  // Render content with fallback logic
  const renderContent = () => {
    if (!post) return <Text>No content available</Text>;

    // Process markdown with wiki links and hashtags
    let processedMarkdown = post.content_markdown;
    if (processedMarkdown) {
      processedMarkdown = parseWikiLinks(processedMarkdown);
      processedMarkdown = parseHashtags(processedMarkdown);
    }

    // Render markdown with syntax highlighting
    if (processedMarkdown) {
      return (
        <Box
          className="markdown-content"
          sx={{
            '& p': { marginBottom: '1em', lineHeight: '1.7' },
            '& h1': { fontSize: '2em', fontWeight: 'bold', marginTop: '0.5em', marginBottom: '0.5em' },
            '& h2': { fontSize: '1.5em', fontWeight: 'bold', marginTop: '0.5em', marginBottom: '0.5em' },
            '& h3': { fontSize: '1.25em', fontWeight: 'bold', marginTop: '0.5em', marginBottom: '0.5em' },
            '& ul, & ol': { paddingLeft: '2em', marginBottom: '1em' },
            '& li': { marginBottom: '0.5em' },
            '& code': { backgroundColor: 'gray.100', padding: '0.2em 0.4em', borderRadius: '3px', fontSize: '0.9em', fontFamily: 'monospace' },
            '& blockquote': { borderLeft: '4px solid', borderColor: 'gray.300', paddingLeft: '1em', marginBottom: '1em', fontStyle: 'italic', color: 'gray.600' },
            '& a': { color: 'blue.500', textDecoration: 'underline', '&:hover': { color: 'blue.600' } },
            '& a.wiki-link': { color: 'purple.500', textDecoration: 'none', fontWeight: '500', '&:hover': { textDecoration: 'underline' } },
            '& a.hashtag': { color: 'teal.500', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } },
            '& table': { borderCollapse: 'collapse', width: '100%', marginBottom: '1em' },
            '& th, & td': { border: '1px solid', borderColor: 'gray.300', padding: '0.5em' },
            '& th': { backgroundColor: 'gray.100', fontWeight: 'bold' },
            '& img': { maxWidth: '100%', height: 'auto', borderRadius: 'md', marginBottom: '1em' },
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {processedMarkdown}
          </ReactMarkdown>
        </Box>
      );
    }

    return <Text>No content available</Text>;
  };

  // Check if current user is the owner
  const isOwner = user && post && post.user_id === user.id;

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
          <Avatar size="md" name={post.user?.name || 'Anonymous'} />
          <Box>
            <Text fontWeight="bold">{post.user?.name || 'Anonymous'}</Text>
            <Text fontSize="sm" color="gray.500">
              Published on {new Date(post.created_at).toLocaleDateString()}
              {post.created_at !== post.updated_at &&
                ` • Updated on ${new Date(post.updated_at).toLocaleDateString()}`}
            </Text>
          </Box>
        </HStack>

        {isOwner && (
          <HStack>
            <Button
              size="sm"
              colorScheme="blue"
              onClick={() => navigate(`/blog-editor?id=${post.id}`, { state: { blog: post } })}
            >
              Edit Post
            </Button>
          </HStack>
        )}

        <Divider my={4} />

        {renderContent()}
      </VStack>
    </Container>
  );
};

export default BlogDetail;

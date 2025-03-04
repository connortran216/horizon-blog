import { BlogPost } from '../types/blog';

// We'll use localStorage for temporary storage
const STORAGE_KEY = 'blog_posts';
const DRAFTS_KEY = 'blog_drafts';

// Function to generate a unique ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Function to save blog post
export const saveBlogPost = (blogPost: BlogPost): BlogPost => {
  // Ensure the post has an ID
  const postToSave: BlogPost = {
    ...blogPost,
    id: blogPost.id || generateId(),
    updatedAt: new Date().toISOString(),
    readingTime: calculateReadingTime(blogPost.blocks)
  };

  // Get existing posts
  const existingPosts = getBlogPosts();
  
  // Add new post to the beginning of the array
  const updatedPosts = [postToSave, ...existingPosts.filter(post => post.id !== postToSave.id)];
  
  // Save to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));
  
  return postToSave;
};

// Helper function to calculate reading time
const calculateReadingTime = (content: any): number => {
  try {
    let contentString = '';
    
    // Convert content to string for calculation
    if (typeof content === 'string') {
      // Try to parse the string - it might be a JSON-stringified Lexical state
      try {
        const parsed = JSON.parse(content);
        
        // If this is a Lexical state, extract text from nodes
        if (parsed.root && parsed.root.children) {
          contentString = extractTextFromLexicalNodes(parsed.root);
        } else {
          contentString = content;
        }
      } catch (e) {
        // If parsing fails, just use the string as is
        contentString = content;
      }
    } else if (content && typeof content === 'object') {
      // Direct Lexical state object
      if (content.root && content.root.children) {
        contentString = extractTextFromLexicalNodes(content.root);
      } else {
        contentString = JSON.stringify(content);
      }
    }
    
    // Rough estimate: 200 words = 1 min (average reading speed)
    // Assuming average word length of 5 characters plus a space
    const words = contentString.length / 6;
    return Math.ceil(words / 200) || 1;
  } catch (error) {
    console.error("Error calculating reading time:", error);
    return 1; // Default to 1 minute
  }
};

// Helper function to extract text from Lexical nodes
const extractTextFromLexicalNodes = (node: any): string => {
  if (!node) return '';
  
  // If it's a text node, return its text
  if (node.type === 'text' && typeof node.text === 'string') {
    return node.text;
  }
  
  // If it has children, recursively extract text from them
  if (node.children && Array.isArray(node.children)) {
    return node.children.map((child: any) => 
      extractTextFromLexicalNodes(child)
    ).join(' ');
  }
  
  return '';
};

// Function to get all blog posts
export const getBlogPosts = (): BlogPost[] => {
  const posts = localStorage.getItem(STORAGE_KEY);
  return posts ? JSON.parse(posts) : [];
};

// Function to get a single blog post by ID
export const getBlogPostById = (id: string): BlogPost | null => {
  const posts = getBlogPosts();
  return posts.find(post => post.id === id) || null;
};

// Function to update a blog post
export const updateBlogPost = (id: string, updates: Partial<BlogPost>): BlogPost | null => {
  const posts = getBlogPosts();
  const postIndex = posts.findIndex(post => post.id === id);
  
  if (postIndex === -1) return null;
  
  const updatedPost = {
    ...posts[postIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  posts[postIndex] = updatedPost;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  
  return updatedPost;
};

// Function to delete a blog post
export const deleteBlogPost = (id: string): boolean => {
  const posts = getBlogPosts();
  const filteredPosts = posts.filter(post => post.id !== id);
  
  if (filteredPosts.length === posts.length) return false;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredPosts));
  return true;
};

// Function to save a draft
export const saveDraft = (draftPost: BlogPost): BlogPost => {
  // Ensure the draft has an ID
  const draftToSave: BlogPost = {
    ...draftPost,
    id: draftPost.id || generateId(),
    updatedAt: new Date().toISOString(),
    status: 'draft',
    readingTime: calculateReadingTime(draftPost.blocks)
  };

  // Get existing drafts
  const existingDrafts = getDrafts();
  
  // Add new draft or update existing one
  const updatedDrafts = [draftToSave, ...existingDrafts.filter(draft => draft.id !== draftToSave.id)];
  
  // Save to localStorage
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(updatedDrafts));
  
  return draftToSave;
};

// Function to get all drafts
export const getDrafts = (): BlogPost[] => {
  const drafts = localStorage.getItem(DRAFTS_KEY);
  return drafts ? JSON.parse(drafts) : [];
};

// Function to get user's published posts
export const getUserPosts = (username: string): BlogPost[] => {
  const posts = getBlogPosts();
  return posts.filter(post => post.author.username === username && post.status === 'published');
};

// Add this export if it doesn't exist
export const deleteDraft = (draftId: string) => {
  try {
    const drafts = JSON.parse(localStorage.getItem('drafts') || '{}');
    delete drafts[draftId];
    localStorage.setItem('drafts', JSON.stringify(drafts));
    return true;
  } catch (error) {
    console.error('Error deleting draft:', error);
    return false;
  }
}; 
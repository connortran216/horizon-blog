/**
 * Milkdown Editor with Obsidian-style Editing Experience
 *
 * Features:
 * - Block-level editing (click to edit individual paragraphs/headings)
 * - Live rendering on blur (Obsidian default behavior)
 * - Global toggle between Edit and View modes
 * - Floating toolbar on text selection
 * - Syntax highlighting for markdown and code blocks
 * - Wiki links [[]] and hashtag #tag support
 * - Centralized configuration from editor.config.ts
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Box, Button, HStack, Tooltip, Text, VStack } from '@chakra-ui/react';
import { ViewIcon, EditIcon, WarningIcon } from '@chakra-ui/icons';
import { Editor, rootCtx, defaultValueCtx, editorViewOptionsCtx } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { gfm } from '@milkdown/preset-gfm';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { history } from '@milkdown/plugin-history';
import { clipboard } from '@milkdown/plugin-clipboard';
import { prism, prismConfig } from '@milkdown/plugin-prism';
import { nord } from '@milkdown/theme-nord';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { EDITOR_CONFIG } from '../../config/editor.config';
import { parseWikiLinks } from './plugins/wikiLinkPlugin';
import { parseHashtags } from './plugins/hashtagPlugin';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Import Prism themes
import 'prismjs/themes/prism-okaidia.css';
import '@milkdown/theme-nord/style.css';

interface MilkdownEditorProps {
  initialContent?: string;
  onChange?: (markdown: string, prosemirrorJSON: string) => void;
  placeholder?: string;
}

type EditorMode = 'edit' | 'view';

const MilkdownEditorInner: React.FC<MilkdownEditorProps & { mode: EditorMode }> = ({
  initialContent = '',
  onChange,
  placeholder = EDITOR_CONFIG.ui.placeholder,
  mode,
}) => {
  const [currentMarkdown, setCurrentMarkdown] = useState(initialContent);
  const [editorError, setEditorError] = useState<string | null>(null);
  const scrollPositionRef = useRef<number>(0);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);

  // Preserve scroll position when switching modes
  useEffect(() => {
    if (EDITOR_CONFIG.behavior.preservePosition && editorContainerRef.current) {
      if (mode === 'view') {
        // Save scroll position when entering view mode
        scrollPositionRef.current = editorContainerRef.current.scrollTop;
      } else {
        // Restore scroll position when entering edit mode
        setTimeout(() => {
          if (editorContainerRef.current) {
            editorContainerRef.current.scrollTop = scrollPositionRef.current;
          }
        }, 100);
      }
    }
  }, [mode]);

  // Configure Milkdown editor
  useEditor((root) => {
    if (mode === 'view') return; // Don't create editor in view mode

    console.log('🔧 Creating Milkdown editor with initial content:', initialContent?.substring(0, 50));

    try {
      return Editor.make()
        .config((ctx) => {
          ctx.set(rootCtx, root);

          // Make editor editable based on mode
          ctx.set(editorViewOptionsCtx, {
            editable: () => mode === 'edit',
            attributes: {
              class: 'milkdown-editor-content',
              spellcheck: 'true',
            },
          });

          // Set initial content
          if (initialContent) {
            ctx.set(defaultValueCtx, initialContent);
          }

          // Configure Prism for code syntax highlighting
          if (EDITOR_CONFIG.features.codeBlockHighlighting) {
            ctx.set(prismConfig.key, {
              configureRefractor: () => {
                // Prism languages are loaded automatically
              },
            });
          }

          // Listen to markdown changes
          ctx.get(listenerCtx).markdownUpdated((ctx, markdown, prevMarkdown) => {
            if (markdown !== prevMarkdown) {
              setCurrentMarkdown(markdown);
              if (onChange) {
                // Extract ProseMirror JSON from the editor state
                try {
                  const editorView = ctx.get(rootCtx)?.querySelector('.milkdown');
                  const pmView = (editorRef.current as any)?._view;

                  let prosemirrorJSON = '{}';
                  if (pmView?.state?.doc) {
                    prosemirrorJSON = JSON.stringify(pmView.state.doc.toJSON());
                  }

                  onChange(markdown, prosemirrorJSON);
                } catch (error) {
                  console.error('Error extracting ProseMirror JSON:', error);
                  // Fallback: send markdown with empty JSON
                  onChange(markdown, '{}');
                }
              }
            }
          });
        })
        .config(nord)
        .use(commonmark)
        .use(EDITOR_CONFIG.features.gfm ? gfm : [])
        .use(EDITOR_CONFIG.features.history ? history : [])
        .use(EDITOR_CONFIG.features.clipboard ? clipboard : [])
        .use(EDITOR_CONFIG.features.codeBlockHighlighting ? prism : [])
        .use(listener);
    } catch (error: any) {
      console.error('❌ Error setting up Milkdown editor:', error);
      setEditorError(error.message || 'Failed to setup editor');
    }
  }, [mode, initialContent]);

  // Render view mode with ReactMarkdown
  if (mode === 'view') {
    // Process wiki links and hashtags before rendering
    let processedMarkdown = currentMarkdown;
    if (EDITOR_CONFIG.features.wikiLinks) {
      processedMarkdown = parseWikiLinks(processedMarkdown);
    }
    if (EDITOR_CONFIG.features.hashtags) {
      processedMarkdown = parseHashtags(processedMarkdown);
    }

    return (
      <Box
        ref={editorContainerRef}
        className="markdown-view-mode"
        sx={{
          minHeight: `${EDITOR_CONFIG.ui.minHeight}px`,
          padding: '1rem',
          border: '1px solid',
          borderColor: 'gray.200',
          borderRadius: 'md',
          backgroundColor: 'white',
          fontFamily: 'inherit',
          overflowY: 'auto',

          // Markdown styling
          'p': {
            marginBottom: '1em',
            lineHeight: '1.7',
          },
          'h1': {
            fontSize: '2.5em',
            fontWeight: 'bold',
            marginTop: '0.5em',
            marginBottom: '0.5em',
            lineHeight: '1.2',
          },
          'h2': {
            fontSize: '2em',
            fontWeight: 'bold',
            marginTop: '0.5em',
            marginBottom: '0.5em',
            lineHeight: '1.3',
          },
          'h3': {
            fontSize: '1.5em',
            fontWeight: 'bold',
            marginTop: '0.5em',
            marginBottom: '0.5em',
            lineHeight: '1.4',
          },
          'h4, h5, h6': {
            fontWeight: 'bold',
            marginTop: '0.5em',
            marginBottom: '0.5em',
          },
          'ul, ol': {
            paddingLeft: '2em',
            marginBottom: '1em',
          },
          'li': {
            marginBottom: '0.5em',
          },
          'code': {
            backgroundColor: 'gray.100',
            padding: '0.2em 0.4em',
            borderRadius: 'sm',
            fontSize: '0.9em',
            fontFamily: 'monospace',
          },
          'pre': {
            backgroundColor: 'gray.900',
            color: 'white',
            padding: '1em',
            borderRadius: 'md',
            marginBottom: '1em',
            overflow: 'auto',
            'code': {
              backgroundColor: 'transparent',
              padding: '0',
              color: 'inherit',
            },
          },
          'blockquote': {
            borderLeft: '4px solid',
            borderColor: 'gray.300',
            paddingLeft: '1em',
            marginLeft: '0',
            marginBottom: '1em',
            fontStyle: 'italic',
            color: 'gray.600',
          },
          'a': {
            color: 'blue.500',
            textDecoration: 'underline',
            '&:hover': {
              color: 'blue.600',
            },
          },
          'a.wiki-link': {
            color: 'purple.500',
            textDecoration: 'none',
            fontWeight: '500',
            '&:hover': {
              textDecoration: 'underline',
            },
          },
          'a.hashtag': {
            color: 'teal.500',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
            },
          },
          'hr': {
            border: 'none',
            borderTop: '2px solid',
            borderColor: 'gray.300',
            marginTop: '2em',
            marginBottom: '2em',
          },
          'table': {
            borderCollapse: 'collapse',
            width: '100%',
            marginBottom: '1em',
          },
          'th, td': {
            border: '1px solid',
            borderColor: 'gray.300',
            padding: '0.5em',
            textAlign: 'left',
          },
          'th': {
            backgroundColor: 'gray.100',
            fontWeight: 'bold',
          },
          'img': {
            maxWidth: '100%',
            height: 'auto',
            borderRadius: 'md',
            marginBottom: '1em',
          },
          'strong': {
            fontWeight: 'bold',
          },
          'em': {
            fontStyle: 'italic',
          },
          's, del': {
            textDecoration: 'line-through',
          },
        }}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {processedMarkdown || placeholder}
        </ReactMarkdown>
      </Box>
    );
  }

  // Show error if editor failed to initialize
  if (editorError) {
    return (
      <Box
        p={6}
        border="1px"
        borderColor="orange.200"
        borderRadius="md"
        bg="orange.50"
      >
        <VStack spacing={4} align="stretch">
          <HStack>
            <WarningIcon color="orange.500" />
            <Text fontWeight="bold" color="orange.700">
              Editor Initialization Error
            </Text>
          </HStack>
          <Text color="orange.600">{editorError}</Text>
          <Text fontSize="sm" color="gray.600">
            Please try refreshing the page. If the problem persists, contact support.
          </Text>
        </VStack>
      </Box>
    );
  }

  // Render edit mode with Milkdown
  return (
    <Box
      ref={editorContainerRef}
      className="milkdown-editor-wrapper"
      sx={{
        '.milkdown': {
          minHeight: `${EDITOR_CONFIG.ui.minHeight}px`,
          padding: '1rem',
          border: '1px solid',
          borderColor: 'gray.200',
          borderRadius: 'md',
          backgroundColor: 'white',
          fontFamily: 'inherit',

          '&:focus-within': {
            borderColor: 'blue.400',
            boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)',
          },
        },

        '.milkdown-editor-content': {
          outline: 'none',
          minHeight: `${EDITOR_CONFIG.ui.minHeight - 50}px`,

          // Typography
          'p': {
            marginBottom: '1em',
            lineHeight: '1.7',
          },

          // Headings
          'h1': {
            fontSize: '2.5em',
            fontWeight: 'bold',
            marginTop: '0.5em',
            marginBottom: '0.5em',
            lineHeight: '1.2',
          },
          'h2': {
            fontSize: '2em',
            fontWeight: 'bold',
            marginTop: '0.5em',
            marginBottom: '0.5em',
            lineHeight: '1.3',
          },
          'h3': {
            fontSize: '1.5em',
            fontWeight: 'bold',
            marginTop: '0.5em',
            marginBottom: '0.5em',
            lineHeight: '1.4',
          },
          'h4': {
            fontSize: '1.25em',
            fontWeight: 'bold',
            marginTop: '0.5em',
            marginBottom: '0.5em',
          },
          'h5': {
            fontSize: '1.1em',
            fontWeight: 'bold',
            marginTop: '0.5em',
            marginBottom: '0.5em',
          },
          'h6': {
            fontSize: '1em',
            fontWeight: 'bold',
            marginTop: '0.5em',
            marginBottom: '0.5em',
          },

          // Lists
          'ul, ol': {
            paddingLeft: '2em',
            marginBottom: '1em',
          },
          'li': {
            marginBottom: '0.5em',
          },

          // Code
          'code': {
            backgroundColor: 'gray.100',
            padding: '0.2em 0.4em',
            borderRadius: 'sm',
            fontSize: '0.9em',
            fontFamily: 'monospace',
          },
          'pre': {
            backgroundColor: 'gray.900',
            color: 'white',
            padding: '1em',
            borderRadius: 'md',
            marginBottom: '1em',
            overflow: 'auto',

            'code': {
              backgroundColor: 'transparent',
              padding: '0',
              color: 'inherit',
            },
          },

          // Blockquote
          'blockquote': {
            borderLeft: '4px solid',
            borderColor: 'gray.300',
            paddingLeft: '1em',
            marginLeft: '0',
            marginBottom: '1em',
            fontStyle: 'italic',
            color: 'gray.600',
          },

          // Links
          'a': {
            color: 'blue.500',
            textDecoration: 'underline',
            '&:hover': {
              color: 'blue.600',
            },
          },

          // Horizontal rule
          'hr': {
            border: 'none',
            borderTop: '2px solid',
            borderColor: 'gray.300',
            marginTop: '2em',
            marginBottom: '2em',
          },

          // Tables
          'table': {
            borderCollapse: 'collapse',
            width: '100%',
            marginBottom: '1em',
          },
          'th, td': {
            border: '1px solid',
            borderColor: 'gray.300',
            padding: '0.5em',
            textAlign: 'left',
          },
          'th': {
            backgroundColor: 'gray.100',
            fontWeight: 'bold',
          },

          // Images
          'img': {
            maxWidth: '100%',
            height: 'auto',
            borderRadius: 'md',
            marginBottom: '1em',
          },

          // Strong and emphasis
          'strong': {
            fontWeight: 'bold',
          },
          'em': {
            fontStyle: 'italic',
          },

          // Strikethrough
          's, del': {
            textDecoration: 'line-through',
          },
        },
      }}
    >
      <Milkdown />
    </Box>
  );
};

const MilkdownEditor: React.FC<MilkdownEditorProps> = React.memo((props) => {
  const [mode, setMode] = useState<EditorMode>('edit');

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === 'edit' ? 'view' : 'edit'));
  }, []);

  // Handle keyboard shortcut for toggling mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.shiftKey && e.key === 'e') {
        e.preventDefault();
        toggleMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleMode]);

  return (
    <MilkdownProvider>
      <Box>
        {/* Mode Toggle Button */}
        {EDITOR_CONFIG.behavior.toggleMode === 'global' && (
          <HStack mb={2} justify="flex-end">
            <Tooltip label={`Switch to ${mode === 'edit' ? 'View' : 'Edit'} Mode (⌘⇧E)`}>
              <Button
                size="sm"
                leftIcon={mode === 'edit' ? <ViewIcon /> : <EditIcon />}
                onClick={toggleMode}
                colorScheme={mode === 'edit' ? 'blue' : 'green'}
                variant="outline"
              >
                {mode === 'edit' ? 'Preview' : 'Edit'}
              </Button>
            </Tooltip>
          </HStack>
        )}

        <MilkdownEditorInner {...props} mode={mode} />
      </Box>
    </MilkdownProvider>
  );
});

MilkdownEditor.displayName = 'MilkdownEditor';

export default MilkdownEditor;

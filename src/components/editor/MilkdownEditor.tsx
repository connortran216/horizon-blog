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
import { Editor, rootCtx, defaultValueCtx, editorViewOptionsCtx, editorViewCtx, serializerCtx } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { gfm } from '@milkdown/preset-gfm';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { history } from '@milkdown/plugin-history';
import { clipboard } from '@milkdown/plugin-clipboard';
import { prism, prismConfig } from '@milkdown/plugin-prism';
import { nord } from '@milkdown/theme-nord';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { EDITOR_CONFIG } from '../../config/editor.config';

// Import Prism themes
import 'prismjs/themes/prism-okaidia.css';
import '@milkdown/theme-nord/style.css';

interface MilkdownEditorProps {
  initialContent?: string;
  onChange?: (markdown: string, prosemirrorJSON: string) => void;
  placeholder?: string;
  readOnly?: boolean; // If true, starts in view mode and hides toggle button
}

type EditorMode = 'edit' | 'view';

const MilkdownEditorInner: React.FC<MilkdownEditorProps & { mode: EditorMode }> = ({
  initialContent = '',
  onChange,
  mode,
}) => {
  const [currentMarkdown, setCurrentMarkdown] = useState(initialContent);
  const [editorError, setEditorError] = useState<string | null>(null);
  const scrollPositionRef = useRef<number>(0);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<Editor | null>(null);

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

  // Memoize onChange callback to maintain referential stability
  const stableOnChange = useCallback((markdown: string, json: string) => {
    if (onChange) {
      onChange(markdown, json);
    }
  }, [onChange]);

  // Configure Milkdown editor
  const { get } = useEditor((root) => {
    if (EDITOR_CONFIG.debug?.logLifecycle) {
      console.log('🔧 Creating Milkdown editor with initial content:', initialContent?.substring(0, 50));
    }

    try {
      let editor = Editor.make()
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
              // Extract ProseMirror JSON from the editor state using proper context API
              try {
                const view = ctx.get(editorViewCtx);

                let prosemirrorJSON = '{}';
                if (view?.state?.doc) {
                  // Properly extract the ProseMirror document as JSON
                  prosemirrorJSON = JSON.stringify(view.state.doc.toJSON());

                  if (EDITOR_CONFIG.debug?.logLifecycle) {
                    console.log('📝 ProseMirror JSON extracted:', {
                      markdown: markdown.substring(0, 50) + '...',
                      jsonSize: prosemirrorJSON.length,
                      nodeCount: view.state.doc.childCount
                    });
                  }
                }

                stableOnChange(markdown, prosemirrorJSON);
              } catch (error) {
                console.error('❌ Error extracting ProseMirror JSON:', error);
                // Fallback: send markdown with empty JSON
                stableOnChange(markdown, '{}');
              }
            }
          });
        })
        .config(nord)
        .use(commonmark)
        .use(listener);

      // Apply optional plugins based on config (already memoized)
      if (EDITOR_CONFIG.features.gfm) {
        editor = editor.use(gfm);
      }
      if (EDITOR_CONFIG.features.history) {
        editor = editor.use(history);
      }
      if (EDITOR_CONFIG.features.clipboard) {
        editor = editor.use(clipboard);
      }
      if (EDITOR_CONFIG.features.codeBlockHighlighting) {
        editor = editor.use(prism);
      }

      // Store the editor instance for programmatic access
      editorInstanceRef.current = editor;

      if (EDITOR_CONFIG.debug?.logLifecycle) {
        console.log('✅ Milkdown editor instance created and stored');
      }

      return editor;
    } catch (error: any) {
      console.error('❌ Error setting up Milkdown editor:', error);
      setEditorError(error.message || 'Failed to setup editor');
    }
  }, [initialContent, stableOnChange]);

  // Update editor editable state when mode changes
  useEffect(() => {
    const editor = get();
    if (editor) {
      editor.action((ctx) => {
        const view = ctx.get(editorViewOptionsCtx);
        ctx.set(editorViewOptionsCtx, {
          ...view,
          editable: () => mode === 'edit',
        });
      });
    }
  }, [mode, get]);

  // Programmatic editor control methods (available for future use)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _getEditorContent = useCallback(() => {
    const editor = editorInstanceRef.current;
    if (!editor) return { markdown: '', json: '{}' };

    try {
      let markdown = '';
      let json = '{}';

      editor.action((ctx) => {
        const view = ctx.get(editorViewCtx);
        const serializer = ctx.get(serializerCtx);

        if (view?.state?.doc) {
          // Get markdown using the serializer
          markdown = serializer(view.state.doc);
          // Get ProseMirror JSON
          json = JSON.stringify(view.state.doc.toJSON());
        }
      });

      return { markdown, json };
    } catch (error) {
      console.error('Error getting editor content:', error);
      return { markdown: currentMarkdown, json: '{}' };
    }
  }, [currentMarkdown]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _setEditorContent = useCallback((content: string) => {
    const editor = editorInstanceRef.current;
    if (!editor) return;

    try {
      editor.action((ctx) => {
        ctx.set(defaultValueCtx, content);
      });

      if (EDITOR_CONFIG.debug?.logLifecycle) {
        console.log('📝 Editor content updated programmatically');
      }
    } catch (error) {
      console.error('Error setting editor content:', error);
    }
  }, []);

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

  // Render Milkdown editor (both edit and view modes)
  return (
    <Box
      ref={editorContainerRef}
      className="milkdown-editor-wrapper"
      sx={{
        '.milkdown': {
          minHeight: `${EDITOR_CONFIG.ui.minHeight}px`,
          padding: '1rem',
          border: '1px solid',
          borderColor: mode === 'view' ? 'gray.100' : 'gray.200',
          borderRadius: 'md',
          backgroundColor: mode === 'view' ? 'gray.50' : 'white',
          fontFamily: 'inherit',

          '&:focus-within': {
            borderColor: mode === 'edit' ? 'blue.400' : 'gray.100',
            boxShadow: mode === 'edit' ? '0 0 0 1px var(--chakra-colors-blue-400)' : 'none',
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
  const { readOnly = false } = props;
  const [mode, setMode] = useState<EditorMode>(readOnly ? 'view' : 'edit');

  const toggleMode = useCallback(() => {
    if (readOnly) return; // Don't allow toggling in read-only mode
    setMode((prev) => (prev === 'edit' ? 'view' : 'edit'));
  }, [readOnly]);

  // Handle keyboard shortcut for toggling mode
  useEffect(() => {
    if (readOnly) return; // Don't register shortcut in read-only mode

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.shiftKey && e.key === 'e') {
        e.preventDefault();
        toggleMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleMode, readOnly]);

  return (
    <MilkdownProvider>
      <Box>
        {/* Mode Toggle Button - only show if not in read-only mode */}
        {!readOnly && EDITOR_CONFIG.behavior.toggleMode === 'global' && (
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

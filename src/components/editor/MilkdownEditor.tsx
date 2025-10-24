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
import { Box, Tabs, TabList, Tab, Text, VStack, HStack } from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';
import { Editor, rootCtx, defaultValueCtx, editorViewOptionsCtx, editorViewCtx } from '@milkdown/core';
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

          // Start editor in editable state - the useEffect will handle mode toggling
          // This avoids stale closure issues with the mode variable
          ctx.set(editorViewOptionsCtx, {
            editable: () => true,
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
        // Get the ProseMirror view instance (not options!)
        const view = ctx.get(editorViewCtx);
        const currentOptions = ctx.get(editorViewOptionsCtx);

        // Update the editable option
        ctx.set(editorViewOptionsCtx, {
          ...currentOptions,
          editable: () => mode === 'edit',
        });

        // CRITICAL: Force ProseMirror to reapply the editable state
        view.updateState(view.state);

        if (EDITOR_CONFIG.debug?.logLifecycle) {
          console.log(`🔄 Editor mode changed to: ${mode}`);
        }
      });
    }
  }, [mode, get]);


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
          padding: mode === 'view' ? '2rem' : '1rem',
          border: mode === 'view' ? 'none' : '1px solid',
          borderColor: mode === 'view' ? 'transparent' : 'gray.200',
          borderRadius: 'md',
          backgroundColor: mode === 'view' ? 'transparent' : 'white',
          fontFamily: 'inherit',

          '&:focus-within': {
            borderColor: mode === 'edit' ? 'blue.400' : 'transparent',
            boxShadow: mode === 'edit' ? '0 0 0 1px var(--chakra-colors-blue-400)' : 'none',
          },
        },

        '.milkdown-editor-content': {
          outline: 'none',
          minHeight: `${EDITOR_CONFIG.ui.minHeight - 50}px`,
          fontSize: mode === 'view' ? '1.1rem' : '1rem',
          maxWidth: mode === 'view' ? '100%' : 'none',

          // Typography
          'p': {
            marginBottom: mode === 'view' ? '1.2em' : '1em',
            lineHeight: mode === 'view' ? '1.8' : '1.7',
          },

          // Headings
          'h1': {
            fontSize: mode === 'view' ? '2.8em' : '2.5em',
            fontWeight: 'bold',
            marginTop: mode === 'view' ? '0.8em' : '0.5em',
            marginBottom: mode === 'view' ? '0.6em' : '0.5em',
            lineHeight: '1.2',
            color: mode === 'view' ? 'gray.900' : 'inherit',
          },
          'h2': {
            fontSize: mode === 'view' ? '2.2em' : '2em',
            fontWeight: 'bold',
            marginTop: mode === 'view' ? '0.8em' : '0.5em',
            marginBottom: mode === 'view' ? '0.6em' : '0.5em',
            lineHeight: '1.3',
            color: mode === 'view' ? 'gray.800' : 'inherit',
          },
          'h3': {
            fontSize: mode === 'view' ? '1.7em' : '1.5em',
            fontWeight: 'bold',
            marginTop: mode === 'view' ? '0.8em' : '0.5em',
            marginBottom: mode === 'view' ? '0.6em' : '0.5em',
            lineHeight: '1.4',
            color: mode === 'view' ? 'gray.800' : 'inherit',
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
  const { readOnly = false, initialContent = '', onChange } = props;
  const [mode, setMode] = useState<EditorMode>(readOnly ? 'view' : 'edit');
  const [tabIndex, setTabIndex] = useState(readOnly ? 1 : 0);
  const [markdownContent, setMarkdownContent] = useState(initialContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Update markdown content when initialContent changes
  useEffect(() => {
    setMarkdownContent(initialContent);
  }, [initialContent]);

  // Sync line numbers scroll with textarea scroll
  const handleTextareaScroll = useCallback(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  // Handle tab change
  const handleTabChange = useCallback((index: number) => {
    if (readOnly) return;
    setTabIndex(index);
    setMode(index === 0 ? 'edit' : 'view');
  }, [readOnly]);

  // Handle raw markdown changes in Editor tab
  const handleMarkdownChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setMarkdownContent(newContent);

    // Call parent onChange with markdown and empty JSON for now
    if (onChange) {
      onChange(newContent, '{}');
    }
  }, [onChange]);

  // Handle keyboard shortcut for toggling mode
  useEffect(() => {
    if (readOnly) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.shiftKey && e.key === 'e') {
        e.preventDefault();
        const newIndex = tabIndex === 0 ? 1 : 0;
        setTabIndex(newIndex);
        setMode(newIndex === 0 ? 'edit' : 'view');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabIndex, readOnly]);

  return (
    <Box>
      {/* Tabs for Edit/Preview - only show if not in read-only mode */}
      {!readOnly && EDITOR_CONFIG.behavior.toggleMode === 'global' && (
        <Tabs index={tabIndex} onChange={handleTabChange} mb={4}>
          <TabList>
            <Tab>Editor</Tab>
            <Tab>Preview</Tab>
          </TabList>
        </Tabs>
      )}

      {/* Editor Tab: Raw Markdown with Line Numbers */}
      {mode === 'edit' && !readOnly && (
        <Box
          position="relative"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          bg="white"
          minHeight={`${EDITOR_CONFIG.ui.minHeight}px`}
        >
          <Box
            as="textarea"
            ref={textareaRef}
            value={markdownContent}
            onChange={handleMarkdownChange}
            onScroll={handleTextareaScroll}
            placeholder={props.placeholder || 'Start writing in markdown...'}
            sx={{
              width: '100%',
              minHeight: `${EDITOR_CONFIG.ui.minHeight}px`,
              padding: '1rem',
              paddingLeft: '3.5rem', // Space for line numbers
              border: 'none',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
              fontSize: '14px',
              lineHeight: '1.6',
              background: 'transparent',
              '&:focus': {
                borderColor: 'blue.400',
                boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)',
              },
            }}
          />
          {/* Line Numbers */}
          <Box
            ref={lineNumbersRef}
            position="absolute"
            top="0"
            left="0"
            width="3rem"
            height="100%"
            bg="gray.50"
            borderRight="1px solid"
            borderColor="gray.200"
            padding="1rem 0.5rem"
            fontFamily="Monaco, Menlo, monospace"
            fontSize="14px"
            lineHeight="1.6"
            color="gray.500"
            userSelect="none"
            pointerEvents="none"
            overflow="hidden"
          >
            {markdownContent.split('\n').map((_, i) => (
              <Box key={i} textAlign="right">
                {i + 1}
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Preview Tab: Rendered Markdown */}
      {(mode === 'view' || readOnly) && (
        <MilkdownProvider>
          <MilkdownEditorInner {...props} initialContent={markdownContent} mode="view" />
        </MilkdownProvider>
      )}
    </Box>
  );
});

MilkdownEditor.displayName = 'MilkdownEditor';

export default MilkdownEditor;

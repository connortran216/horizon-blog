/**
 * Milkdown Reader - Read-Only Content Display
 *
 * Features:
 * - Read-only markdown content rendering
 * - Text selection enabled for copying
 * - Optimized typography for reading
 * - No editing capabilities
 * - Clean, distraction-free UI
 */

import React, { useState, useCallback, useRef } from 'react';
import { Box, Text, VStack, HStack } from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';
import { Editor, rootCtx, defaultValueCtx, editorViewOptionsCtx } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { gfm } from '@milkdown/preset-gfm';
import { prism, prismConfig } from '@milkdown/plugin-prism';
import { nord } from '@milkdown/theme-nord';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { EDITOR_CONFIG } from '../../config/editor.config';

// Import Prism themes
import 'prismjs/themes/prism-okaidia.css';
import '@milkdown/theme-nord/style.css';

interface MilkdownReaderProps {
  content?: string;
  placeholder?: string;
}

const MilkdownReaderInner: React.FC<MilkdownReaderProps> = ({
  content = '',
  placeholder = 'No content available',
}) => {
  const [editorError, setEditorError] = useState<string | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Configure Milkdown editor in read-only mode
  useEditor((root) => {
    if (EDITOR_CONFIG.debug?.logLifecycle) {
      console.log('📖 Creating Milkdown reader with content:', content?.substring(0, 50));
    }

    try {
      let editor = Editor.make()
        .config((ctx) => {
          ctx.set(rootCtx, root);

          // Set editor to read-only mode
          ctx.set(editorViewOptionsCtx, {
            editable: () => false, // Always false for reader
            attributes: {
              class: 'milkdown-reader-content',
              spellcheck: 'false',
            },
          });

          // Set initial content
          if (content) {
            ctx.set(defaultValueCtx, content);
          }

          // Configure Prism for code syntax highlighting
          if (EDITOR_CONFIG.features.codeBlockHighlighting) {
            ctx.set(prismConfig.key, {
              configureRefractor: () => {
                // Prism languages are loaded automatically
              },
            });
          }
        })
        .config(nord)
        .use(commonmark);

      // Apply optional plugins
      if (EDITOR_CONFIG.features.gfm) {
        editor = editor.use(gfm);
      }
      if (EDITOR_CONFIG.features.codeBlockHighlighting) {
        editor = editor.use(prism);
      }

      if (EDITOR_CONFIG.debug?.logLifecycle) {
        console.log('✅ Milkdown reader instance created');
      }

      return editor;
    } catch (error: any) {
      console.error('❌ Error setting up Milkdown reader:', error);
      setEditorError(error.message || 'Failed to setup reader');
    }
  }, [content]);

  // Show error if reader failed to initialize
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
              Content Display Error
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

  // Render Milkdown in read-only mode
  return (
    <Box
      ref={editorContainerRef}
      className="milkdown-reader-wrapper"
      sx={{
        '.milkdown': {
          minHeight: `${EDITOR_CONFIG.ui.minHeight}px`,
          padding: '2rem',
          border: 'none',
          backgroundColor: 'transparent',
          fontFamily: 'inherit',
        },

        '.milkdown-reader-content': {
          outline: 'none',
          minHeight: `${EDITOR_CONFIG.ui.minHeight - 50}px`,
          fontSize: '1.1rem',
          maxWidth: '100%',
          cursor: 'text',
          userSelect: 'text', // Allow text selection

          // Typography optimized for reading
          'p': {
            marginBottom: '1.2em',
            lineHeight: '1.8',
          },

          // Headings
          'h1': {
            fontSize: '2.8em',
            fontWeight: 'bold',
            marginTop: '0.8em',
            marginBottom: '0.6em',
            lineHeight: '1.2',
            color: 'gray.900',
          },
          'h2': {
            fontSize: '2.2em',
            fontWeight: 'bold',
            marginTop: '0.8em',
            marginBottom: '0.6em',
            lineHeight: '1.3',
            color: 'gray.800',
          },
          'h3': {
            fontSize: '1.7em',
            fontWeight: 'bold',
            marginTop: '0.8em',
            marginBottom: '0.6em',
            lineHeight: '1.4',
            color: 'gray.800',
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
            cursor: 'pointer',
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

const MilkdownReader: React.FC<MilkdownReaderProps> = React.memo((props) => {
  return (
    <MilkdownProvider>
      <MilkdownReaderInner {...props} />
    </MilkdownProvider>
  );
});

MilkdownReader.displayName = 'MilkdownReader';

export default MilkdownReader;

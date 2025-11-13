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

import React, { useState, useRef } from 'react'
import { Box, Text, VStack, HStack, useColorModeValue } from '@chakra-ui/react'
import { WarningIcon } from '@chakra-ui/icons'
import { Editor, rootCtx, defaultValueCtx, editorViewOptionsCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { gfm } from '@milkdown/preset-gfm'
import { prism, prismConfig } from '@milkdown/plugin-prism'
import { nord } from '@milkdown/theme-nord'
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react'
import { EDITOR_CONFIG } from '../../config/editor.config'

// Import Prism themes
import 'prismjs/themes/prism-okaidia.css'
import '@milkdown/theme-nord/style.css'

interface MilkdownReaderProps {
  content?: string
}

const MilkdownReaderInner: React.FC<MilkdownReaderProps> = ({ content = '' }) => {
  const [editorError, setEditorError] = useState<string | null>(null)
  const editorContainerRef = useRef<HTMLDivElement>(null)

  // Color mode values for styling
  const errorBg = useColorModeValue('orange.50', 'rgba(251, 211, 141, 0.1)')
  const errorBorderColor = useColorModeValue('orange.200', 'orange.700')
  const errorTextColor = useColorModeValue('orange.600', 'orange.300')
  const errorHelpTextColor = useColorModeValue('gray.600', 'text.secondary')
  const headingH1Color = useColorModeValue('gray.900', 'text.primary')
  const headingH2H3Color = useColorModeValue('gray.800', 'text.primary')
  const inlineCodeBg = useColorModeValue('gray.100', 'obsidian.dark.bgTertiary')
  const preCodeBg = useColorModeValue('gray.900', 'obsidian.codeBlock')
  const blockquoteBorderColor = useColorModeValue('gray.300', 'border.default')
  const blockquoteTextColor = useColorModeValue('gray.600', 'text.secondary')
  const linkColor = useColorModeValue('blue.500', 'link.default')
  const linkHoverColor = useColorModeValue('blue.600', 'link.hover')
  const hrBorderColor = useColorModeValue('gray.300', 'border.default')
  const tableBorderColor = useColorModeValue('gray.300', 'border.default')
  const tableHeaderBg = useColorModeValue('gray.100', 'bg.tertiary')

  // Configure Milkdown editor in read-only mode
  useEditor(
    (root) => {
      if (EDITOR_CONFIG.debug?.logLifecycle) {
        console.log('📖 Creating Milkdown reader with content:', content?.substring(0, 50))
      }

      try {
        let editor = Editor.make()
          .config((ctx) => {
            ctx.set(rootCtx, root)

            // Set editor to read-only mode
            ctx.set(editorViewOptionsCtx, {
              editable: () => false, // Always false for reader
              attributes: {
                class: 'milkdown-reader-content',
                spellcheck: 'false',
              },
            })

            // Set initial content
            if (content) {
              ctx.set(defaultValueCtx, content)
            }

            // Configure Prism for code syntax highlighting
            if (EDITOR_CONFIG.features.codeBlockHighlighting) {
              ctx.set(prismConfig.key, {
                configureRefractor: () => {
                  // Prism languages are loaded automatically
                },
              })
            }
          })
          .config(nord)
          .use(commonmark)

        // Apply optional plugins
        if (EDITOR_CONFIG.features.gfm) {
          editor = editor.use(gfm)
        }
        if (EDITOR_CONFIG.features.codeBlockHighlighting) {
          editor = editor.use(prism)
        }

        if (EDITOR_CONFIG.debug?.logLifecycle) {
          console.log('✅ Milkdown reader instance created')
        }

        return editor
      } catch (error: unknown) {
        console.error('❌ Error setting up Milkdown reader:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to setup reader'
        setEditorError(errorMessage)
      }
    },
    [content],
  )

  // Show error if reader failed to initialize
  if (editorError) {
    return (
      <Box p={6} border="1px" borderColor={errorBorderColor} borderRadius="md" bg={errorBg}>
        <VStack spacing={4} align="stretch">
          <HStack>
            <WarningIcon color="orange.500" />
            <Text fontWeight="bold" color={errorTextColor}>
              Content Display Error
            </Text>
          </HStack>
          <Text color={errorTextColor}>{editorError}</Text>
          <Text fontSize="sm" color={errorHelpTextColor}>
            Please try refreshing the page. If the problem persists, contact support.
          </Text>
        </VStack>
      </Box>
    )
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
          p: {
            marginBottom: '1.2em',
            lineHeight: '1.8',
          },

          // Headings
          h1: {
            fontSize: '2.8em',
            fontWeight: 'bold',
            marginTop: '0.8em',
            marginBottom: '0.6em',
            lineHeight: '1.2',
            color: headingH1Color,
          },
          h2: {
            fontSize: '2.2em',
            fontWeight: 'bold',
            marginTop: '0.8em',
            marginBottom: '0.6em',
            lineHeight: '1.3',
            color: headingH2H3Color,
          },
          h3: {
            fontSize: '1.7em',
            fontWeight: 'bold',
            marginTop: '0.8em',
            marginBottom: '0.6em',
            lineHeight: '1.4',
            color: headingH2H3Color,
          },
          h4: {
            fontSize: '1.25em',
            fontWeight: 'bold',
            marginTop: '0.5em',
            marginBottom: '0.5em',
          },
          h5: {
            fontSize: '1.1em',
            fontWeight: 'bold',
            marginTop: '0.5em',
            marginBottom: '0.5em',
          },
          h6: {
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
          li: {
            marginBottom: '0.5em',
          },

          // Code
          code: {
            backgroundColor: inlineCodeBg,
            padding: '0.2em 0.4em',
            borderRadius: 'sm',
            fontSize: '0.9em',
            fontFamily: 'monospace',
          },
          pre: {
            backgroundColor: preCodeBg,
            color: 'white',
            padding: '1em',
            borderRadius: 'md',
            marginBottom: '1em',
            overflow: 'auto',

            code: {
              backgroundColor: 'transparent',
              padding: '0',
              color: 'inherit',
            },
          },

          // Blockquote
          blockquote: {
            borderLeft: '4px solid',
            borderColor: blockquoteBorderColor,
            paddingLeft: '1em',
            marginLeft: '0',
            marginBottom: '1em',
            fontStyle: 'italic',
            color: blockquoteTextColor,
          },

          // Links
          a: {
            color: linkColor,
            textDecoration: 'underline',
            cursor: 'pointer',
            '&:hover': {
              color: linkHoverColor,
            },
          },

          // Horizontal rule
          hr: {
            border: 'none',
            borderTop: '2px solid',
            borderColor: hrBorderColor,
            marginTop: '2em',
            marginBottom: '2em',
          },

          // Tables
          table: {
            borderCollapse: 'collapse',
            width: '100%',
            marginBottom: '1em',
          },
          'th, td': {
            border: '1px solid',
            borderColor: tableBorderColor,
            padding: '0.5em',
            textAlign: 'left',
          },
          th: {
            backgroundColor: tableHeaderBg,
            fontWeight: 'bold',
          },

          // Images
          img: {
            maxWidth: '100%',
            height: 'auto',
            borderRadius: 'md',
            marginBottom: '1em',
          },

          // Strong and emphasis
          strong: {
            fontWeight: 'bold',
          },
          em: {
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
  )
}

const MilkdownReader: React.FC<MilkdownReaderProps> = React.memo((props) => {
  return (
    <MilkdownProvider>
      <MilkdownReaderInner {...props} />
    </MilkdownProvider>
  )
})

MilkdownReader.displayName = 'MilkdownReader'

export default MilkdownReader

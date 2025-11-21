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

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Box, Tabs, TabList, Tab, Text, VStack, HStack, useColorModeValue } from '@chakra-ui/react'
import { WarningIcon } from '@chakra-ui/icons'
import {
  Editor,
  rootCtx,
  defaultValueCtx,
  editorViewOptionsCtx,
  editorViewCtx,
} from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { gfm } from '@milkdown/preset-gfm'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
import { history } from '@milkdown/plugin-history'
import { clipboard } from '@milkdown/plugin-clipboard'
import { prism, prismConfig } from '@milkdown/plugin-prism'
import { nord } from '@milkdown/theme-nord'
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react'
import { EDITOR_CONFIG } from '../../config/editor.config'

// Import Prism themes
import 'prismjs/themes/prism-okaidia.css'
import '@milkdown/theme-nord/style.css'

interface MilkdownEditorProps {
  initialContent?: string
  onChange?: (markdown: string, prosemirrorJSON: string) => void
  placeholder?: string
  readOnly?: boolean // If true, starts in view mode and hides toggle button
}

type EditorMode = 'edit' | 'view'

const MilkdownEditorInner: React.FC<MilkdownEditorProps & { mode: EditorMode }> = ({
  initialContent = '',
  onChange,
  mode,
}) => {
  const [editorError, setEditorError] = useState<string | null>(null)
  const scrollPositionRef = useRef<number>(0)
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const editorInstanceRef = useRef<Editor | null>(null)

  // Preserve scroll position when switching modes
  useEffect(() => {
    if (EDITOR_CONFIG.behavior.preservePosition && editorContainerRef.current) {
      if (mode === 'view') {
        // Save scroll position when entering view mode
        scrollPositionRef.current = editorContainerRef.current.scrollTop
      } else {
        // Restore scroll position when entering edit mode
        setTimeout(() => {
          if (editorContainerRef.current) {
            editorContainerRef.current.scrollTop = scrollPositionRef.current
          }
        }, 100)
      }
    }
  }, [mode])

  // Memoize onChange callback to maintain referential stability
  const stableOnChange = useCallback(
    (markdown: string, json: string) => {
      if (onChange) {
        onChange(markdown, json)
      }
    },
    [onChange],
  )

  // Configure Milkdown editor
  const { get } = useEditor(
    (root) => {
      if (EDITOR_CONFIG.debug?.logLifecycle) {
        console.log(
          '🔧 Creating Milkdown editor with initial content:',
          initialContent?.substring(0, 50),
        )
      }

      try {
        let editor = Editor.make()
          .config((ctx) => {
            ctx.set(rootCtx, root)

            // Start editor in editable state - the useEffect will handle mode toggling
            // This avoids stale closure issues with the mode variable
            ctx.set(editorViewOptionsCtx, {
              editable: () => true,
              attributes: {
                class: 'milkdown-editor-content',
                spellcheck: 'true',
              },
            })

            // Set initial content
            if (initialContent) {
              ctx.set(defaultValueCtx, initialContent)
            }

            // Configure Prism for code syntax highlighting
            if (EDITOR_CONFIG.features.codeBlockHighlighting) {
              ctx.set(prismConfig.key, {
                configureRefractor: () => {
                  // Prism languages are loaded automatically
                },
              })
            }

            // Listen to markdown changes
            ctx.get(listenerCtx).markdownUpdated((ctx, markdown, prevMarkdown) => {
              if (markdown !== prevMarkdown) {
                // Extract ProseMirror JSON from the editor state using proper context API
                try {
                  const view = ctx.get(editorViewCtx)

                  let prosemirrorJSON = '{}'
                  if (view?.state?.doc) {
                    // Properly extract the ProseMirror document as JSON
                    prosemirrorJSON = JSON.stringify(view.state.doc.toJSON())

                    if (EDITOR_CONFIG.debug?.logLifecycle) {
                      console.log('📝 ProseMirror JSON extracted:', {
                        markdown: markdown.substring(0, 50) + '...',
                        jsonSize: prosemirrorJSON.length,
                        nodeCount: view.state.doc.childCount,
                      })
                    }
                  }

                  stableOnChange(markdown, prosemirrorJSON)
                } catch (error) {
                  console.error('❌ Error extracting ProseMirror JSON:', error)
                  // Fallback: send markdown with empty JSON
                  stableOnChange(markdown, '{}')
                }
              }
            })
          })
          .config(nord)
          .use(commonmark)
          .use(listener)

        // Apply optional plugins based on config (already memoized)
        if (EDITOR_CONFIG.features.gfm) {
          editor = editor.use(gfm)
        }
        if (EDITOR_CONFIG.features.history) {
          editor = editor.use(history)
        }
        if (EDITOR_CONFIG.features.clipboard) {
          editor = editor.use(clipboard)
        }
        if (EDITOR_CONFIG.features.codeBlockHighlighting) {
          editor = editor.use(prism)
        }

        // Store the editor instance for programmatic access
        editorInstanceRef.current = editor

        if (EDITOR_CONFIG.debug?.logLifecycle) {
          console.log('✅ Milkdown editor instance created and stored')
        }

        return editor
      } catch (error: unknown) {
        console.error('❌ Error setting up Milkdown editor:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to setup editor'
        setEditorError(errorMessage)
      }
      // Note: Intentionally NOT including initialContent in deps to prevent recreation
      // The editor is created once with initial content, then updates via listener
    },
    [stableOnChange],
  )

  // Note: We intentionally don't have a useEffect to update editor content from props
  // because that would cause the editorView context error. Instead, we rely on:
  // 1. Key-based remounting (via milkdownKey in parent component)
  // 2. Initial content being set correctly on mount
  // This approach avoids trying to update a potentially uninitialized editor

  // Update editor editable state when mode changes
  useEffect(() => {
    const editor = get()
    if (editor) {
      editor.action((ctx) => {
        // Get the ProseMirror view instance (not options!)
        const view = ctx.get(editorViewCtx)
        const currentOptions = ctx.get(editorViewOptionsCtx)

        // Update the editable option
        ctx.set(editorViewOptionsCtx, {
          ...currentOptions,
          editable: () => mode === 'edit',
        })

        // CRITICAL: Force ProseMirror to reapply the editable state
        view.updateState(view.state)

        if (EDITOR_CONFIG.debug?.logLifecycle) {
          console.log(`🔄 Editor mode changed to: ${mode}`)
        }
      })
    }
  }, [mode, get])

  // Color mode values for error box
  const errorBg = useColorModeValue('orange.50', 'rgba(251, 211, 141, 0.1)')
  const errorBorderColor = useColorModeValue('orange.200', 'orange.700')
  const errorTextColor = useColorModeValue('orange.600', 'orange.300')
  const errorHelpTextColor = useColorModeValue('gray.600', 'text.secondary')

  // Show error if editor failed to initialize
  if (editorError) {
    return (
      <Box p={6} border="1px" borderColor={errorBorderColor} borderRadius="md" bg={errorBg}>
        <VStack spacing={4} align="stretch">
          <HStack>
            <WarningIcon color="orange.500" />
            <Text fontWeight="bold" color={errorTextColor}>
              Editor Initialization Error
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

  // Color mode values for editor styling
  const editorBg = useColorModeValue('white', 'bg.secondary')
  const editorBorderColor = useColorModeValue('gray.200', 'border.default')
  const editorFocusBorderColor = useColorModeValue('blue.400', 'accent.primary')
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
          borderColor: mode === 'view' ? 'transparent' : editorBorderColor,
          borderRadius: 'md',
          backgroundColor: mode === 'view' ? 'transparent' : editorBg,
          fontFamily: 'inherit',

          '&:focus-within': {
            borderColor: mode === 'edit' ? editorFocusBorderColor : 'transparent',
            boxShadow: mode === 'edit' ? `0 0 0 1px ${editorFocusBorderColor}` : 'none',
          },
        },

        '.milkdown-editor-content': {
          outline: 'none',
          minHeight: `${EDITOR_CONFIG.ui.minHeight - 50}px`,
          fontSize: mode === 'view' ? '1.1rem' : '1rem',
          maxWidth: mode === 'view' ? '100%' : 'none',

          // Typography
          p: {
            marginBottom: mode === 'view' ? '1.2em' : '1em',
            lineHeight: mode === 'view' ? '1.8' : '1.7',
          },

          // Headings
          h1: {
            fontSize: mode === 'view' ? '2.8em' : '2.5em',
            fontWeight: 'bold',
            marginTop: mode === 'view' ? '0.8em' : '0.5em',
            marginBottom: mode === 'view' ? '0.6em' : '0.5em',
            lineHeight: '1.2',
            color: mode === 'view' ? headingH1Color : 'inherit',
          },
          h2: {
            fontSize: mode === 'view' ? '2.2em' : '2em',
            fontWeight: 'bold',
            marginTop: mode === 'view' ? '0.8em' : '0.5em',
            marginBottom: mode === 'view' ? '0.6em' : '0.5em',
            lineHeight: '1.3',
            color: mode === 'view' ? headingH2H3Color : 'inherit',
          },
          h3: {
            fontSize: mode === 'view' ? '1.7em' : '1.5em',
            fontWeight: 'bold',
            marginTop: mode === 'view' ? '0.8em' : '0.5em',
            marginBottom: mode === 'view' ? '0.6em' : '0.5em',
            lineHeight: '1.4',
            color: mode === 'view' ? headingH2H3Color : 'inherit',
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

const MilkdownEditor: React.FC<MilkdownEditorProps> = React.memo((props) => {
  const { readOnly = false, initialContent = '', onChange } = props
  const [mode, setMode] = useState<EditorMode>(readOnly ? 'view' : 'edit')
  const [tabIndex, setTabIndex] = useState(readOnly ? 1 : 0)
  const [markdownContent, setMarkdownContent] = useState(initialContent)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)

  // Tab color mode values to match theme
  const tabColor = useColorModeValue('gray.600', 'text.secondary')
  const tabSelectedColor = useColorModeValue('black', 'accent.primary')
  const tabBorderColor = useColorModeValue('black', 'accent.primary')

  // Color mode values for raw editor
  const rawEditorBg = useColorModeValue('white', 'bg.secondary')
  const rawEditorBorderColor = useColorModeValue('gray.200', 'border.default')
  const rawEditorFocusBorderColor = useColorModeValue('blue.400', 'accent.primary')
  const lineNumbersBg = useColorModeValue('gray.50', 'obsidian.dark.bgTertiary')
  const lineNumbersBorderColor = useColorModeValue('gray.200', 'border.subtle')
  const lineNumbersColor = useColorModeValue('gray.500', 'text.tertiary')

  // Track what content Preview tab has loaded to prevent unnecessary syncs
  const lastSyncedContent = useRef<string>(initialContent)
  // Track if we're switching tabs (to trigger sync) vs just typing (don't sync)
  const isTabSwitching = useRef<boolean>(false)
  // Stable key for MilkdownProvider to prevent recreation on every render
  const milkdownKey = useRef<number>(0)

  // Controlled sync: Update content when initialContent changes (e.g., when post loads) or when switching tabs
  useEffect(() => {
    const contentHasChanged = initialContent !== lastSyncedContent.current

    // Always sync when content changes, regardless of tab switching
    if (contentHasChanged) {
      setMarkdownContent(initialContent)
      lastSyncedContent.current = initialContent
      // Note: Milkdown handles its own updates internally via listener plugins
      // No need to force remounting which causes focus loss
    }

    // Reset the tab switching flag for next tab change
    isTabSwitching.current = false
  }, [initialContent])

  // Sync line numbers scroll with textarea scroll
  const handleTextareaScroll = useCallback(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }, [])

  // Handle tab change
  const handleTabChange = useCallback(
    (index: number) => {
      if (readOnly) return
      // Mark that we're switching tabs so sync logic knows to update
      isTabSwitching.current = true
      setTabIndex(index)
      setMode(index === 0 ? 'edit' : 'view')
    },
    [readOnly],
  )

  // Handle raw markdown changes in Editor tab
  const handleMarkdownChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value
      setMarkdownContent(newContent)

      // Note: Raw editor sends empty ProseMirror JSON since it doesn't have a
      // Milkdown instance. The JSON will be properly generated when switching to
      // Preview tab or when the post is saved. This is acceptable because:
      // 1. The markdown content is the source of truth
      // 2. ProseMirror JSON can be regenerated from markdown at any time
      // 3. Maintaining a hidden parser would add unnecessary complexity
      if (onChange) {
        onChange(newContent, '{}')
      }
    },
    [onChange],
  )

  // Handle keyboard shortcut for toggling mode
  useEffect(() => {
    if (readOnly) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey
      if (isMod && e.shiftKey && e.key === 'e') {
        e.preventDefault()
        // Mark that we're switching tabs
        isTabSwitching.current = true
        const newIndex = tabIndex === 0 ? 1 : 0
        setTabIndex(newIndex)
        setMode(newIndex === 0 ? 'edit' : 'view')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [tabIndex, readOnly])

  return (
    <Box>
      {/* Tabs for Edit/Preview - only show if not in read-only mode */}
      {!readOnly && EDITOR_CONFIG.behavior.toggleMode === 'global' && (
        <Tabs index={tabIndex} onChange={handleTabChange} mb={4}>
          <TabList>
            <Tab
              color={tabColor}
              _selected={{
                color: tabSelectedColor,
                borderColor: tabBorderColor,
              }}
            >
              Editor
            </Tab>
            <Tab
              color={tabColor}
              _selected={{
                color: tabSelectedColor,
                borderColor: tabBorderColor,
              }}
            >
              Preview
            </Tab>
          </TabList>
        </Tabs>
      )}

      {/* Editor Tab: Raw Markdown with Line Numbers */}
      {mode === 'edit' && !readOnly && (
        <Box
          position="relative"
          border="1px solid"
          borderColor={rawEditorBorderColor}
          borderRadius="md"
          bg={rawEditorBg}
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
              color: 'inherit',
              '&:focus': {
                borderColor: rawEditorFocusBorderColor,
                boxShadow: `0 0 0 1px ${rawEditorFocusBorderColor}`,
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
            bg={lineNumbersBg}
            borderRight="1px solid"
            borderColor={lineNumbersBorderColor}
            padding="1rem 0.5rem"
            fontFamily="Monaco, Menlo, monospace"
            fontSize="14px"
            lineHeight="1.6"
            color={lineNumbersColor}
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
        <MilkdownProvider key={milkdownKey.current}>
          <MilkdownEditorInner {...props} initialContent={markdownContent} mode="view" />
        </MilkdownProvider>
      )}
    </Box>
  )
})

MilkdownEditor.displayName = 'MilkdownEditor'

export default MilkdownEditor

/**
 * CrepeEditor Component
 *
 * A WYSIWYG markdown editor built on Crepe (@milkdown/crepe).
 * Features:
 * - Rich-text editing with live preview
 * - Image upload integration with Minio
 * - Custom syntax conversion (wiki links, hashtags)
 * - Theme integration with Obsidian design system
 * - Compatible with existing useEditorContent hook
 */

import React, { useEffect, useRef } from 'react'
import { Crepe, CrepeFeature } from '@milkdown/crepe'
import type { EditorView } from '@milkdown/prose/view'
import type { Node } from '@milkdown/prose/model'
import { Box, useColorModeValue, useToast } from '@chakra-ui/react'
import { CREPE_CONFIG } from '../../config/crepe.config'
import { imageUploadHandler } from '../../utils/imageUpload'
import { parseWikiLinks } from './plugins/wikiLinkPlugin'
import { parseHashtags } from './plugins/hashtagPlugin'
import '@milkdown/crepe/theme/common/style.css'
import './crepe-theme.css'

interface CrepeEditorProps {
  initialContent?: string
  onChange?: (markdown: string, prosemirrorJSON: string) => void
  readOnly?: boolean
  placeholder?: string
}

/**
 * CrepeEditor - WYSIWYG markdown editor component
 */
export const CrepeEditor: React.FC<CrepeEditorProps> = ({
  initialContent = '',
  onChange,
  readOnly = false,
  placeholder,
}) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const crepeRef = useRef<Crepe | null>(null)
  const lastContentRef = useRef<string>(initialContent)
  const isEditorReadyRef = useRef<boolean>(false)
  const toast = useToast()

  // Chakra UI theme integration
  const bgColor = useColorModeValue('white', 'obsidian.dark.bgSecondary')
  const borderColor = useColorModeValue('gray.200', 'border.default')

  useEffect(() => {
    if (!editorRef.current) return

    // Convert custom syntax (wiki links, hashtags) to standard markdown
    const convertedContent = parseWikiLinks(parseHashtags(initialContent))

    // Image upload handler with error handling
    const handleImageUpload = async (file: File): Promise<string> => {
      try {
        const url = await imageUploadHandler.uploadImage(file)
        return url
      } catch (error) {
        // Show toast notification on upload failure
        toast({
          title: 'Upload failed',
          description: error instanceof Error ? error.message : 'Unknown error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
        // Re-throw to prevent editor from inserting broken image
        throw error
      }
    }

    // Create Crepe instance with Phase 1 features
    const crepe = new Crepe({
      root: editorRef.current,
      defaultValue: convertedContent,
      features: {
        // Core features
        [CrepeFeature.Toolbar]: CREPE_CONFIG.features.toolbar,
        [CrepeFeature.ImageBlock]: CREPE_CONFIG.features.imageBlock,
        [CrepeFeature.CodeMirror]: CREPE_CONFIG.features.codeBlocks,
        [CrepeFeature.BlockEdit]: true,
        [CrepeFeature.Cursor]: true,
        [CrepeFeature.LinkTooltip]: true,
        [CrepeFeature.ListItem]: true,
        [CrepeFeature.Table]: CREPE_CONFIG.features.tables,
      },
      featureConfigs: {
        // Placeholder configuration
        [CrepeFeature.Placeholder]: {
          text: placeholder || CREPE_CONFIG.behavior.placeholder,
        },

        // Image upload configuration
        [CrepeFeature.ImageBlock]: {
          onUpload: handleImageUpload,
        },
      },
    })

    // Set up change listener using Crepe's on method before creating
    if (onChange) {
      crepe.on((listenerAPI) => {
        listenerAPI.markdownUpdated((_, markdown) => {
          // Only process changes when editor is fully ready
          if (!isEditorReadyRef.current) {
            return
          }

          try {
            // Get ProseMirror JSON for backend storage
            crepe.editor.action((ctx) => {
              const view = ctx.get('editorViewCtx' as 'editorView') as EditorView
              const prosemirrorJSON = JSON.stringify(view.state.doc.toJSON())
              onChange(markdown, prosemirrorJSON)
            })
          } catch {
            // Silently fall back to markdown only if JSON extraction fails
            onChange(markdown, '{}')
          }
        })
      })
    }

    // Create editor and apply readonly mode
    crepe.create().then(() => {
      try {
        // Mark editor as ready
        isEditorReadyRef.current = true

        // Set readonly mode if specified
        if (readOnly) {
          crepe.setReadonly(true)
        }
      } catch (error) {
        console.error('Error setting up editor:', error)
      }
    })

    crepeRef.current = crepe

    // Note: Editor creation and setup already handled above in create().then()

    // Cleanup on unmount
    return () => {
      isEditorReadyRef.current = false
      if (crepeRef.current) {
        crepeRef.current.destroy()
      }
    }
  }, []) // Empty deps - only run on mount

  // Update content when initialContent changes (e.g., when switching tabs)
  useEffect(() => {
    // Only update if editor is ready and content has changed
    if (!isEditorReadyRef.current || !crepeRef.current) return
    if (initialContent === lastContentRef.current) return

    try {
      // Update Crepe with new content using editor action
      crepeRef.current.editor.action((ctx) => {
        const view = ctx.get('editorViewCtx' as 'editorView') as EditorView
        const parser = ctx.get('parserCtx' as 'parser') as (text: string) => Node
        // Parse markdown and update editor state
        const doc = parser(initialContent)
        const tr = view.state.tr.replaceWith(0, view.state.doc.content.size, doc.content)
        view.dispatch(tr)
      })
      lastContentRef.current = initialContent
    } catch {
      // Silently ignore errors during editor initialization
      // This can happen if the context isn't fully ready yet
    }
  }, [initialContent])

  // Update readonly state when prop changes
  useEffect(() => {
    if (isEditorReadyRef.current && crepeRef.current) {
      crepeRef.current.setReadonly(readOnly)
    }
  }, [readOnly])

  return (
    <Box
      ref={editorRef}
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="md"
      minH="500px"
      className="crepe-editor-wrapper"
      sx={{
        // Ensure proper height and scrolling
        '& .milkdown': {
          minHeight: '500px',
        },
        // Focus state styling
        '&:focus-within': {
          borderColor: 'accent.primary',
          boxShadow: `0 0 0 1px var(--chakra-colors-accent-primary)`,
        },
      }}
    />
  )
}

export default CrepeEditor

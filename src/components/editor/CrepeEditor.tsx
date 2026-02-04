/**
 * CrepeEditor Component
 *
 * A WYSIWYG markdown editor built on Crepe (@milkdown/crepe).
 * Features:
 * - Rich-text editing with live preview
 * - Custom syntax conversion (wiki links, hashtags)
 * - Theme integration with Obsidian design system
 */

import React, { useEffect, useRef } from 'react'
import { Crepe, CrepeFeature } from '@milkdown/crepe'
import type { EditorView } from '@milkdown/prose/view'
import type { Node as ProseMirrorNode } from '@milkdown/prose/model'
import { Box, useColorModeValue } from '@chakra-ui/react'
import { CREPE_CONFIG } from '../../config/crepe.config'
import { parseWikiLinks } from './plugins/wikiLinkPlugin'
import { parseHashtags } from './plugins/hashtagPlugin'
import '@milkdown/crepe/theme/common/style.css'
import './crepe-theme.css'

interface CrepeEditorProps {
  initialContent?: string
  onChange?: (markdown: string) => void
  readOnly?: boolean
  placeholder?: string
  inputId?: string
  inputName?: string
}

/**
 * CrepeEditor - WYSIWYG markdown editor component
 */
export const CrepeEditor: React.FC<CrepeEditorProps> = ({
  initialContent = '',
  onChange,
  readOnly = false,
  placeholder,
  inputId = 'blog-content',
  inputName = 'blogContent',
}) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const crepeRef = useRef<Crepe | null>(null)
  const lastContentRef = useRef<string>(initialContent)
  const isEditorReadyRef = useRef<boolean>(false)

  // Chakra UI theme integration
  const bgColor = useColorModeValue('white', 'obsidian.dark.bgSecondary')
  const borderColor = useColorModeValue('gray.200', 'border.default')

  useEffect(() => {
    if (!editorRef.current) return
    let observer: MutationObserver | null = null

    // Convert custom syntax (wiki links, hashtags) to standard markdown
    const convertedContent = parseWikiLinks(parseHashtags(initialContent))

    // Create Crepe instance with Phase 1 features
    const features = {
      [CrepeFeature.Toolbar]: CREPE_CONFIG.features.toolbar,
      [CrepeFeature.CodeMirror]: CREPE_CONFIG.features.codeBlocks,
      [CrepeFeature.BlockEdit]: true,
      [CrepeFeature.Cursor]: true,
      [CrepeFeature.LinkTooltip]: true,
      [CrepeFeature.ListItem]: true,
      [CrepeFeature.Table]: CREPE_CONFIG.features.tables,
      ...(CREPE_CONFIG.features.imageBlock ? { [CrepeFeature.ImageBlock]: true } : {}),
    }

    const crepe = new Crepe({
      root: editorRef.current,
      defaultValue: convertedContent,
      features,
      featureConfigs: {
        // Placeholder configuration
        [CrepeFeature.Placeholder]: {
          text: placeholder || CREPE_CONFIG.behavior.placeholder,
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
          onChange(markdown)
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

        const applyFormAttrs = () => {
          const editorInput = editorRef.current?.querySelector('[role="textbox"]')
          if (editorInput) {
            editorInput.setAttribute('id', inputId)
            editorInput.setAttribute('name', inputName)
          }

          const slashMenuInput = document.querySelector('input.input-area')
          if (slashMenuInput) {
            slashMenuInput.setAttribute('id', `${inputId}-command`)
            slashMenuInput.setAttribute('name', `${inputName}Command`)
          }
        }

        applyFormAttrs()
        observer = new MutationObserver(applyFormAttrs)
        observer.observe(document.body, {
          childList: true,
          subtree: true,
        })
      } catch (error) {
        console.error('Error setting up editor:', error)
      }
    })

    crepeRef.current = crepe

    // Note: Editor creation and setup already handled above in create().then()

    // Cleanup on unmount
    return () => {
      isEditorReadyRef.current = false
      observer?.disconnect()
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
      // Update editor document when external content changes
      crepeRef.current.editor.action((ctx) => {
        const view = ctx.get('editorViewCtx' as 'editorView') as EditorView
        const parser = ctx.get('parserCtx' as 'parser') as (text: string) => ProseMirrorNode
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

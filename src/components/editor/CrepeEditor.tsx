/**
 * CrepeEditor Component
 *
 * A WYSIWYG markdown editor built on Crepe (@milkdown/crepe).
 * Features:
 * - Rich-text editing with live preview
 * - Custom syntax conversion (wiki links, hashtags)
 * - Theme integration with Obsidian design system
 */

import React, { useCallback, useEffect, useRef } from 'react'
import { Crepe, CrepeFeature } from '@milkdown/crepe'
import { editorViewCtx, parserCtx } from '@milkdown/core'
import type { EditorView } from '@milkdown/prose/view'
import type { Node as ProseMirrorNode } from '@milkdown/prose/model'
import { Box, useColorModeValue, useToast } from '@chakra-ui/react'
import { CREPE_CONFIG } from '../../config/crepe.config'
import { parseWikiLinks } from './plugins/wikiLinkPlugin'
import { parseHashtags } from './plugins/hashtagPlugin'
import {
  deletePostMedia,
  getPostMedia,
  mapMediaApiError,
  resolveMediaUrls,
  uploadPostMedia,
} from '../../features/media/media.api'
import {
  normalizeMarkdownToMediaTokens,
  parseMediaIdsFromMarkdown,
  replaceMediaTokensWithUrls,
} from '../../features/media/media.tokens'
import '@milkdown/crepe/theme/common/style.css'
import './crepe-theme.css'

interface CrepeEditorProps {
  initialContent?: string
  onChange?: (markdown: string) => void
  readOnly?: boolean
  placeholder?: string
  inputId?: string
  inputName?: string
  postId?: number | null
  ensurePostId?: () => Promise<number | null>
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
  postId = null,
  ensurePostId,
}) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const crepeRef = useRef<Crepe | null>(null)
  const lastContentRef = useRef<string>(initialContent)
  const isEditorReadyRef = useRef<boolean>(false)
  const isMountedRef = useRef<boolean>(true)
  const urlToMediaIdRef = useRef<Record<string, string>>({})
  const managedMediaIdsRef = useRef<Set<string>>(new Set())
  const previousTokenIdsRef = useRef<Set<string>>(new Set())
  const pendingExternalContentRef = useRef<string | null>(null)
  const postIdRef = useRef<number | null>(postId)
  const ensurePostIdRef = useRef<typeof ensurePostId>(ensurePostId)
  const toast = useToast()

  useEffect(() => {
    postIdRef.current = postId
    ensurePostIdRef.current = ensurePostId
  }, [postId, ensurePostId])

  const syncExternalContent = useCallback(
    async (sourceMarkdown: string, retries: number = 8): Promise<void> => {
      if (!crepeRef.current) return

      const tokenIds = parseMediaIdsFromMarkdown(sourceMarkdown)
      let nextContent = sourceMarkdown

      if (tokenIds.length > 0) {
        const mediaMap = await resolveMediaUrls(tokenIds)
        nextContent = replaceMediaTokensWithUrls(sourceMarkdown, mediaMap)
        Object.entries(mediaMap).forEach(([mediaId, value]) => {
          urlToMediaIdRef.current[value.url] = mediaId
          managedMediaIdsRef.current.add(mediaId)
        })
      }

      const convertedContent = parseWikiLinks(parseHashtags(nextContent))

      for (let attempt = 0; attempt <= retries; attempt += 1) {
        if (!isMountedRef.current || !crepeRef.current) return
        try {
          crepeRef.current.editor.action((ctx) => {
            const view = ctx.get(editorViewCtx) as EditorView
            const parser = ctx.get(parserCtx) as (text: string) => ProseMirrorNode
            const doc = parser(convertedContent)
            const tr = view.state.tr.replaceWith(0, view.state.doc.content.size, doc.content)
            view.dispatch(tr)
          })

          previousTokenIdsRef.current = new Set(parseMediaIdsFromMarkdown(sourceMarkdown))
          lastContentRef.current = sourceMarkdown
          return
        } catch (error) {
          const maybeMilkdownError = error as { code?: string }
          const canRetry = maybeMilkdownError?.code === 'contextNotFound' && attempt < retries
          if (!canRetry) throw error
          await new Promise((resolve) => {
            setTimeout(resolve, 50)
          })
        }
      }
    },
    [],
  )

  const validateUploadFile = (file: File): void => {
    const maxFileSizeBytes = CREPE_CONFIG.upload.maxFileSize * 1024 * 1024
    if (file.size > maxFileSizeBytes) {
      const fileSizeMb = (file.size / (1024 * 1024)).toFixed(1)
      throw new Error(
        `Image is ${fileSizeMb}MB. Maximum allowed size is ${CREPE_CONFIG.upload.maxFileSize}MB. Please compress the image and try again.`,
      )
    }

    if (!CREPE_CONFIG.upload.allowedTypes.includes(file.type)) {
      throw new Error('Unsupported image format')
    }
  }

  // Chakra UI theme integration
  const bgColor = useColorModeValue('white', 'obsidian.dark.bgSecondary')
  const borderColor = useColorModeValue('gray.200', 'border.default')

  useEffect(() => {
    isMountedRef.current = true
    if (!editorRef.current) return
    let observer: MutationObserver | null = null

    const initialize = async () => {
      if (postIdRef.current) {
        try {
          const postMedia = await getPostMedia(postIdRef.current)
          postMedia.forEach((item) => {
            managedMediaIdsRef.current.add(item.mediaId)
            if (item.url) {
              urlToMediaIdRef.current[item.url] = item.mediaId
            }
          })
        } catch (error) {
          console.error('Failed to load post media list:', error)
        }
      }

      const tokenIds = parseMediaIdsFromMarkdown(initialContent)
      let resolvedInitialContent = initialContent

      if (tokenIds.length > 0) {
        try {
          const mediaMap = await resolveMediaUrls(tokenIds)
          resolvedInitialContent = replaceMediaTokensWithUrls(initialContent, mediaMap)
          Object.entries(mediaMap).forEach(([mediaId, value]) => {
            urlToMediaIdRef.current[value.url] = mediaId
            managedMediaIdsRef.current.add(mediaId)
          })
        } catch (error) {
          console.error('Failed to resolve media URLs for editor:', error)
        }
      }

      // Convert custom syntax (wiki links, hashtags) to standard markdown
      const convertedContent = parseWikiLinks(parseHashtags(resolvedInitialContent))

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
        root: editorRef.current as HTMLElement,
        defaultValue: convertedContent,
        features,
        featureConfigs: {
          // Placeholder configuration
          [CrepeFeature.Placeholder]: {
            text: placeholder || CREPE_CONFIG.behavior.placeholder,
          },
          ...(CREPE_CONFIG.features.imageBlock
            ? {
                [CrepeFeature.ImageBlock]: {
                  onUpload: async (file: File) => {
                    try {
                      validateUploadFile(file)

                      let targetPostId = postIdRef.current
                      if (!targetPostId && ensurePostIdRef.current) {
                        targetPostId = await ensurePostIdRef.current()
                      }

                      if (!targetPostId) {
                        throw new Error('Save draft first before uploading images')
                      }

                      const uploadResult = await uploadPostMedia(targetPostId, file)
                      if (!uploadResult.url) {
                        throw new Error('Upload succeeded but no preview URL is available')
                      }

                      urlToMediaIdRef.current[uploadResult.url] = uploadResult.mediaId
                      managedMediaIdsRef.current.add(uploadResult.mediaId)
                      return uploadResult.url
                    } catch (error) {
                      toast({
                        title: 'Upload failed',
                        description: mapMediaApiError(error, 'Failed to upload image'),
                        status: 'error',
                        duration: 4000,
                        isClosable: true,
                      })
                      throw error
                    }
                  },
                },
              }
            : {}),
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

            const normalizedMarkdown = normalizeMarkdownToMediaTokens(
              markdown,
              urlToMediaIdRef.current,
            )

            const currentTokenIds = new Set(parseMediaIdsFromMarkdown(normalizedMarkdown))
            const removedTokenIds = Array.from(previousTokenIdsRef.current).filter(
              (id) => !currentTokenIds.has(id) && managedMediaIdsRef.current.has(id),
            )

            if (postIdRef.current && removedTokenIds.length > 0) {
              removedTokenIds.forEach((mediaId) => {
                deletePostMedia(postIdRef.current as number, mediaId)
                  .then(() => {
                    managedMediaIdsRef.current.delete(mediaId)
                    Object.keys(urlToMediaIdRef.current).forEach((url) => {
                      if (urlToMediaIdRef.current[url] === mediaId) {
                        delete urlToMediaIdRef.current[url]
                      }
                    })
                  })
                  .catch((error) => {
                    toast({
                      title: 'Delete image failed',
                      description: mapMediaApiError(
                        error,
                        'Failed to remove image from post media',
                      ),
                      status: 'error',
                      duration: 4000,
                      isClosable: true,
                    })
                  })
              })
            }

            previousTokenIdsRef.current = currentTokenIds
            onChange(normalizedMarkdown)
          })
        })
      }

      // Create editor and apply readonly mode
      crepe.create().then(() => {
        try {
          // Defer readiness until editor contexts are fully injected.
          setTimeout(() => {
            if (!isMountedRef.current) return
            isEditorReadyRef.current = true
            previousTokenIdsRef.current = new Set(parseMediaIdsFromMarkdown(initialContent))
            const pendingContent = pendingExternalContentRef.current
            if (pendingContent && pendingContent !== lastContentRef.current) {
              void syncExternalContent(pendingContent).catch((error) => {
                console.error('Failed to sync pending editor content:', error)
              })
              pendingExternalContentRef.current = null
            }
          }, 0)

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
    }

    initialize()

    // Note: Editor creation and setup already handled above in create().then()

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false
      isEditorReadyRef.current = false
      observer?.disconnect()
      if (crepeRef.current) {
        crepeRef.current.destroy()
      }
    }
  }, []) // Empty deps - only run on mount

  // Update content when initialContent changes (e.g., edit existing post after async load)
  useEffect(() => {
    if (!isEditorReadyRef.current || !crepeRef.current) {
      pendingExternalContentRef.current = initialContent
      return
    }
    if (initialContent === lastContentRef.current) return
    void syncExternalContent(initialContent).catch((error) => {
      console.error('Failed to sync external editor content:', error)
    })
  }, [initialContent, syncExternalContent])

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

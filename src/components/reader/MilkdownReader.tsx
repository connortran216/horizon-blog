/**
 * Milkdown Reader - read-only content display.
 *
 * The editor stack is untouched: Milkdown, commonmark, GFM, Prism and the nord
 * theme are configured exactly as before, read-only, from the same
 * `EDITOR_CONFIG` flags. What left is the 170-line `sx` block that restyled the
 * rendered document by hand - `em`-based heading ramps, `gray.*` and
 * `obsidian.*` palette names, and a light/dark pair for every one of them.
 *
 * `Prose` owns that now, by descendant selector, which is also why the rule
 * that wide content scrolls inside itself reaches markup this file never sees.
 * A setup failure is the system's error state rather than an orange panel: a
 * reader who cannot see the article needs to know that, not a stack message.
 */

import React, { useState } from 'react'
import { Box } from '@chakra-ui/react'
import { Editor, rootCtx, defaultValueCtx, editorViewOptionsCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { gfm } from '@milkdown/preset-gfm'
import { prism, prismConfig } from '@milkdown/plugin-prism'
import { nord } from '@milkdown/theme-nord'
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react'

import { Prose, codeTextStyle, localScrollStyle } from '../../design-system'
import { EDITOR_CONFIG } from '../../config/editor.config'

// Import Prism themes
import 'prismjs/themes/prism-okaidia.css'
import '@milkdown/theme-nord/style.css'

interface MilkdownReaderProps {
  content?: string
}

const MilkdownReaderInner: React.FC<MilkdownReaderProps> = ({ content = '' }) => {
  const [editorError, setEditorError] = useState<string | null>(null)

  // Configure Milkdown editor in read-only mode
  useEditor(
    (root) => {
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

        return editor
      } catch (error: unknown) {
        console.error('Error setting up Milkdown reader:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to setup reader'
        setEditorError(errorMessage)
      }
    },
    [content],
  )

  return (
    <Prose
      className="milkdown-reader-wrapper"
      renderError={editorError}
      emptyMessage="This blog has no content yet."
    >
      <Box
        className="milkdown-reader-host"
        minW={0}
        sx={{
          '.milkdown': { outline: 'none' },
          /*
           * `Prose` already contains a bare `pre` or `table`, but the nord and
           * Prism stylesheets style `.milkdown pre` at the same specificity and
           * are imported by this module, so which wins depends on injection
           * order. The rule is restated one level deeper, from the design
           * system's own `localScrollStyle`.
           */
          '.milkdown pre, .milkdown table': { ...localScrollStyle(), display: 'block' },
          // Sized through `codeTextStyle` so a fenced block reads at or below
          // prose size rather than the ambient size it would otherwise
          // inherit from the nord theme's own reset.
          '.milkdown pre': { ...codeTextStyle },
        }}
      >
        <Milkdown />
      </Box>
    </Prose>
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

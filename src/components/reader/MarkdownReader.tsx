/**
 * The markdown reading surface.
 *
 * Nothing about the rendering changed: `marked` still parses, DOMPurify still
 * sanitises with the same two allow-lists, and Shiki still highlights the
 * fenced blocks asynchronously with the same effect and the same cancellation.
 * What changed is who owns the container. `Prose` now supplies the measure, the
 * rhythm, the link and code contrast, the render-failure state and the rule
 * that nothing inside may widen the document; this file supplies the parsed
 * HTML and the two structural rules Shiki's own markup needs.
 *
 * That replaced roughly 260 lines of hand-written `sx` holding two gradients,
 * eleven `rgba()` literals, five hex colours, a hard-coded shadow pair and the
 * `obsidian.text.*` palette names - every one of which had to be picked twice,
 * once per theme, and none of which came from the token source.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { Box, useColorModeValue } from '@chakra-ui/react'
import DOMPurify from 'dompurify'
import { marked } from 'marked'

import {
  Prose,
  chakraColorVar,
  codeTextStyle,
  localScrollStyle,
  scrollAffordanceStyle,
  scrollFadeStyle,
} from '../../design-system'
import { componentTokens, radii, space } from '../../theme/tokens'
import type { ReaderCodeTheme } from './shiki'

interface MarkdownReaderProps {
  content?: string
}

const RENDER_FAILURE = 'The markdown in this blog could not be parsed.'

/**
 * The visible signal that a fenced block's own shell scrolls. See
 * `scrollAffordanceStyle` - `card.border` is the same divider colour the
 * shell's own border already uses.
 */
const scrollAffordance = scrollAffordanceStyle({
  thumb: chakraColorVar(componentTokens.card.border),
})

/**
 * The fade for the fenced block's own shell. Matched to `reader.codeBg`, the
 * same background the shell's own surface already paints.
 *
 * `Prose`'s own sweep already wires the fade's `data-scroll-fade` state onto
 * this exact `pre` - it is a bare tag with no `role`, so nothing excludes it
 * the way `CodeBlock`'s own frame is excluded - so only the CSS needs
 * restating here, for the reason the whole block comment above does: the
 * shell's stylesheet can load after Emotion's.
 */
const scrollEdgeFade = scrollFadeStyle({
  background: chakraColorVar(componentTokens.reader.codeBg),
})

const sanitizeReaderHtml = (html: string, allowStyle: boolean) =>
  DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      's',
      'del',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'a',
      'img',
      'blockquote',
      'div',
      'pre',
      'code',
      'span',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'hr',
    ],
    ALLOWED_ATTR: allowStyle
      ? [
          'href',
          'src',
          'srcset',
          'sizes',
          'alt',
          'title',
          'class',
          'id',
          'style',
          'tabindex',
          'loading',
          'decoding',
          'width',
          'height',
        ]
      : [
          'href',
          'src',
          'srcset',
          'sizes',
          'alt',
          'title',
          'class',
          'id',
          'tabindex',
          'loading',
          'decoding',
          'width',
          'height',
        ],
  })

const MarkdownReader: React.FC<MarkdownReaderProps> = ({ content = '' }) => {
  const codeTheme: ReaderCodeTheme = useColorModeValue('github-light', 'github-dark')
  const [renderedHTML, setRenderedHTML] = useState<{ __html: string }>({ __html: '' })

  const parsed = useMemo(() => {
    try {
      const html = marked.parse(content, {
        gfm: true,
        breaks: true,
      }) as string

      return {
        html: html.replace(/<img /g, '<img loading="lazy" decoding="async" '),
        error: null as string | null,
      }
    } catch (error) {
      console.error('Error rendering markdown:', error)

      return { html: '', error: RENDER_FAILURE }
    }
  }, [content])

  const rawHTML = parsed.html
  const sanitizedBaseHTML = useMemo(() => sanitizeReaderHtml(rawHTML, false), [rawHTML])

  useEffect(() => {
    let isActive = true

    setRenderedHTML({ __html: sanitizedBaseHTML })

    const renderWithShiki = async () => {
      if (!rawHTML.includes('<pre><code')) return

      try {
        const { highlightMarkdownCodeBlocks } = await import('./shiki')
        const highlightedHTML = await highlightMarkdownCodeBlocks(rawHTML, codeTheme)
        if (!isActive || highlightedHTML === rawHTML) return

        setRenderedHTML({ __html: sanitizeReaderHtml(highlightedHTML, true) })
      } catch (error) {
        console.error('Error applying Shiki highlighting:', error)
      }
    }

    void renderWithShiki()

    return () => {
      isActive = false
    }
  }, [codeTheme, rawHTML, sanitizedBaseHTML])

  return (
    <Prose className="markdown-reader" renderError={parsed.error}>
      {renderedHTML.__html ? (
        <Box
          dangerouslySetInnerHTML={renderedHTML}
          minW={0}
          sx={{
            /*
             * Shiki wraps each block in its own shell, so the shell is the
             * scroll container rather than the bare `pre` `Prose` contains by
             * descendant selector. Structure only - the surface, the border and
             * the radius are the reader's own code role.
             */
            '.preview-code-block': {
              marginBlock: space[6],
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: componentTokens.card.border,
              borderRadius: radii.card,
              background: componentTokens.reader.codeBg,
              overflow: 'hidden',
            },
            '.preview-code-block__header': {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: space[3],
              paddingInline: space[4],
              paddingBlock: space[2],
              borderBottomWidth: '1px',
              borderBottomStyle: 'solid',
              borderBottomColor: componentTokens.card.border,
              color: componentTokens.reader.secondaryFg,
              textStyle: 'meta',
            },
            '.preview-code-block__language': {
              fontFamily: 'mono',
              textTransform: 'uppercase',
            },
            /* The window-chrome dots are decoration on a reading surface. */
            '.preview-code-block__chrome': { display: 'none' },
            // `codeTextStyle` keeps this at or below prose size rather than
            // the ambient prose size it would otherwise inherit; nothing here
            // set a font at all before. `scrollAffordance` and
            // `scrollEdgeFade` are the visible signals that this shell - not
            // the bare `pre` - is the scroller.
            '.preview-code-block pre': {
              ...localScrollStyle(),
              ...scrollAffordance,
              ...scrollEdgeFade,
              ...codeTextStyle,
              margin: 0,
              padding: space[4],
              background: 'transparent',
            },
            '.shiki .line': { display: 'block' },
          }}
        />
      ) : null}
    </Prose>
  )
}

export default MarkdownReader

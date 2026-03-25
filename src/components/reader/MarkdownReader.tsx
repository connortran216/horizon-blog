import React, { useEffect, useMemo, useState } from 'react'
import { Box, useColorModeValue } from '@chakra-ui/react'
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import type { ReaderCodeTheme } from './shiki'

interface MarkdownReaderProps {
  content?: string
}

const MarkdownReader: React.FC<MarkdownReaderProps> = ({ content = '' }) => {
  const textColor = useColorModeValue('obsidian.text.lightPrimary', 'obsidian.text.primary')
  const codeBlockBg = useColorModeValue('#f6f8fa', '#0d1117')
  const codeBg = useColorModeValue('#f0f1f3', '#2d2d2d')
  const codeTheme: ReaderCodeTheme = useColorModeValue('github-light', 'github-dark')
  const codeShellBg = useColorModeValue(
    'linear-gradient(180deg, rgba(248, 250, 252, 0.98) 0%, rgba(241, 245, 249, 0.98) 100%)',
    'linear-gradient(180deg, rgba(9, 14, 23, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%)',
  )
  const codeHeaderBg = useColorModeValue('rgba(226, 232, 240, 0.7)', 'rgba(15, 23, 42, 0.9)')
  const codeShellBorder = useColorModeValue('rgba(148, 163, 184, 0.35)', 'rgba(71, 85, 105, 0.65)')
  const codeHeaderBorder = useColorModeValue(
    'rgba(148, 163, 184, 0.35)',
    'rgba(148, 163, 184, 0.18)',
  )
  const codeLineNumberColor = useColorModeValue(
    'rgba(71, 85, 105, 0.82)',
    'rgba(148, 163, 184, 0.55)',
  )
  const codeLineHoverBg = useColorModeValue('rgba(37, 99, 235, 0.06)', 'rgba(96, 165, 250, 0.08)')
  const codeLanguageBadgeBg = useColorModeValue(
    'rgba(59, 130, 246, 0.12)',
    'rgba(96, 165, 250, 0.14)',
  )
  const codeLanguageBadgeColor = useColorModeValue('#1d4ed8', '#bfdbfe')
  const codeShadow = useColorModeValue(
    '0 18px 40px rgba(15, 23, 42, 0.10)',
    '0 24px 60px rgba(2, 6, 23, 0.45)',
  )

  const [renderedHTML, setRenderedHTML] = useState<{ __html: string }>({ __html: '' })

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
        ? ['href', 'src', 'alt', 'title', 'class', 'id', 'style', 'tabindex']
        : ['href', 'src', 'alt', 'title', 'class', 'id', 'tabindex'],
    })

  const rawHTML = useMemo(() => {
    try {
      return marked.parse(content, {
        gfm: true,
        breaks: true,
      }) as string
    } catch (error) {
      console.error('Error rendering markdown:', error)
      return '<p>Error rendering content</p>'
    }
  }, [content])

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
    <Box
      color={textColor}
      maxW="46rem"
      mx="auto"
      w="full"
      className="markdown-reader"
      dangerouslySetInnerHTML={renderedHTML}
      sx={{
        fontFamily: 'body',
        fontSize: { base: 'md', md: 'lg' },
        lineHeight: '1.9',

        '& h1': {
          fontSize: { base: '2.2em', md: '2.6em' },
          fontWeight: 'bold',
          mb: 5,
          mt: 8,
          color: textColor,
          letterSpacing: '-0.04em',
        },
        '& h2': {
          fontSize: { base: '1.8em', md: '2em' },
          fontWeight: 'bold',
          mb: 4,
          mt: 10,
          color: textColor,
          letterSpacing: '-0.03em',
        },
        '& h3': {
          fontSize: { base: '1.45em', md: '1.65em' },
          fontWeight: 'semibold',
          mb: 3,
          mt: 8,
          color: textColor,
          letterSpacing: '-0.02em',
        },
        '& h4, & h5, & h6': {
          fontWeight: 'semibold',
          mb: 3,
          mt: 6,
          color: textColor,
        },
        '& p': {
          mb: 6,
          lineHeight: '1.95',
        },
        '& a': {
          color: 'link.default',
          textDecoration: 'underline',
          transition: 'color 0.2s ease-in-out',
          _hover: {
            color: 'link.hover',
          },
        },
        '& code': {
          bg: codeBg,
          px: 2.5,
          py: 1,
          borderRadius: 'md',
          fontSize: '0.875em',
          fontFamily: 'mono',
          color: textColor,
        },
        '& pre': {
          bg: codeBlockBg,
          p: { base: 4, md: 5 },
          borderRadius: 'xl',
          overflow: 'auto',
          my: 8,
          border: '1px solid',
          borderColor: 'border.subtle',
        },
        '& pre code': {
          bg: 'transparent',
          p: 0,
          fontSize: '0.875rem',
          lineHeight: '1.6',
        },
        '& pre.shiki': {
          bg: codeBlockBg,
        },
        '& pre.shiki code': {
          display: 'grid',
          gap: 0,
        },
        '& pre.shiki .line': {
          display: 'block',
          minH: '1.6em',
        },
        '& .preview-code-block': {
          my: 8,
          overflow: 'hidden',
          borderRadius: '2xl',
          border: '1px solid',
          borderColor: codeShellBorder,
          bg: codeShellBg,
          boxShadow: codeShadow,
        },
        '& .preview-code-block__header': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 3,
          px: { base: 4, md: 5 },
          py: 3,
          bg: codeHeaderBg,
          borderBottom: '1px solid',
          borderColor: codeHeaderBorder,
          backdropFilter: 'blur(12px)',
        },
        '& .preview-code-block__chrome': {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 2,
        },
        '& .preview-code-block__dot': {
          w: 2.5,
          h: 2.5,
          borderRadius: 'full',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35)',
        },
        '& .preview-code-block__dot--red': {
          bg: '#fb7185',
        },
        '& .preview-code-block__dot--amber': {
          bg: '#f59e0b',
        },
        '& .preview-code-block__dot--green': {
          bg: '#22c55e',
        },
        '& .preview-code-block__language': {
          display: 'inline-flex',
          alignItems: 'center',
          px: 3,
          py: 1,
          borderRadius: 'full',
          bg: codeLanguageBadgeBg,
          color: codeLanguageBadgeColor,
          fontFamily: 'mono',
          fontSize: 'xs',
          fontWeight: '700',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          border: '1px solid',
          borderColor: codeHeaderBorder,
        },
        '& .preview-code-block pre': {
          my: 0,
          border: 'none',
          borderRadius: 0,
          boxShadow: 'none',
          bg: 'transparent !important',
        },
        '& .preview-code-block pre.shiki': {
          bg: 'transparent !important',
        },
        '& .preview-code-block pre code': {
          display: 'block',
          minW: 'max-content',
          p: { base: 4, md: 5 },
          bg: 'transparent',
          counterReset: 'preview-code-line',
        },
        '& .preview-code-block pre code .line': {
          display: 'block',
          position: 'relative',
          pl: { base: '3.75rem', md: '4.5rem' },
          pr: { base: 2, md: 3 },
          py: '0.1rem',
          minH: '1.75em',
          borderRadius: 'md',
          transition: 'background-color 0.18s ease',
        },
        '& .preview-code-block pre code .line::before': {
          counterIncrement: 'preview-code-line',
          content: 'counter(preview-code-line)',
          position: 'absolute',
          left: { base: '0.75rem', md: '1rem' },
          top: 0,
          width: { base: '2.25rem', md: '2.5rem' },
          color: codeLineNumberColor,
          textAlign: 'right',
          fontFamily: 'mono',
          fontSize: '0.72rem',
          lineHeight: '1.75rem',
          userSelect: 'none',
        },
        '& .preview-code-block pre code .line:hover': {
          bg: codeLineHoverBg,
        },
        '& img': {
          display: 'block',
          maxW: '100%',
          height: 'auto',
          borderRadius: 'xl',
          mx: 'auto',
          my: 8,
          border: '1px solid',
          borderColor: 'border.subtle',
        },
        '& ul, & ol': {
          pl: 6,
          my: 6,
        },
        '& li': {
          mb: 3,
          lineHeight: '1.85',
        },
        '& ul': {
          listStyleType: 'disc',
        },
        '& ol': {
          listStyleType: 'decimal',
        },
        '& li > ul, & li > ol': {
          my: 2,
        },
        '& blockquote': {
          borderLeft: '4px solid',
          borderColor: 'action.primary',
          pl: 5,
          ml: 0,
          my: 8,
          color: 'text.secondary',
          py: 1,
          pr: 2,
          fontSize: { base: 'lg', md: 'xl' },
          lineHeight: '1.75',
        },
        '& table': {
          borderCollapse: 'collapse',
          width: '100%',
          my: 8,
          fontSize: '0.9375rem',
          border: '1px solid',
          borderColor: 'border.default',
          borderRadius: 'md',
          overflow: 'hidden',
        },
        '& thead': {
          bg: 'bg.secondary',
        },
        '& th, & td': {
          border: '1px solid',
          borderColor: 'border.default',
          px: 3,
          py: 2,
          textAlign: 'left',
        },
        '& th': {
          fontWeight: '600',
          color: textColor,
        },
        '& tr:hover': {
          bg: 'bg.tertiary',
        },
        '& hr': {
          border: 'none',
          borderTop: '2px solid',
          borderColor: 'border.subtle',
          my: 10,
        },
        '& strong': {
          fontWeight: 'bold',
        },
        '& em': {
          fontStyle: 'italic',
        },
      }}
    />
  )
}

export default MarkdownReader

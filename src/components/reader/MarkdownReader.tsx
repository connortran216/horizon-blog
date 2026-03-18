import React, { useMemo } from 'react'
import { Box, useColorModeValue } from '@chakra-ui/react'
import DOMPurify from 'dompurify'
import { marked } from 'marked'

interface MarkdownReaderProps {
  content?: string
}

const MarkdownReader: React.FC<MarkdownReaderProps> = ({ content = '' }) => {
  const textColor = useColorModeValue('obsidian.text.lightPrimary', 'obsidian.text.primary')
  const codeBlockBg = useColorModeValue('#f6f8fa', '#0d1117')
  const codeBg = useColorModeValue('#f0f1f3', '#2d2d2d')

  const renderedHTML = useMemo(() => {
    try {
      const rawHTML = marked.parse(content, {
        gfm: true,
        breaks: true,
      }) as string

      const sanitizedHTML = DOMPurify.sanitize(rawHTML, {
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
          'pre',
          'code',
          'table',
          'thead',
          'tbody',
          'tr',
          'th',
          'td',
          'hr',
        ],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id'],
      })

      return { __html: sanitizedHTML }
    } catch (error) {
      console.error('Error rendering markdown:', error)
      return { __html: '<p>Error rendering content</p>' }
    }
  }, [content])

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

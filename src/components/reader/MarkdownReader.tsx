import React, { useMemo } from 'react'
import { Box, useColorModeValue } from '@chakra-ui/react'
import DOMPurify from 'dompurify'
import { marked } from 'marked'

interface MarkdownReaderProps {
  content?: string
}

const MarkdownReader: React.FC<MarkdownReaderProps> = ({ content = '' }) => {
  const bgColor = useColorModeValue('white', 'obsidian.dark.bgSecondary')
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
      bg={bgColor}
      color={textColor}
      className="markdown-reader"
      dangerouslySetInnerHTML={renderedHTML}
      sx={{
        fontFamily: 'body',
        fontSize: 'lg',
        lineHeight: 'tall',

        '& h1': {
          fontSize: '2.8em',
          fontWeight: 'bold',
          mb: 4,
          mt: 6,
          color: textColor,
          borderBottom: '2px solid',
          borderColor: 'border.default',
          paddingBottom: 2,
        },
        '& h2': {
          fontSize: '2.2em',
          fontWeight: 'bold',
          mb: 3,
          mt: 5,
          color: textColor,
        },
        '& h3': {
          fontSize: '1.8em',
          fontWeight: 'semibold',
          mb: 2,
          mt: 4,
          color: textColor,
        },
        '& h4, & h5, & h6': {
          fontWeight: 'semibold',
          mb: 2,
          mt: 3,
          color: textColor,
        },
        '& p': {
          mb: 4,
          lineHeight: '1.8',
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
          px: 2,
          py: 1,
          borderRadius: 'sm',
          fontSize: '0.875em',
          fontFamily: 'mono',
          color: textColor,
        },
        '& pre': {
          bg: codeBlockBg,
          p: 4,
          borderRadius: 'md',
          overflow: 'auto',
          my: 4,
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
          borderRadius: 'md',
          mx: 'auto',
          my: 4,
          border: '1px solid',
          borderColor: 'border.subtle',
        },
        '& ul, & ol': {
          pl: 6,
          my: 4,
        },
        '& li': {
          mb: 2,
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
          borderColor: 'accent.primary',
          pl: 4,
          ml: 0,
          my: 4,
          color: 'text.secondary',
          fontStyle: 'italic',
          py: 2,
        },
        '& table': {
          borderCollapse: 'collapse',
          width: '100%',
          my: 4,
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
          my: 6,
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

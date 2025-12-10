/**
 * MarkdownEditor Component
 *
 * A simple raw markdown editor with line numbers.
 * Features:
 * - Line numbers synchronized with content
 * - Monospace font (Monaco, Menlo)
 * - Tab key support (inserts 2 spaces)
 * - Auto-expanding textarea
 * - Theme-aware styling (light/dark mode)
 */

import React, { useRef, useCallback, KeyboardEvent, UIEvent } from 'react'
import { Box, Textarea, useColorModeValue } from '@chakra-ui/react'

interface MarkdownEditorProps {
  content: string
  onChange: (content: string) => void
  readOnly?: boolean
  placeholder?: string
}

/**
 * MarkdownEditor - Raw markdown editor with line numbers
 */
export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  content,
  onChange,
  readOnly = false,
  placeholder = 'Start writing your markdown...',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)

  // Theme colors
  const bgColor = useColorModeValue('white', 'obsidian.dark.bgSecondary')
  const textColor = useColorModeValue('obsidian.text.lightPrimary', 'obsidian.text.primary')
  const lineNumberBg = useColorModeValue('gray.50', 'obsidian.dark.bgTertiary')
  const lineNumberColor = useColorModeValue('gray.500', 'text.tertiary')
  const borderColor = useColorModeValue('gray.200', 'border.default')
  const focusBorderColor = useColorModeValue('accent.primary', 'accent.primary')

  // Calculate line numbers
  const lines = content.split('\n')
  const lineCount = lines.length

  // Handle tab key (insert 2 spaces instead of tab character)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault()

        const textarea = textareaRef.current
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const newContent = content.substring(0, start) + '  ' + content.substring(end)

        onChange(newContent)

        // Set cursor position after inserted spaces
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2
        }, 0)
      }
    },
    [content, onChange],
  )

  // Sync scroll between line numbers and textarea
  const handleScroll = useCallback((_e: UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current && textareaRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }, [])

  return (
    <Box
      position="relative"
      display="flex"
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="md"
      overflow="hidden"
      minH="500px"
      bg={bgColor}
      _focusWithin={{
        borderColor: focusBorderColor,
        boxShadow: `0 0 0 1px var(--chakra-colors-${focusBorderColor})`,
      }}
    >
      {/* Line Numbers */}
      <Box
        ref={lineNumbersRef}
        bg={lineNumberBg}
        color={lineNumberColor}
        fontFamily="mono"
        fontSize="sm"
        lineHeight="1.5"
        textAlign="right"
        pr={3}
        pl={3}
        py={3}
        minW="50px"
        maxW="50px"
        overflow="hidden"
        userSelect="none"
        borderRight="1px solid"
        borderColor={borderColor}
        sx={{
          // Hide scrollbar but keep scroll functionality
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          scrollbarWidth: 'none',
        }}
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <Box key={i + 1} height="1.5em">
            {i + 1}
          </Box>
        ))}
      </Box>

      {/* Textarea */}
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onScroll={handleScroll}
        placeholder={placeholder}
        readOnly={readOnly}
        fontFamily="mono"
        fontSize="sm"
        lineHeight="1.5"
        color={textColor}
        border="none"
        resize="none"
        p={3}
        minH="500px"
        _focus={{
          border: 'none',
          boxShadow: 'none',
        }}
        _hover={{
          border: 'none',
        }}
        sx={{
          // Custom scrollbar
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: lineNumberBg,
          },
          '&::-webkit-scrollbar-thumb': {
            background: lineNumberColor,
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: focusBorderColor,
          },
          // Make textarea fill remaining space
          flex: 1,
          // Remove default textarea styles
          outline: 'none',
          // Better whitespace handling
          whiteSpace: 'pre',
          overflowWrap: 'normal',
          overflowX: 'auto',
        }}
      />
    </Box>
  )
}

export default MarkdownEditor

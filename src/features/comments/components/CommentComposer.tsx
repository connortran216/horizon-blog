import { useState } from 'react'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react'
import { AnimatedPrimaryButton } from '../../../components/core/animations/AnimatedButton'
import { MAX_COMMENT_CONTENT_LENGTH } from '../comments.types'
import { validateCommentContent } from '../comments.service'

interface CommentComposerProps {
  label: string
  submitLabel: string
  initialContent?: string
  autoFocus?: boolean
  onSubmit: (content: string) => Promise<void>
  onCancel?: () => void
}

const CommentComposer = ({
  label,
  submitLabel,
  initialContent = '',
  autoFocus = false,
  onSubmit,
  onCancel,
}: CommentComposerProps) => {
  const [content, setContent] = useState(initialContent)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      const normalized = validateCommentContent(content)
      setError(null)
      setSubmitting(true)
      await onSubmit(normalized)
      setContent('')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Comment could not be saved.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormControl isInvalid={Boolean(error)}>
        <FormLabel color="text.secondary">{label}</FormLabel>
        <VStack align="stretch" spacing={3}>
          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            maxLength={MAX_COMMENT_CONTENT_LENGTH}
            minH="112px"
            resize="vertical"
            bg="bg.page"
            borderColor="border.default"
            color="text.primary"
            placeholder="Write a thoughtful response…"
            autoFocus={autoFocus}
          />
          <HStack justify="space-between" align="center">
            <Text fontSize="sm" color="text.tertiary" aria-live="polite">
              {content.length}/{MAX_COMMENT_CONTENT_LENGTH}
            </Text>
            <HStack>
              {onCancel ? (
                <AnimatedPrimaryButton variant="ghost" onClick={onCancel} isDisabled={submitting}>
                  Cancel
                </AnimatedPrimaryButton>
              ) : null}
              <AnimatedPrimaryButton type="submit" isLoading={submitting}>
                {submitLabel}
              </AnimatedPrimaryButton>
            </HStack>
          </HStack>
          {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
        </VStack>
      </FormControl>
    </form>
  )
}

export default CommentComposer

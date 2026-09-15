/**
 * Writing a comment, a reply, or an edit.
 *
 * `Field` owns the label, the validation message and the `aria-describedby`
 * wiring; `Textarea` picks that wiring up from context and resizes vertically
 * only, so nobody can drag a comment box wider than the reading column. The
 * submit path is unchanged - `validateCommentContent` still decides what is
 * acceptable and the same error text still reaches the reader.
 *
 * `AnimatedPrimaryButton` from `src/components/core/animations` is gone; the
 * hover lift it carried lives in the Button recipe now.
 */

import { useId, useState } from 'react'

import { Button, Field, Stack, Text, Textarea } from '../../../design-system'
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
  const fieldId = useId()
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
      <Stack gap={3}>
        <Field id={fieldId} label={label} error={error ?? undefined}>
          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            maxLength={MAX_COMMENT_CONTENT_LENGTH}
            rows={4}
            placeholder="Write a thoughtful response…"
            autoFocus={autoFocus}
          />
        </Field>

        <Stack
          direction="row"
          collapseAt={undefined}
          gap={3}
          align="center"
          justify="space-between"
          wrap="wrap"
        >
          <Text as="p" recipe="metadata" aria-live="polite">
            {content.length}/{MAX_COMMENT_CONTENT_LENGTH}
          </Text>
          <Stack direction="row" collapseAt={undefined} gap={2} align="center">
            {onCancel ? (
              <Button tone="quiet" onClick={onCancel} isDisabled={submitting}>
                Cancel
              </Button>
            ) : null}
            <Button type="submit" isLoading={submitting} loadingLabel="Saving your comment">
              {submitLabel}
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </form>
  )
}

export default CommentComposer

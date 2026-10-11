/**
 * Horizon Design System v2 - writing a new Series in place.
 *
 * It opens where the new Series will appear - at the head of the author's
 * spines - and it is laid out on the spine's own three wrapping columns, so the title
 * sits where the title will be and the actions where the Manage action will be.
 * No card: a rule in the action colour above it says "this one is being
 * written", and the rule under it is the one every spine already has.
 *
 * The values are the caller's. This form owns two things: moving focus to the
 * title when it opens, and saying out loud why it cannot be submitted yet.
 */

import { useEffect, useRef, type FormEvent } from 'react'
import { Box, type BoxProps } from '@chakra-ui/react'
import { FiPlus } from 'react-icons/fi'

import { componentTokens, space } from '../../../theme/tokens'
import { Button } from '../../components/actions'
import { Field, Input, Textarea } from '../../components/forms'
import { Text } from '../../components/typography'
import {
  SERIES_DESCRIPTION_MAX,
  SERIES_TITLE_MAX,
  seriesComposerState,
} from './seriesComposer.logic'

export interface SeriesComposerProps extends Omit<BoxProps, 'children' | 'onSubmit' | 'title'> {
  title: string
  description: string
  onTitleChange: (title: string) => void
  onDescriptionChange: (description: string) => void
  onSubmit: () => void
  onCancel: () => void
  isSubmitting?: boolean
  /** Why the last create failed. What was typed stays. */
  error?: string | null
}

const tokens = componentTokens.series

export function SeriesComposer({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  onSubmit,
  onCancel,
  isSubmitting = false,
  error,
  ...rest
}: SeriesComposerProps) {
  const titleRef = useRef<HTMLInputElement>(null)
  const state = seriesComposerState({ title, description, isSubmitting })

  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (state.canSubmit) {
      onSubmit()
    }
  }

  return (
    <Box
      as="form"
      aria-label="New Series"
      noValidate
      onSubmit={submit}
      display="flex"
      flexWrap="wrap"
      alignItems="flex-start"
      columnGap={space[6]}
      rowGap={space[4]}
      paddingBlock={space[6]}
      borderTopWidth="2px"
      borderTopStyle="solid"
      borderTopColor={tokens.composerRule}
      borderBottomWidth="1px"
      borderBottomStyle="solid"
      borderBottomColor={tokens.border}
      data-series-composer=""
      {...rest}
    >
      <Box flex={`1 1 ${tokens.spineColumnMin}`} minW={0}>
        <Field
          label="Series title"
          isRequired
          hint="Readers see it on the Series page and above every part."
          error={state.titleError ?? undefined}
        >
          <Input
            ref={titleRef}
            value={title}
            maxLength={SERIES_TITLE_MAX}
            onChange={(event) => onTitleChange(event.target.value)}
          />
        </Field>
      </Box>

      <Box flex={`1.15 1 ${tokens.spineColumnMin}`} minW={0}>
        <Field
          label="Description"
          hint={`Optional. One or two sentences on what the Series covers. ${state.descriptionCount}.`}
          error={state.descriptionError ?? undefined}
        >
          <Textarea
            rows={2}
            value={description}
            maxLength={SERIES_DESCRIPTION_MAX}
            onChange={(event) => onDescriptionChange(event.target.value)}
          />
        </Field>
      </Box>

      <Box
        flex="none"
        display="flex"
        flexDirection="column"
        gap={space[2]}
        paddingBlockStart={space[6]}
      >
        <Box display="flex" gap={space[2]} flexWrap="wrap">
          <Button
            type="submit"
            tone="primary"
            iconStart={<FiPlus aria-hidden="true" />}
            isDisabled={!state.canSubmit && !isSubmitting}
            isLoading={isSubmitting}
            loadingLabel="Creating this Series"
          >
            Create Series
          </Button>
          <Button type="button" tone="quiet" isDisabled={isSubmitting} onClick={onCancel}>
            Cancel
          </Button>
        </Box>
        {state.blockedReason ? (
          // A disabled control with no explanation is a dead end.
          <Text recipe="metadata" role="status" aria-live="polite">
            {state.blockedReason}
          </Text>
        ) : null}
        {error ? (
          <Text
            recipe="metadata"
            role="alert"
            aria-live="assertive"
            color={componentTokens.field.invalidText}
          >
            {error}
          </Text>
        ) : null}
      </Box>
    </Box>
  )
}

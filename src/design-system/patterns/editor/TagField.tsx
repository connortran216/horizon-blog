/**
 * Horizon Design System v2 - the tag field.
 *
 * A text input that turns what you type into removable chips. It replaces the
 * legacy `EditorTagField`.
 *
 * The removal control is the part worth reading. Each tag renders as a `Chip`
 * plus its own `button` labelled "Remove the tag Engineering" - a full sentence
 * with the tag in it, because a row of eight buttons all called "Remove" is
 * unusable with a screen reader and impossible to pick from a rotor list.
 *
 * Adding is on Enter and on comma. Comma because that is how the legacy field
 * and the prototype both behave, and because an author typing a comma-separated
 * list should not end up with one tag called "react, typescript, testing".
 */

import { useState, type KeyboardEvent } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import { FiX } from 'react-icons/fi'

import { componentTokens, radii, space } from '../../../theme/tokens'
import { Field, Input } from '../../components/forms'
import { Chip } from '../../components/status'
import { IconButton } from '../../components/actions'
import { addTag, removeTag } from './workspace.logic'

export interface TagFieldProps {
  tags: readonly string[]
  onChange: (tags: readonly string[]) => void
  label?: string
  hint?: string
  /** Zero means no limit. */
  maxTags?: number
  maxLength?: number
  isDisabled?: boolean
  /** An error from the caller - a tag the backend rejected, for instance. */
  error?: string
}

export function TagField({
  tags,
  onChange,
  label = 'Tags',
  hint = 'Short labels that group related writing. Press Enter or comma to add one.',
  maxTags = 0,
  maxLength = 32,
  isDisabled = false,
  error,
}: TagFieldProps) {
  const [draft, setDraft] = useState('')
  const [rejection, setRejection] = useState<string | null>(null)

  const commit = () => {
    const result = addTag({ tags, candidate: draft, maxTags, maxLength })

    setRejection(result.rejection)

    if (result.clearsInput) {
      setDraft('')
    }

    if (result.tags !== tags) {
      onChange(result.tags)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      // Enter inside a form would submit it, and a comma would be typed into
      // the value. Neither is what the author asked for.
      event.preventDefault()
      commit()

      return
    }

    if (event.key === 'Backspace' && draft.length === 0 && tags.length > 0) {
      // The convention every tag input has. It removes the last chip rather
      // than doing nothing, which is what an author expects after clearing the
      // text they were typing.
      onChange(removeTag(tags, tags[tags.length - 1]))
    }
  }

  return (
    <Field
      label={label}
      hint={hint}
      error={error ?? rejection ?? undefined}
      isDisabled={isDisabled}
    >
      <Box
        borderWidth="1px"
        borderStyle="solid"
        borderColor={componentTokens.field.border}
        borderRadius={radii.control}
        bg={componentTokens.field.bg}
        padding={space[3]}
        _focusWithin={{ borderColor: componentTokens.field.hoverBorder }}
      >
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          // Committing on blur as well: an author who types a tag and clicks
          // "Publish" should not silently lose it.
          onBlur={commit}
          placeholder="Add a tag"
          /*
           * The box around this input owns the border and the focus ring, so
           * the input itself owns neither - one visual owner per surface. It
           * keeps its full touch height so the field is tappable on a phone.
           */
          borderWidth="0"
          bg="transparent"
          paddingInline="0"
          minH={componentTokens.control.minTouchTarget}
        />

        {tags.length === 0 ? null : (
          <Flex
            as="ul"
            gap={space[2]}
            flexWrap="wrap"
            marginBlockStart={space[3]}
            listStyleType="none"
          >
            {tags.map((tag) => (
              <Flex as="li" key={tag} align="center" gap={space[1]}>
                <Chip>{tag}</Chip>
                <IconButton
                  size="sm"
                  tone="quiet"
                  // The tag is in the name, so eight remove buttons are eight
                  // different controls rather than eight identical ones.
                  label={`Remove the tag ${tag}`}
                  icon={<FiX aria-hidden="true" />}
                  isDisabled={isDisabled}
                  onClick={() => onChange(removeTag(tags, tag))}
                />
              </Flex>
            ))}
          </Flex>
        )}
      </Box>
    </Field>
  )
}

/**
 * Horizon Design System v2 - the draft's metadata bar.
 *
 * Title, subtitle and tags, plus the author chip and the publication badge. It
 * replaces the legacy `EditorMetaBar`, which mixed the author card, the save
 * status and the draft badge into one panel.
 *
 * The title is a `textarea` rather than an `input`. A blog title regularly runs
 * past one line at 375px, and an input truncates it into a horizontal scroller
 * that hides the beginning of the sentence the author is trying to read back.
 */

import type { ReactNode } from 'react'
import { Flex } from '@chakra-ui/react'

import { space } from '../../../theme/tokens'
import { Field, Textarea } from '../../components/forms'
import { Stack } from '../../components/layout'
import { StatusBadge } from '../../components/status'
import { Text } from '../../components/typography'
import { Avatar } from '../account/AvatarEditor'
import { publicationCopy, type PublicationState } from './schedule.logic'

export interface MetadataBarProps {
  title: string
  onTitleChange: (title: string) => void
  /** The publication state of the record. Drives the badge, truthfully. */
  publication?: PublicationState
  /** The tag field. Passed in so this bar does not own tag rules. */
  tagField?: ReactNode
  /** The author, for the workspace's own reassurance about whose draft this is. */
  author?: { name: string; avatarUrl?: string | null }
  isDisabled?: boolean
  /** A validation message for the title. */
  titleError?: string
}

export function MetadataBar({
  title,
  onTitleChange,
  publication = 'draft',
  tagField,
  author,
  isDisabled = false,
  titleError,
}: MetadataBarProps) {
  const copy = publicationCopy(publication)

  return (
    <Stack gap={4}>
      <Flex align="center" justify="space-between" gap={space[3]} flexWrap="wrap">
        {/*
         * The badge is `isLive`, so a draft that becomes "Draft · scheduled"
         * while the author is looking at the page is announced rather than
         * silently changing colour.
         */}
        <StatusBadge tone={copy.tone} isLive>
          {copy.badge}
        </StatusBadge>

        {author === undefined ? null : (
          <Flex align="center" gap={space[2]}>
            <Avatar name={author.name} src={author.avatarUrl} size="sm" />
            <Text recipe="metadata" as="span">
              {author.name}
            </Text>
          </Flex>
        )}
      </Flex>

      <Field label="Title" labelHidden error={titleError} isDisabled={isDisabled}>
        <Textarea
          rows={2}
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="Give this piece a title"
          textStyle="pageTitle"
          resize="none"
        />
      </Field>

      {tagField}
    </Stack>
  )
}

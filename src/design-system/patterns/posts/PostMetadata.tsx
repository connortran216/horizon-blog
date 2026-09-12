/**
 * Horizon Design System v2 - the facts about a post.
 *
 * The second shared content contract. Author, date, reading time and Series
 * position, in one fixed order, with the absent ones dropped rather than
 * rendered as an em dash.
 *
 * Two details are load-bearing:
 *
 * - The separator is a real `span` marked `aria-hidden`, not a `::before`.
 *   Generated content is announced by some screen readers as a bullet and
 *   ignored by others, so a metadata line built from pseudo-elements reads
 *   differently on two machines.
 * - The date is a `time` element with a machine-readable `datetime`, which is
 *   what lets a reader's own tooling and a search engine agree with the words
 *   on the page.
 */

import { forwardRef } from 'react'
import { Box } from '@chakra-ui/react'

import { space } from '../../../theme/tokens'
import { ActionLink } from '../../components/actions'
import { Metadata, type MetadataProps } from '../../components/typography'
import { AuthorIdentity } from './AuthorIdentity'
import {
  postMetadataItems,
  type PostMetadataContent,
  type PostMetadataItem,
  type PostMetadataOptions,
} from './content.logic'

export interface PostMetadataProps extends Omit<MetadataProps, 'children'>, PostMetadataOptions {
  /**
   * The facts. Named `metadata` rather than `content` because `content` is a
   * Chakra style prop, and a prop that shadows one is a type error waiting for
   * the first person who spreads `BoxProps` onto this component.
   */
  metadata: PostMetadataContent
  /** Show the author as a portrait and name rather than as a bare name. */
  withAuthorAvatar?: boolean
}

function ItemLabel({ item }: { item: PostMetadataItem }) {
  const spoken = item.srPrefix ? `${item.srPrefix}: ${item.label}` : undefined

  if (item.kind === 'date') {
    return (
      <Box as="time" dateTime={item.machineDate} aria-label={spoken}>
        {item.label}
      </Box>
    )
  }

  if (item.href) {
    return (
      <ActionLink to={item.href} underline="hover" aria-label={spoken} color="text.secondary">
        {item.label}
      </ActionLink>
    )
  }

  return (
    <Box as="span" aria-label={spoken}>
      {item.label}
    </Box>
  )
}

export const PostMetadata = forwardRef<HTMLElement, PostMetadataProps>(function PostMetadata(
  {
    metadata,
    showAuthor = true,
    showSeries = true,
    showReadingTime = true,
    withAuthorAvatar = false,
    ...rest
  },
  ref,
) {
  const items = postMetadataItems(metadata, { showAuthor, showSeries, showReadingTime })

  if (items.length === 0) {
    return null
  }

  return (
    <Metadata ref={ref} {...rest}>
      {items.map((item, index) => (
        <Box key={item.kind} display="flex" alignItems="center" gap={space[2]} minW={0}>
          {index > 0 ? (
            <Box as="span" aria-hidden="true" color="text.muted">
              ·
            </Box>
          ) : null}
          {item.kind === 'author' && withAuthorAvatar ? (
            <AuthorIdentity author={metadata.author} size="sm" />
          ) : (
            <ItemLabel item={item} />
          )}
        </Box>
      ))}
    </Metadata>
  )
})

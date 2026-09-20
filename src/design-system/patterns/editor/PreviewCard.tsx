/**
 * Horizon Design System v2 - the publication preview card.
 *
 * "This is how the post will look on the site." It replaces the legacy
 * `PublishBlogPreviewCard`.
 *
 * Two honesty constraints shape it:
 *
 * - The date shown is the date the post *would* carry, and it is labelled with
 *   which one that is - today for an immediate publication, the scheduled
 *   moment otherwise. A preview showing today's date under a schedule set for
 *   next week is a small lie the author will not notice until a reader does.
 * - It is explicitly marked as a preview in the accessibility tree as well as
 *   visually, so it is not mistaken for the live article by someone who cannot
 *   see the surrounding panel.
 */

import { Box, Flex } from '@chakra-ui/react'
import { FiClock } from 'react-icons/fi'

import { space } from '../../../theme/tokens'
import { Stack } from '../../components/layout'
import { Surface } from '../../components/surface'
import { Chip } from '../../components/status'
import { Eyebrow, Heading, Metadata, Text } from '../../components/typography'
import { ResponsiveImage, type ImageSource } from '../../components/media'
import { Avatar } from '../account/AvatarEditor'

export interface PreviewCardProps {
  title: string
  excerpt?: string
  coverUrl?: string | null
  /**
   * Width-descriptor candidates for the cover, when the caller has resolved
   * media variants. Paired with `coverSizes`; see `ResponsiveImage`'s own
   * `sources`/`sizes`.
   */
  coverSources?: readonly ImageSource[]
  /** The `sizes` attribute for the cover. Pair it with `coverSources`. */
  coverSizes?: string
  /** Describes the cover. Required whenever `coverUrl` is set. */
  coverAlt?: string
  tags?: readonly string[]
  author?: { name: string; avatarUrl?: string | null }
  /** The date the post would carry, already formatted by the caller. */
  publicationDate?: string
  /** What that date means: "Publishing today", "Scheduled for". */
  publicationDateLabel?: string
  readingTime?: string
  /** The kicker inside the card. */
  eyebrow?: string
}

export function PreviewCard({
  title,
  excerpt,
  coverUrl,
  coverSources,
  coverSizes,
  coverAlt,
  tags,
  author,
  publicationDate,
  publicationDateLabel = 'Publication date',
  readingTime,
  eyebrow = 'Preview',
}: PreviewCardProps) {
  return (
    <Surface
      as="article"
      depth="raised"
      padded={false}
      // Named for what it is. Without this a screen-reader user landing on the
      // card by heading navigation has no way to tell it from a real post.
      aria-label={`Preview of ${title || 'this untitled draft'}`}
    >
      <ResponsiveImage
        aspectRatio="16 / 9"
        radius="card"
        src={coverUrl}
        sources={coverSources}
        sizes={coverSizes}
        {...(coverUrl && coverAlt ? { alt: coverAlt } : { decorative: true as const })}
        task="the cover image"
        absentCaption={title || 'Untitled draft'}
      />

      <Stack gap={4} padding={space[6]}>
        <Eyebrow as="p">{eyebrow}</Eyebrow>

        <Heading recipe="cardTitle" as="h3">
          {title || 'Untitled draft'}
        </Heading>

        {excerpt === undefined || excerpt.trim().length === 0 ? (
          <Text recipe="body" color="text.muted">
            This draft has no opening paragraph yet.
          </Text>
        ) : (
          <Text recipe="body" lineClamp={4}>
            {excerpt}
          </Text>
        )}

        {tags === undefined || tags.length === 0 ? null : (
          <Flex as="ul" gap={space[2]} flexWrap="wrap" listStyleType="none">
            {tags.map((tag) => (
              // `minWidth={0}` overrides the flex item's default `auto`, which
              // floors it at the tag's own content width and defeats the
              // Chip's own shrink-and-truncate behaviour before it can apply.
              <Box as="li" key={tag} minWidth={0}>
                <Chip>{tag}</Chip>
              </Box>
            ))}
          </Flex>
        )}

        <Metadata as="ul">
          {author === undefined ? null : (
            <Box as="li" display="inline-flex" alignItems="center" gap={space[2]}>
              <Avatar name={author.name} src={author.avatarUrl} size="sm" />
              {author.name}
            </Box>
          )}

          {publicationDate === undefined ? null : (
            <Box as="li">
              {/*
               * The label travels with the date. "Scheduled for 12 Mar" and
               * "Publishing today" are different claims and must not render as
               * the same bare date string.
               */}
              <Box as="span" color="text.secondary">
                {publicationDateLabel}:
              </Box>{' '}
              {publicationDate}
            </Box>
          )}

          {readingTime === undefined ? null : (
            <Box as="li" display="inline-flex" alignItems="center" gap={space[1]}>
              <Box as={FiClock} aria-hidden="true" />
              {readingTime}
            </Box>
          )}
        </Metadata>
      </Stack>
    </Surface>
  )
}

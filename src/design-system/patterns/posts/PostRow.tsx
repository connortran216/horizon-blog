/**
 * Horizon Design System v2 - a post as a row.
 *
 * The dense listing form: a thumbnail beside a title, used for Related posts,
 * the Home "latest writing" list and the author archive list. It owns no
 * surface of its own - it sits on the page and is separated from its siblings
 * by a rule - which is the third of the three ways this system draws a post and
 * the reason a row can never be confused with a card.
 *
 * `compact` drops the excerpt. On a 375px screen the thumbnail plus two lines
 * of title already fill the row, and a clamped excerpt underneath turns a
 * scannable list into a wall.
 */

import { forwardRef } from 'react'
import { Box, type BoxProps } from '@chakra-ui/react'

import { space } from '../../../theme/tokens'
import { ActionLink } from '../../components/actions'
import type { HeadingElement } from '../../components/layout'
import { ResponsiveImage } from '../../components/media'
import { Eyebrow, Heading, Text } from '../../components/typography'
import { PostMetadata } from './PostMetadata'
import { excerptOrNull, type PostSummary } from './content.logic'
import { resolveHierarchyLabel } from './hierarchy.logic'
import { cardLinkOverlayStyle, postPresentation } from './presentation.logic'

export interface PostRowProps extends Omit<BoxProps, 'children' | 'as'> {
  post: PostSummary
  /** Hide the excerpt and tighten the row. */
  compact?: boolean
  label?: string | null
  sectionLabels?: readonly string[]
  titleAs?: HeadingElement
  /** Hide the thumbnail entirely - a text-only list of parts, for instance. */
  showCover?: boolean
}

export const PostRow = forwardRef<HTMLElement, PostRowProps>(function PostRow(
  { post, compact = false, label, sectionLabels = [], titleAs = 'h3', showCover = true, ...rest },
  ref,
) {
  const presentation = postPresentation('row')
  const resolvedLabel = resolveHierarchyLabel(label, sectionLabels)
  const excerpt = compact ? null : excerptOrNull(post.excerpt)

  return (
    <Box
      ref={ref}
      as="article"
      position="relative"
      display="grid"
      gridTemplateColumns={showCover ? { base: '88px 1fr', sm: '144px 1fr' } : '1fr'}
      alignItems="center"
      gap={{ base: space[3], sm: space[6] }}
      paddingBlock={space[4]}
      {...rest}
    >
      {showCover ? (
        <ResponsiveImage
          aspectRatio={presentation.coverAspectRatio}
          radius={presentation.coverRadius}
          src={post.cover?.src}
          sources={post.cover?.sources}
          sizes={post.cover?.sizes ?? '144px'}
          /*
           * Decorative here, and only here. The row's title link sits inches
           * away and names the same post; describing the thumbnail as well
           * makes a screen reader read the article twice before the reader can
           * decide whether to open it.
           */
          decorative
          task="the cover image"
        />
      ) : null}

      <Box minW={0} display="flex" flexDirection="column" gap={space[2]}>
        {resolvedLabel ? <Eyebrow as="p">{resolvedLabel}</Eyebrow> : null}

        <Heading as={titleAs} recipe={presentation.titleRecipe}>
          <ActionLink
            to={post.href}
            underline="hover"
            color="text.primary"
            _after={cardLinkOverlayStyle()}
          >
            {post.title}
          </ActionLink>
        </Heading>

        {excerpt ? (
          <Text recipe="body" lineClamp={presentation.excerptLines}>
            {excerpt}
          </Text>
        ) : null}

        <Box position="relative" zIndex={1}>
          <PostMetadata metadata={post.metadata} />
        </Box>
      </Box>
    </Box>
  )
})

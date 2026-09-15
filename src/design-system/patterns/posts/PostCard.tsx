/**
 * Horizon Design System v2 - the ordinary post card.
 *
 * The workhorse of Blog, the author archive and Related posts. Deliberately
 * quieter than `SignatureStory` and `FeaturedStory`: the card radius, the card
 * title ramp, a 16/9 cover. `presentation.logic.ts` holds that separation and
 * `presentation.test.ts` proves it, because "these two look different" is the
 * kind of claim that decays quietly.
 *
 * The cover is full-bleed, matching the approved prototype's `.article-card`.
 *
 * `CONVENTIONS.md` gives border, radius and clipping to one owner, and that
 * owner here is the `Surface`: it draws the card radius and clips to it, so it
 * renders unpadded and the copy block below the cover takes the card padding
 * over (the prototype's `.card-copy`). The cover declines its own corners with
 * `radius="container"` and renders square, which is the frame saying in its own
 * API that its container owns them - not an override written onto it from here.
 * Nothing in this file sets a radius, a border or a clip.
 *
 * `padded` is not in the props for the same reason `depth` is not: where the
 * card padding sits follows from the cover bleeding, so it is the card's to
 * decide and not a caller's.
 */

import { forwardRef } from 'react'
import { Box } from '@chakra-ui/react'

import { componentTokens, space } from '../../../theme/tokens'
import { ActionLink } from '../../components/actions'
import { Stack } from '../../components/layout'
import type { HeadingElement } from '../../components/layout'
import { ResponsiveImage, type MediaFit } from '../../components/media'
import { Chip } from '../../components/status'
import { Surface, type SurfaceProps } from '../../components/surface'
import { Eyebrow, Heading, Text } from '../../components/typography'
import { PostMetadata } from './PostMetadata'
import { excerptOrNull, visibleTags, type PostSummary } from './content.logic'
import { resolveHierarchyLabel } from './hierarchy.logic'
import { cardLinkOverlayStyle, coverBleeds, postPresentation } from './presentation.logic'
import { useCoverTransitionNavigate } from './useCoverTransitionNavigate'

export interface PostCardProps extends Omit<SurfaceProps, 'children' | 'depth' | 'as' | 'padded'> {
  post: PostSummary
  /**
   * A short editorial label - "Signature", "Most read". Resolved against
   * `sectionLabels` and dropped when it would only echo the section heading.
   */
  label?: string | null
  /**
   * Words the enclosing section has already said. Pass the section's eyebrow
   * and heading; see `hierarchy.logic.ts` for why.
   */
  sectionLabels?: readonly string[]
  /** Heading rank. The visual size is fixed; the outline is the caller's. */
  titleAs?: HeadingElement
  /** `sizes` for the cover. The grid knows its columns; this component does not. */
  coverSizes?: string
  /**
   * Whether the cover is cropped to fill its frame (`cover`, the default) or
   * kept whole inside it (`contain`).
   *
   * It is a caller's decision because only the caller knows the artwork: a
   * photographic cover is better edge to edge, and a cover whose composition
   * runs to its own edges is better complete. It is a named prop rather than an
   * `sx` reaching for the `img` inside this card because the picture belongs to
   * `ResponsiveImage` - see `CONVENTIONS.md` rule 4. The reserved 16/9 box is
   * identical either way.
   */
  coverFit?: MediaFit
  /**
   * The cover's `view-transition-name`, shared with the reading page's own
   * cover so the two can morph into each other - see
   * `postCoverTransitionName`. Also gates whether the title link's plain
   * click runs its navigation inside a view transition; see
   * `useCoverTransitionNavigate`. Omitted, this card behaves exactly as
   * before.
   */
  coverTransitionName?: string
}

export const PostCard = forwardRef<HTMLElement, PostCardProps>(function PostCard(
  {
    post,
    label,
    sectionLabels = [],
    titleAs = 'h3',
    coverSizes = '(min-width: 801px) 33vw, 100vw',
    coverFit,
    coverTransitionName,
    ...rest
  },
  ref,
) {
  const presentation = postPresentation('card')
  const bleeds = coverBleeds('card')
  const resolvedLabel = resolveHierarchyLabel(label, sectionLabels)
  const excerpt = excerptOrNull(post.excerpt)
  const tags = visibleTags(post.tags, presentation.tagLimit)
  const handleTitleClick = useCoverTransitionNavigate(coverTransitionName ? post.href : null)

  return (
    <Surface
      ref={ref}
      as="article"
      depth="raised"
      isInteractive
      /*
       * A bleeding cover cannot sit inside the surface padding, so the surface
       * gives the padding up and the copy block below takes it over. The two
       * read from one decision, so neither can drift from the other.
       */
      padded={!bleeds}
      position="relative"
      display="flex"
      flexDirection="column"
      height="100%"
      {...rest}
    >
      <ResponsiveImage
        aspectRatio={presentation.coverAspectRatio}
        radius={presentation.coverRadius}
        fit={coverFit}
        src={post.cover?.src}
        sources={post.cover?.sources}
        sizes={post.cover?.sizes ?? coverSizes}
        alt={post.cover?.alt ?? post.title}
        task="the cover image"
        absentCaption={post.title}
        // The frame reserves 16/9 in every media state; a flex column would
        // otherwise be free to shrink it once the copy is tall.
        frameProps={{ flexShrink: 0 }}
        viewTransitionName={coverTransitionName}
      />

      <Stack gap={4} flex="1" padding={bleeds ? componentTokens.card.padding : undefined}>
        {resolvedLabel ? <Eyebrow as="p">{resolvedLabel}</Eyebrow> : null}

        {tags.visible.length > 0 ? (
          <Box display="flex" flexWrap="wrap" gap={space[2]} position="relative" zIndex={1}>
            {tags.visible.map((tag) => (
              <Chip key={tag}>{tag}</Chip>
            ))}
            {tags.overflowLabel ? (
              <Chip aria-label={tags.overflowSrLabel ?? undefined}>{tags.overflowLabel}</Chip>
            ) : null}
          </Box>
        ) : null}

        <Heading as={titleAs} recipe={presentation.titleRecipe}>
          <ActionLink
            to={post.href}
            underline="hover"
            color="text.primary"
            onClick={handleTitleClick}
            /*
             * One anchor for the whole card. Everything above that must stay
             * clickable - the topic chips, the author link inside the metadata
             * - is raised out of this overlay by its own stacking context.
             */
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

        <Box marginTop="auto" position="relative" zIndex={1}>
          <PostMetadata metadata={post.metadata} />
        </Box>
      </Stack>
    </Surface>
  )
})

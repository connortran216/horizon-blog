/**
 * Horizon Design System v2 - the archive feature.
 *
 * One post lifted out of a listing. It is the Signature's sibling rather than
 * the card's: same editorial family, same feature radius, but a page-title ramp
 * instead of the display ramp and a bounded surface instead of a bare plate,
 * because it sits inside a results page rather than at the top of Home.
 *
 * The two-column split reverses nothing on mobile: the cover comes first at
 * every width, because a feature whose artwork appears below its own excerpt
 * stops looking like a feature.
 */

import { forwardRef } from 'react'
import { Box } from '@chakra-ui/react'
import { FiArrowRight } from 'react-icons/fi'

import { space } from '../../../theme/tokens'
import { ActionLink } from '../../components/actions'
import type { HeadingElement } from '../../components/layout'
import { ResponsiveImage } from '../../components/media'
import { Chip } from '../../components/status'
import { Surface, type SurfaceProps } from '../../components/surface'
import { Eyebrow, Heading, Text } from '../../components/typography'
import { PostMetadata } from './PostMetadata'
import { excerptOrNull, visibleTags, type PostSummary } from './content.logic'
import { resolveHierarchyLabel } from './hierarchy.logic'
import { postPresentation } from './presentation.logic'
import { useCoverTransitionNavigate } from './useCoverTransitionNavigate'

export interface FeaturedStoryProps extends Omit<SurfaceProps, 'children' | 'depth' | 'as'> {
  post: PostSummary
  label?: string | null
  sectionLabels?: readonly string[]
  actionLabel?: string
  titleAs?: HeadingElement
  /**
   * The cover's `view-transition-name`, shared with the reading page's own
   * cover so the two can morph into each other - see
   * `postCoverTransitionName`. Also gates whether the title and
   * call-to-action links' plain click runs its navigation inside a view
   * transition; see `useCoverTransitionNavigate`. Omitted, this pattern
   * behaves exactly as before.
   */
  coverTransitionName?: string
}

export const FeaturedStory = forwardRef<HTMLElement, FeaturedStoryProps>(function FeaturedStory(
  {
    post,
    label = 'Featured',
    sectionLabels = [],
    actionLabel = 'Read the featured blog',
    titleAs = 'h2',
    coverTransitionName,
    ...rest
  },
  ref,
) {
  const presentation = postPresentation('featured')
  const resolvedLabel = resolveHierarchyLabel(label, sectionLabels)
  const excerpt = excerptOrNull(post.excerpt)
  const tags = visibleTags(post.tags, presentation.tagLimit)
  const handleLinkClick = useCoverTransitionNavigate(coverTransitionName ? post.href : null)

  return (
    <Surface ref={ref} as="article" depth="feature" isInteractive position="relative" {...rest}>
      <Box
        display="grid"
        gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' }}
        gap={{ base: space[6], md: space[8] }}
        alignItems="center"
      >
        <ResponsiveImage
          aspectRatio={presentation.coverAspectRatio}
          radius={presentation.coverRadius}
          src={post.cover?.src}
          sources={post.cover?.sources}
          sizes={post.cover?.sizes ?? '(min-width: 801px) 50vw, 100vw'}
          alt={post.cover?.alt ?? post.title}
          task="the featured cover image"
          absentCaption={post.title}
          viewTransitionName={coverTransitionName}
        />

        <Box display="flex" flexDirection="column" gap={space[4]} minW={0}>
          {resolvedLabel ? <Eyebrow as="p">{resolvedLabel}</Eyebrow> : null}

          <Heading as={titleAs} recipe={presentation.titleRecipe}>
            <ActionLink
              to={post.href}
              underline="hover"
              color="text.primary"
              onClick={handleLinkClick}
            >
              {post.title}
            </ActionLink>
          </Heading>

          {excerpt ? (
            <Text recipe="body" lineClamp={presentation.excerptLines}>
              {excerpt}
            </Text>
          ) : null}

          <PostMetadata metadata={post.metadata} />

          {tags.visible.length > 0 ? (
            <Box display="flex" flexWrap="wrap" gap={space[2]}>
              {tags.visible.map((tag) => (
                <Chip key={tag}>{tag}</Chip>
              ))}
              {tags.overflowLabel ? (
                <Chip aria-label={tags.overflowSrLabel ?? undefined}>{tags.overflowLabel}</Chip>
              ) : null}
            </Box>
          ) : null}

          <Box>
            <ActionLink
              to={post.href}
              underline="hover"
              iconEnd={<FiArrowRight aria-hidden="true" />}
              aria-label={`${actionLabel}: ${post.title}`}
              color="action.primary"
              fontWeight="semibold"
              onClick={handleLinkClick}
            >
              {actionLabel}
            </ActionLink>
          </Box>
        </Box>
      </Box>
    </Surface>
  )
})

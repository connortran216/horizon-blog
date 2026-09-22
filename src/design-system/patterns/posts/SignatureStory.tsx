/**
 * Horizon Design System v2 - the Signature story.
 *
 * The single most prominent piece of writing on the site: one per page, at the
 * top of Home. It is not a large `PostCard` and it must never become one -
 * `DESIGN.md` lists "Building one universal card" as a non-goal, and the whole
 * point of a Signature is that a reader can tell at a glance that this one is
 * different from the six below it.
 *
 * What makes it different, concretely: the feature radius rather than the card
 * radius, the display type ramp rather than the card ramp, a wide 16/10 plate
 * rather than a 16/9 thumbnail, and a real call to action instead of a metadata
 * line doing double duty. Three of those four are asserted in
 * `presentation.test.ts`.
 *
 * The desktop Signature pointer light `DESIGN.md` approves is here as
 * `PointerLight`. An earlier version left it out because the prototype's
 * gradient was not a token; the `ambient.*` roles now exist for exactly this,
 * and the light is a horizon glare across the artwork rather than a spotlight
 * under the cursor. `Surface` at `feature` depth is the one owner of the
 * plate's border, radius, shadow and clipping; the image hands it its corners
 * and the light paints inside it. Entry motion is a `Reveal`, which respects
 * the motion policy, as does the light.
 */

import { forwardRef } from 'react'
import { Box, type BoxProps } from '@chakra-ui/react'
import { FiArrowRight } from 'react-icons/fi'

import { space } from '../../../theme/tokens'
import { ActionLink } from '../../components/actions'
import type { HeadingElement } from '../../components/layout'
import { ResponsiveImage } from '../../components/media'
import { Chip } from '../../components/status'
import { Surface } from '../../components/surface'
import { Eyebrow, Heading, Text } from '../../components/typography'
import { PointerLight, Reveal } from '../../motion'
import { PostMetadata } from './PostMetadata'
import { excerptOrNull, visibleTags, type PostSummary } from './content.logic'
import { resolveHierarchyLabel } from './hierarchy.logic'
import { postPresentation } from './presentation.logic'
import { useCoverTransitionNavigate } from './useCoverTransitionNavigate'

export interface SignatureStoryProps extends Omit<BoxProps, 'children' | 'as'> {
  post: PostSummary
  /** The editorial label. Defaults to the word the design contract uses. */
  label?: string | null
  sectionLabels?: readonly string[]
  /** Call-to-action wording. A concrete verb, per the content voice. */
  actionLabel?: string
  /** Heading rank. `h1` when the Signature is the page's own title. */
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

export const SignatureStory = forwardRef<HTMLElement, SignatureStoryProps>(function SignatureStory(
  {
    post,
    label = 'Signature',
    sectionLabels = [],
    actionLabel = 'Read the story',
    titleAs = 'h2',
    coverTransitionName,
    ...rest
  },
  ref,
) {
  const presentation = postPresentation('signature')
  const resolvedLabel = resolveHierarchyLabel(label, sectionLabels)
  const excerpt = excerptOrNull(post.excerpt)
  const tags = visibleTags(post.tags, presentation.tagLimit)
  const handleLinkClick = useCoverTransitionNavigate(coverTransitionName ? post.href : null)

  return (
    <Box
      ref={ref}
      as="article"
      display="grid"
      gridTemplateColumns={{ base: '1fr', lg: '1.17fr 1fr' }}
      gap={{ base: space[6], lg: space[12] }}
      alignItems="center"
      {...rest}
    >
      <Reveal duration="reveal">
        {/* The one place the system draws editorial depth on media. */}
        <Surface depth="feature" padded={false}>
          <PointerLight>
            <ResponsiveImage
              aspectRatio={presentation.coverAspectRatio}
              radius="container"
              src={post.cover?.src}
              sources={post.cover?.sources}
              sizes={post.cover?.sizes ?? '(min-width: 1001px) 55vw, 100vw'}
              alt={post.cover?.alt ?? post.title}
              task="the Signature artwork"
              absentCaption={post.title}
              loading="eager"
              viewTransitionName={coverTransitionName}
            />
          </PointerLight>
        </Surface>
      </Reveal>

      <Reveal duration="reveal" delay={0.08}>
        <Box display="flex" flexDirection="column" gap={space[4]}>
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

          <PostMetadata metadata={post.metadata} withAuthorAvatar />

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
              /*
               * The second link to the same place. It carries the post title in
               * its accessible name so a screen reader listing every link on
               * Home does not hear "Read the story" with no subject.
               */
              aria-label={`${actionLabel}: ${post.title}`}
              color="action.primary"
              fontWeight="semibold"
              onClick={handleLinkClick}
            >
              {actionLabel}
            </ActionLink>
          </Box>
        </Box>
      </Reveal>
    </Box>
  )
})

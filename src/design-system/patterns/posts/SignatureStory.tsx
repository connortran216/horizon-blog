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
 * The prototype's pointer-tracking light is deliberately absent. Its own final
 * stylesheet disables it (`.signature-light:after { display: none }`), the
 * gradient it used is not a token, and `DESIGN.md` puts "random glow" under
 * Avoid. Entry motion is a `Reveal`, which respects the motion policy.
 */

import { forwardRef } from 'react'
import { Box, type BoxProps } from '@chakra-ui/react'
import { FiArrowRight } from 'react-icons/fi'

import { space } from '../../../theme/tokens'
import { ActionLink } from '../../components/actions'
import type { HeadingElement } from '../../components/layout'
import { ResponsiveImage } from '../../components/media'
import { Chip } from '../../components/status'
import { Eyebrow, Heading, Text } from '../../components/typography'
import { Reveal } from '../../motion'
import { PostMetadata } from './PostMetadata'
import { excerptOrNull, visibleTags, type PostSummary } from './content.logic'
import { resolveHierarchyLabel } from './hierarchy.logic'
import { postPresentation } from './presentation.logic'

export interface SignatureStoryProps extends Omit<BoxProps, 'children' | 'as'> {
  post: PostSummary
  /** The editorial label. Defaults to the word the design contract uses. */
  label?: string | null
  sectionLabels?: readonly string[]
  /** Call-to-action wording. A concrete verb, per the content voice. */
  actionLabel?: string
  /** Heading rank. `h1` when the Signature is the page's own title. */
  titleAs?: HeadingElement
}

export const SignatureStory = forwardRef<HTMLElement, SignatureStoryProps>(function SignatureStory(
  {
    post,
    label = 'Signature',
    sectionLabels = [],
    actionLabel = 'Read the story',
    titleAs = 'h2',
    ...rest
  },
  ref,
) {
  const presentation = postPresentation('signature')
  const resolvedLabel = resolveHierarchyLabel(label, sectionLabels)
  const excerpt = excerptOrNull(post.excerpt)
  const tags = visibleTags(post.tags, presentation.tagLimit)

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
        <ResponsiveImage
          aspectRatio={presentation.coverAspectRatio}
          radius={presentation.coverRadius}
          src={post.cover?.src}
          sources={post.cover?.sources}
          sizes={post.cover?.sizes ?? '(min-width: 1001px) 55vw, 100vw'}
          alt={post.cover?.alt ?? post.title}
          task="the Signature artwork"
          absentCaption={post.title}
          /* The one place the system draws editorial depth on media. */
          frameProps={{ boxShadow: 'card' }}
          loading="eager"
        />
      </Reveal>

      <Reveal duration="reveal" delay={0.08}>
        <Box display="flex" flexDirection="column" gap={space[4]}>
          {resolvedLabel ? <Eyebrow as="p">{resolvedLabel}</Eyebrow> : null}

          <Heading as={titleAs} recipe={presentation.titleRecipe}>
            <ActionLink to={post.href} underline="hover" color="text.primary">
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
            >
              {actionLabel}
            </ActionLink>
          </Box>
        </Box>
      </Reveal>
    </Box>
  )
})

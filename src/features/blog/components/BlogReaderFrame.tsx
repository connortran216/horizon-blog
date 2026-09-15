/**
 * The reading page's frame.
 *
 * Composition over the design system's `ReaderFrame`: a table-of-contents rail
 * beside the reading column on a wide screen, a disclosure above the article on
 * a narrow one, and the regions in the order `DESIGN.md` fixes them - identity,
 * metadata, prose, Series context, feedback, discussion, related. The slot order
 * is the frame's, not this file's, which is what stops reader feedback drifting
 * up beside the byline.
 *
 * No renderer changed. Crepe still renders the article; `Prose` is the frame
 * around it and owns the measure, the link and code contrast, the rule that
 * nothing inside may widen the document, and what is shown when the renderer
 * fails or the article has no body.
 *
 * What left with the migration: `MotionWrapper`, `TitleAnimation`,
 * `ContentAnimation`, `BackButtonAnimation`, `FocusRing`, `AnimatedPrimaryButton`
 * and `LoadingState` from `src/components/core/animations`, the hand-rolled
 * scroll listener, the Chakra `Progress` bar with its hard-coded CSS variable,
 * and the 260px `blur(120px)` ambient plate - ambient movement and decorative
 * depth belong to Home and About, not to a reading surface.
 */

import {
  MouseEventHandler,
  ReactNode,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Box } from '@chakra-ui/react'
import { FiArrowLeft } from 'react-icons/fi'

import {
  ActionLink,
  AuthorIdentity,
  Button,
  Chip,
  Heading,
  InlineLoading,
  Metadata,
  Prose,
  ReaderFrame,
  ReadingProgress,
  ResponsiveImage,
  Section,
  Stack,
  formatPostDate,
  localScrollStyle,
  postPresentation,
  useMotionPolicy,
  type ReaderHeading,
} from '../../../design-system'
import { componentTokens, space, transitionFor } from '../../../theme/tokens'
import { ErrorBoundary } from '../../../core/components/ErrorBoundary'
import { BlogArchivePost } from '../blog.types'
import { getPostAuthorAvatar, getPostAuthorName } from '../blog.utils'
import type { ResolveMediaSourceResult } from '../../media/media.api'
import { applyResponsiveMediaAttributes } from '../../media/media.presentation'
import { useReaderHeadings } from '../useReaderHeadings'

const LazyCrepeEditor = lazy(() => import('../../../components/editor/CrepeEditor'))

const RENDER_FAILURE = 'The article body could not be rendered.'

/**
 * The reading page's cover borrows the Signature's proportions - the same
 * wide editorial plate Home and the archive Feature use - rather than
 * inventing a fifth cover shape for one more post surface.
 */
const READER_COVER_PRESENTATION = postPresentation('signature')

/**
 * One frozen empty list, not a fresh `[]` per render. `useReaderHeadings`
 * depends on the array's identity, and a new one every render would tear its
 * scroll subscription down and build it again on every state change.
 */
const NO_HEADINGS: readonly ReaderHeading[] = []

/**
 * Wide content inside the Crepe surface scrolls inside itself.
 *
 * `Prose` already says this, by descendant selector, for every `pre` and
 * `table` below it. It is not enough here and the reason is pure cascade
 * arithmetic: `crepe-theme.css` carries `.crepe-editor-wrapper table`, which
 * has exactly the specificity of the `.css-hash table` Emotion compiles `Prose`
 * into, so which one wins is decided by which stylesheet was injected last -
 * and the editor's CSS arrives with a lazily imported chunk, after Emotion's.
 * A single wide table then widens the whole document at 375px.
 *
 * So the same rule is restated one level more specific, from the design
 * system's own `localScrollStyle` rather than from a second opinion about
 * overflow. Reported as a design-system gap: `Prose` cannot outrank a
 * stylesheet it does not know about.
 */
const CREPE_LOCAL_SCROLL = {
  '& .crepe-editor-wrapper pre, & .crepe-editor-wrapper table, & .milkdown pre, & .milkdown table':
    { ...localScrollStyle(), display: 'block' },
} as const

interface BlogReaderFrameProps {
  post: BlogArchivePost | null
  loading: boolean
  resolvedContent: string
  resolvedMedia?: ResolveMediaSourceResult
  onBack: () => void
  backLabel: string
  /** Why there is no article. A transport failure rather than a missing one. */
  loadError?: string | null
  /** The article does not exist, or is not published. */
  isMissing?: boolean
  authorArchivePath?: string | null
  /**
   * The article's cover, when one was found. `/posts/:id` carries no
   * dedicated cover field - only `content_markdown` - so the page derives
   * this from the same markdown the article renders, one level up, and hands
   * it down already resolved; this frame only draws it.
   */
  coverImage?: { src: string; alt: string } | null
  /**
   * Shared with the departing list or Home cover so the two can morph into
   * each other under the View Transitions API - see
   * `postCoverTransitionName`. Meaningless without `coverImage`.
   */
  coverTransitionName?: string | null
  showReadingProgress?: boolean
  /** The headings the table of contents lists. Empty hides it entirely. */
  headings?: readonly ReaderHeading[]
  titleSection?: ReactNode
  /** A note about this reading view, beside the opening metadata. */
  helperSection?: ReactNode
  /** Where this blog sits in its Series. After the prose, per `DESIGN.md`. */
  seriesSection?: ReactNode
  interactionSection?: ReactNode
  discussionSection?: ReactNode
  relatedSection?: ReactNode
  onReadingProgressChange?: (progressPercent: number) => void
  onContentClick?: MouseEventHandler<HTMLElement>
}

const BlogReaderFrame = ({
  post,
  loading,
  resolvedContent,
  resolvedMedia = {},
  onBack,
  backLabel,
  loadError = null,
  isMissing = false,
  authorArchivePath,
  coverImage = null,
  coverTransitionName = null,
  showReadingProgress = false,
  headings = NO_HEADINGS,
  titleSection,
  helperSection,
  seriesSection,
  interactionSection,
  discussionSection,
  relatedSection,
  onReadingProgressChange,
  onContentClick,
}: BlogReaderFrameProps) => {
  const policy = useMotionPolicy()
  const contentRef = useRef<HTMLDivElement>(null)
  const articleMediaRef = useRef<HTMLDivElement>(null)
  const [renderError, setRenderError] = useState<string | null>(null)
  const activeHeading = useReaderHeadings({
    headings,
    contentRef,
    smoothDeepLink: !policy.reduced,
  })

  useEffect(() => {
    const root = articleMediaRef.current
    if (!root || Object.keys(resolvedMedia).length === 0) return

    const apply = () => applyResponsiveMediaAttributes(root, resolvedMedia)
    apply()
    if (typeof MutationObserver === 'undefined') return

    const observer = new MutationObserver(apply)
    observer.observe(root, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [resolvedContent, resolvedMedia])

  /*
   * In-page navigation - a table-of-contents entry, a heading link inside the
   * article - eases under full motion and jumps under reduced motion. It was
   * previously set unconditionally, which is exactly the kind of document-wide
   * movement the reduced-motion policy exists to stop.
   */
  useEffect(() => {
    if (typeof document === 'undefined' || policy.reduced) {
      return
    }

    document.documentElement.style.scrollBehavior = 'smooth'

    return () => {
      document.documentElement.style.scrollBehavior = ''
    }
  }, [policy.reduced])

  useEffect(() => {
    setRenderError(null)
  }, [resolvedContent])

  const handleRenderFailure = useCallback(() => setRenderError(RENDER_FAILURE), [])
  const retryRender = useCallback(() => setRenderError(null), [])

  if (loading || loadError || isMissing || !post) {
    return (
      <Section as="div">
        <ReaderFrame
          isLoading={loading}
          error={loadError}
          isMissing={!loading && !loadError}
          /*
           * Where "onward" goes is this application's routing, so the page
           * supplies it and `ReaderFrame` only places it. A missing blog used
           * to render one grey sentence with no heading and nothing to click,
           * while a missing Series - the same kind of dead end - already
           * offered a title and two ways out.
           */
          recovery={
            <>
              <ActionLink
                to="/blog"
                underline="hover"
                iconStart={<FiArrowLeft aria-hidden="true" />}
              >
                All blogs
              </ActionLink>
              <ActionLink to="/series" underline="hover">
                Browse series
              </ActionLink>
            </>
          }
        />
      </Section>
    )
  }

  const authorName = getPostAuthorName(post)
  const authorAvatar = getPostAuthorAvatar(post)
  const tags = post.tags?.filter((tag) => tag.name.trim()) || []
  const created = formatPostDate(post.created_at)
  const updated = post.created_at === post.updated_at ? null : formatPostDate(post.updated_at)

  return (
    <>
      {/*
       * One measurement, one listener. The bar publishes its own percentage, so
       * the milestone events the reader session records are the number the
       * reader can see rather than a second opinion about it.
       */}
      {showReadingProgress ? (
        <ReadingProgress
          contentRef={contentRef}
          resetKey={post.id}
          onChange={onReadingProgressChange}
        />
      ) : null}

      <Section as="div">
        <ReaderFrame
          headings={headings}
          activeHeadingId={activeHeading}
          contentRef={contentRef}
          identity={
            <Stack gap={4}>
              <Button
                tone="quiet"
                onClick={onBack}
                alignSelf="flex-start"
                iconStart={<FiArrowLeft aria-hidden="true" />}
              >
                {backLabel}
              </Button>

              {titleSection || (
                <Heading as="h1" recipe="pageTitle">
                  {post.title}
                </Heading>
              )}
            </Stack>
          }
          metadata={
            <Stack gap={4}>
              <Metadata as="div">
                {/*
                 * The portrait and the name are identity, the archive link is
                 * navigation. They used to be two links to the same place in
                 * one row - the name and a separate "View archive" - which is
                 * two stops in a screen reader's link list for one destination.
                 */}
                <AuthorIdentity author={{ name: authorName, avatarUrl: authorAvatar }} size="md" />

                {created ? (
                  <>
                    <Box as="span" aria-hidden="true">
                      ·
                    </Box>
                    <Box as="time" dateTime={created.machine}>
                      {created.label}
                    </Box>
                  </>
                ) : null}

                {updated ? (
                  <>
                    <Box as="span" aria-hidden="true">
                      ·
                    </Box>
                    <Box as="time" dateTime={updated.machine}>
                      Updated {updated.label}
                    </Box>
                  </>
                ) : null}

                {authorArchivePath ? (
                  <>
                    <Box as="span" aria-hidden="true">
                      ·
                    </Box>
                    {/*
                     * An ordinary link. The archive resolves which author it is
                     * showing from the URL alone, so this carries no router state
                     * - a link that only works when it is clicked from inside the
                     * app is not a link a reader can share.
                     */}
                    <ActionLink
                      to={authorArchivePath}
                      color={componentTokens.reader.link}
                      transition={transitionFor('color', 'fast')}
                    >
                      View archive
                    </ActionLink>
                  </>
                ) : null}
              </Metadata>

              {tags.length > 0 ? (
                <Box
                  as="ul"
                  aria-label="Blog tags"
                  display="flex"
                  flexWrap="wrap"
                  gap={space[2]}
                  listStyleType="none"
                  margin={0}
                  padding={0}
                >
                  {tags.map((tag) => (
                    <Box as="li" key={tag.id}>
                      <Chip>#{tag.name}</Chip>
                    </Box>
                  ))}
                </Box>
              ) : null}

              {helperSection}
            </Stack>
          }
          cover={
            coverImage ? (
              <ResponsiveImage
                aspectRatio={READER_COVER_PRESENTATION.coverAspectRatio}
                radius={READER_COVER_PRESENTATION.coverRadius}
                src={coverImage.src}
                alt={coverImage.alt}
                sizes="(min-width: 1001px) 800px, 100vw"
                task="the article cover"
                loading="eager"
                viewTransitionName={coverTransitionName ?? undefined}
              />
            ) : null
          }
          seriesContext={seriesSection}
          feedback={interactionSection}
          discussion={discussionSection}
          related={relatedSection}
        >
          <Prose
            renderError={renderError}
            onRetryRender={retryRender}
            emptyMessage="This blog has no content yet."
          >
            {resolvedContent ? (
              <Box ref={articleMediaRef} minW={0} onClick={onContentClick} sx={CREPE_LOCAL_SCROLL}>
                <ErrorBoundary onError={handleRenderFailure} fallback={<Box aria-hidden="true" />}>
                  <Suspense fallback={<InlineLoading task="the article" />}>
                    <LazyCrepeEditor
                      initialContent={resolvedContent}
                      readOnly
                      inputId="blog-content-reader"
                      inputName="blogContentReader"
                    />
                  </Suspense>
                </ErrorBoundary>
              </Box>
            ) : null}
          </Prose>
        </ReaderFrame>
      </Section>
    </>
  )
}

export default BlogReaderFrame

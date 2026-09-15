/**
 * Horizon Design System v2 - the reading page's frame.
 *
 * A TOC rail beside a reading column on a wide screen; one column, with the TOC
 * as a disclosure above the article, on a narrow one. The reading column is a
 * `ProseMeasure`, so the measure is the same 68ch whatever is around it.
 *
 * The slots are named after the regions in `reader.logic.ts`, and they are in
 * that order in the markup. That is what makes `dsv2.5.3` acceptance 3
 * structural rather than a matter of discipline: there is no slot between
 * `metadata` and `prose` that a reaction bar could be passed into, so feedback
 * cannot migrate up into the opening metadata without changing this file and
 * failing `reader.test.ts`.
 */

import { forwardRef, type ForwardedRef, type ReactNode, type RefObject } from 'react'
import { Box } from '@chakra-ui/react'

import { space } from '../../../theme/tokens'
import { ContentContainer, type ContentContainerProps } from '../../components/layout'
import { ErrorState, MissingState, PageLoading, RetryAction } from '../../components/feedback'
import { Heading } from '../../components/typography'
import { TOC } from './TOC'
import type { ReaderHeading } from './reader.logic'

export interface ReaderFrameProps extends Omit<ContentContainerProps, 'as' | 'children' | 'title'> {
  /** Article identity: the back link, the Series label, the title. */
  identity?: ReactNode
  /** The opening metadata: author, date, reading time, topics. No feedback. */
  metadata?: ReactNode
  cover?: ReactNode
  /** The prose. Usually a `Prose`. */
  children?: ReactNode
  /** Reading context for the Series this blog belongs to. */
  seriesContext?: ReactNode
  /** Reactions and sharing. After the prose, never before it. */
  feedback?: ReactNode
  discussion?: ReactNode
  related?: ReactNode

  headings?: readonly ReaderHeading[]
  activeHeadingId?: string | null
  onNavigateHeading?: (id: string) => void

  /** Attached to the reading column, for `ReadingProgress` to measure. */
  contentRef?: RefObject<HTMLDivElement>

  isLoading?: boolean
  /** The blog could not be loaded. */
  error?: string | null
  onRetry?: () => void
  /** The blog does not exist, or is not published. */
  isMissing?: boolean
  /**
   * Ways onward from an error or a missing blog - usually a couple of
   * `ActionLink`s. The frame asks for them rather than building them because
   * where "onward" goes is the application's routing, not the reader's layout.
   */
  recovery?: ReactNode
}

/**
 * A state that replaces the whole article still has to be a page.
 *
 * The missing and error states used to render a bare `FeedbackSurface` into the
 * document: one grey sentence, no `h1`, and - for a missing blog - nothing to
 * click. The Series page had already worked this out and gives a missing Series
 * a headline, a retry and two links; this is the same substance, arranged by
 * the frame so both reading routes get it rather than one page remembering to.
 */
function ReaderStatePage({
  containerRef,
  title,
  children,
  ...rest
}: {
  containerRef: ForwardedRef<HTMLDivElement>
  title: string
  children: ReactNode
} & Omit<ContentContainerProps, 'as' | 'children' | 'title'>) {
  return (
    <ContentContainer ref={containerRef} as="div" width="prose" {...rest}>
      <Box display="flex" flexDirection="column" gap={space[6]}>
        <Heading as="h1" recipe="pageTitle">
          {title}
        </Heading>
        {children}
      </Box>
    </ContentContainer>
  )
}

export const ReaderFrame = forwardRef<HTMLDivElement, ReaderFrameProps>(function ReaderFrame(
  {
    identity,
    metadata,
    cover,
    children,
    seriesContext,
    feedback,
    discussion,
    related,
    headings = [],
    activeHeadingId = null,
    onNavigateHeading,
    contentRef,
    isLoading = false,
    error = null,
    onRetry,
    isMissing = false,
    recovery,
    ...rest
  },
  ref,
) {
  if (isLoading) {
    return <PageLoading task="this blog" />
  }

  if (error) {
    return (
      <ReaderStatePage containerRef={ref} title="This blog did not load" {...rest}>
        {/* No `detail`: `error` is whatever the transport said, and "HTTP 503"
            is not a sentence a reader can act on. */}
        <ErrorState failedAction="load this blog" align="start">
          <Box display="flex" flexWrap="wrap" alignItems="center" gap={space[3]}>
            {onRetry ? <RetryAction failedAction="load this blog" onRetry={onRetry} /> : null}
            {recovery}
          </Box>
        </ErrorState>
      </ReaderStatePage>
    )
  }

  if (isMissing) {
    return (
      <ReaderStatePage containerRef={ref} title="This blog is not here" {...rest}>
        {/*
          No retry. A blog that is not published or no longer exists answers the
          same way to a second request, and a button that cannot work is worse
          than no button - which is why this state carries links instead.
        */}
        <MissingState
          subject="this blog"
          detail="It may have been unpublished, or the link may be out of date."
          align="start"
        >
          <Box display="flex" flexWrap="wrap" alignItems="center" gap={space[3]}>
            {recovery}
          </Box>
        </MissingState>
      </ReaderStatePage>
    )
  }

  return (
    <ContentContainer ref={ref} as="div" {...rest}>
      <Box
        display="grid"
        gridTemplateColumns={{ base: '1fr', lg: '200px minmax(0, 1fr)' }}
        gap={{ base: space[6], lg: space[16] }}
        alignItems="start"
      >
        {/* The rail is hidden rather than unmounted below `lg` so the disclosure
            and the rail never both exist and duplicate the nav landmark. */}
        <Box display={{ base: 'none', lg: 'block' }}>
          <TOC
            headings={headings}
            activeId={activeHeadingId}
            variant="rail"
            onNavigate={onNavigateHeading}
          />
        </Box>

        <Box as="article" minW={0} display="flex" flexDirection="column" gap={space[6]}>
          {identity ? <Box as="header">{identity}</Box> : null}
          {metadata}

          <Box display={{ base: 'block', lg: 'none' }}>
            <TOC
              headings={headings}
              activeId={activeHeadingId}
              variant="disclosure"
              onNavigate={onNavigateHeading}
            />
          </Box>

          {cover}

          <Box ref={contentRef} minW={0}>
            {children}
          </Box>

          {seriesContext}
          {feedback}
          {discussion}
          {related}
        </Box>
      </Box>
    </ContentContainer>
  )
})

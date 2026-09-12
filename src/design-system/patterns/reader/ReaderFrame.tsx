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

import { forwardRef, type ReactNode, type RefObject } from 'react'
import { Box } from '@chakra-ui/react'

import { space } from '../../../theme/tokens'
import { ContentContainer, type ContentContainerProps } from '../../components/layout'
import { ErrorState, MissingState, PageLoading, RetryAction } from '../../components/feedback'
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
    ...rest
  },
  ref,
) {
  if (isLoading) {
    return <PageLoading task="this blog" />
  }

  if (error) {
    return (
      <ErrorState failedAction="load this blog">
        {onRetry ? <RetryAction failedAction="load this blog" onRetry={onRetry} /> : null}
      </ErrorState>
    )
  }

  if (isMissing) {
    return <MissingState subject="this blog" />
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

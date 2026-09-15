/**
 * Series discovery on Home and at the top of the blog archive.
 *
 * The shelf is the design system's `SeriesRail`: a real scroll container with
 * snap, a next-item peek, overlay arrows for a mouse, drag-to-scroll whose
 * throw does not open a card, and arrow-key paging. None of that is
 * reimplemented here - this component fetches, names the section, and hands the
 * rail its items.
 *
 * A shelf with nothing on it still renders nothing: an empty Series rail on
 * Home is furniture. A shelf that *failed* now says so and offers a retry,
 * where it used to disappear as silently as an empty one - a reader who cannot
 * tell the difference has no way to recover the section.
 */

import { Box } from '@chakra-ui/react'

import {
  ActionLink,
  ErrorState,
  Eyebrow,
  Grid,
  Heading,
  RetryAction,
  SeriesRail,
  Skeleton,
  Stack,
} from '../../../design-system'
import { space } from '../../../theme/tokens'
import { toSeriesSummary } from '../series.presentation'
import { usePublicSeriesList } from '../usePublicSeriesList'

interface SeriesShelfProps {
  compact?: boolean
}

/**
 * How many Series the shelf asks for, and how many placeholders stand in.
 *
 * The rail shows three cards plus a peek at `md` (`SeriesRail`'s default
 * `visibleItems`), so anything at or below three arrives with the arrows dead
 * and nothing to scroll to - the rail's paging, snap and peek all become
 * furniture. It used to ask for two.
 *
 * Twelve is `usePublicSeriesList`'s own default page size and the largest the
 * shelf needs: the public `/series` endpoint serves it in one request, and a
 * reader who has scrolled past twelve Series on a shelf wants the Series index,
 * which is what the "View all series" link beside the heading is for. The
 * skeleton count matches the rail's widest visible row rather than the request,
 * because loading reserves the shape of what is about to be on screen.
 */
export const SHELF_LIMIT = 12
export const SKELETON_COUNT = 3

const SeriesShelf = ({ compact = false }: SeriesShelfProps) => {
  const { items, loading, error, retry } = usePublicSeriesList({ limit: SHELF_LIMIT })

  if (!loading && !error && items.length === 0) return null

  const headingId = compact ? 'blog-series-heading' : 'home-series-heading'
  const heading = compact
    ? 'Read connected blogs in order'
    : 'Ideas that unfold across more than one blog'

  return (
    <Box as="section" aria-labelledby={headingId}>
      <Stack gap={4}>
        <Box
          display="flex"
          flexWrap="wrap"
          alignItems="flex-end"
          justifyContent="space-between"
          gap={space[3]}
        >
          <Stack gap={2} minW={0}>
            <Eyebrow as="p">Series</Eyebrow>
            <Heading id={headingId} as="h2" recipe="sectionTitle">
              {heading}
            </Heading>
          </Stack>
          <ActionLink
            standalone
            to="/series"
            underline="hover"
            color="action.primary"
            fontWeight="semibold"
          >
            View all series
          </ActionLink>
        </Box>

        {loading ? (
          <Grid columns={3} gap={6}>
            {Array.from({ length: SKELETON_COUNT }, (_unused, index) => (
              <Skeleton
                key={`series-skeleton-${index}`}
                shape={{ shape: 'media', aspectRatio: '16 / 10' }}
                label={index === 0 ? 'the Series shelf' : undefined}
              />
            ))}
          </Grid>
        ) : error ? (
          <ErrorState failedAction="load the Series shelf" detail={error} align="start">
            <RetryAction failedAction="load the Series shelf" onRetry={retry} />
          </ErrorState>
        ) : (
          <SeriesRail
            items={items.map(toSeriesSummary)}
            label={compact ? 'Series on the blog archive' : 'Series on the home page'}
            /*
             * The public Series API carries no cover artwork, so asking for one
             * only draws the absent-media plate on every card. Say so rather
             * than letting the shelf look like every image failed to load.
             */
            cardOptions={{ showCover: false }}
          />
        )}
      </Stack>
    </Box>
  )
}

export default SeriesShelf

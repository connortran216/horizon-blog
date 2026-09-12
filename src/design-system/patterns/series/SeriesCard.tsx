/**
 * Horizon Design System v2 - one Series on a shelf.
 *
 * A Series card names the object before it names the title - "Series · 4 blogs"
 * - because "4 blogs" is the fact that distinguishes it from the post cards it
 * will sit beside, and a reader who misses that reads the whole shelf as
 * ordinary writing.
 *
 * It is a `SeriesCover` plus an identity line, not a `PostCard` with different
 * copy: the plate is on the feature radius, it carries the Series spine, and
 * `series.test.ts` asserts that those values have not drifted back into the
 * card family.
 */

import { forwardRef } from 'react'
import { Box } from '@chakra-ui/react'

import { space } from '../../../theme/tokens'
import { ActionLink } from '../../components/actions'
import type { HeadingElement } from '../../components/layout'
import { Chip } from '../../components/status'
import { Surface, type SurfaceProps } from '../../components/surface'
import { Eyebrow, Heading, Metadata, Text } from '../../components/typography'
import { cardLinkOverlayStyle } from '../posts'
import { SeriesCover } from './SeriesCover'
import { seriesFacts, seriesIdentityLabel, type SeriesSummary } from './series.logic'

export interface SeriesCardProps extends Omit<SurfaceProps, 'children' | 'depth' | 'as'> {
  series: SeriesSummary
  /**
   * Drop the plate where a dense list needs the height back, or where the
   * source has no artwork to show and the plate would only be a placeholder.
   */
  showCover?: boolean
  titleAs?: HeadingElement
  /** Lines the description is clamped to. */
  descriptionLines?: number
}

/**
 * The editorial choices a container may make on this card's behalf.
 *
 * Derived from `SeriesCardProps` rather than restated, so a card option is
 * declared once and a container that forwards it cannot rename it or fall
 * behind it. `series` is deliberately not here - the container supplies that
 * per item - and neither is anything from `SurfaceProps`: a shelf may decide
 * what a card says, never how big its box is, because the box is what the
 * shelf's own snap and peek arithmetic is measured against.
 */
export type SeriesCardOptions = Pick<SeriesCardProps, 'showCover' | 'titleAs' | 'descriptionLines'>

export const SeriesCard = forwardRef<HTMLElement, SeriesCardProps>(function SeriesCard(
  { series, showCover = true, titleAs = 'h3', descriptionLines = 3, ...rest },
  ref,
) {
  const description = series.description?.trim() ?? ''
  const facts = seriesFacts(series).filter((fact) => fact.kind !== 'parts')

  return (
    <Surface
      ref={ref}
      as="article"
      depth="raised"
      isInteractive
      position="relative"
      display="flex"
      flexDirection="column"
      height="100%"
      {...rest}
    >
      <Box display="flex" flexDirection="column" gap={space[4]} height="100%">
        {showCover ? <SeriesCover cover={series.cover} title={series.title} /> : null}

        <Eyebrow as="p">{seriesIdentityLabel(series.partCount)}</Eyebrow>

        <Heading as={titleAs} recipe="cardTitle">
          <ActionLink
            to={series.href}
            underline="hover"
            color="text.primary"
            _after={cardLinkOverlayStyle()}
          >
            {series.title}
          </ActionLink>
        </Heading>

        {description ? (
          <Text recipe="body" lineClamp={descriptionLines}>
            {description}
          </Text>
        ) : null}

        {series.topics && series.topics.length > 0 ? (
          <Box display="flex" flexWrap="wrap" gap={space[2]} position="relative" zIndex={1}>
            {series.topics.map((topic) => (
              <Chip key={topic}>{topic}</Chip>
            ))}
          </Box>
        ) : null}

        {facts.length > 0 ? (
          <Metadata marginTop="auto">
            {facts.map((fact, index) => (
              <Box key={fact.kind} display="flex" alignItems="center" gap={space[2]}>
                {index > 0 ? (
                  <Box as="span" aria-hidden="true" color="text.muted">
                    ·
                  </Box>
                ) : null}
                <Box as="span">{fact.label}</Box>
              </Box>
            ))}
          </Metadata>
        ) : null}
      </Box>
    </Surface>
  )
})

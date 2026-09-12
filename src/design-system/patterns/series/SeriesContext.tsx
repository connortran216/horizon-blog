/**
 * Horizon Design System v2 - where this blog sits in its Series.
 *
 * A `nav` landmark inside the reader: the Series name, the reader's position in
 * it, and the two moves they can make from here. It is not a post card and must
 * not look like one - it is the reading context, and a reader who mistakes it
 * for a related-post card loses the thread it exists to keep.
 *
 * Each direction link carries its destination's title in its accessible name.
 * "Previous" and "Next" alone are the most common defect in Series navigation:
 * a screen reader user tabbing the page hears two words and neither one says
 * where it goes.
 */

import { forwardRef } from 'react'
import { Box } from '@chakra-ui/react'
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi'

import { space } from '../../../theme/tokens'
import { ActionLink } from '../../components/actions'
import { Surface, type SurfaceProps } from '../../components/surface'
import { Eyebrow, Text } from '../../components/typography'
import { seriesContextLabel, seriesNavTargets, type SeriesReadingContext } from './series.logic'

export interface SeriesContextProps extends Omit<SurfaceProps, 'children' | 'depth' | 'as'> {
  context: SeriesReadingContext
  /** Link wording back to the Series overview. */
  overviewLabel?: string
}

export const SeriesContext = forwardRef<HTMLElement, SeriesContextProps>(function SeriesContext(
  { context, overviewLabel = 'View the whole Series', ...rest },
  ref,
) {
  const targets = seriesNavTargets(context)

  return (
    <Surface ref={ref} as="nav" aria-label="Series navigation" depth="flat" {...rest}>
      <Box display="flex" flexDirection="column" gap={space[4]}>
        <Box
          display="flex"
          flexWrap="wrap"
          alignItems="flex-start"
          justifyContent="space-between"
          gap={space[3]}
        >
          <Box display="flex" flexDirection="column" gap={space[1]} minW={0}>
            <Eyebrow as="p">{seriesContextLabel(context)}</Eyebrow>
            <ActionLink to={context.href} underline="hover" color="text.primary">
              {context.title}
            </ActionLink>
          </Box>

          <ActionLink
            to={context.href}
            underline="hover"
            color="action.primary"
            iconEnd={<FiArrowRight aria-hidden="true" />}
            aria-label={`${overviewLabel}: ${context.title}`}
          >
            {overviewLabel}
          </ActionLink>
        </Box>

        {targets.length > 0 ? (
          <Box
            display="grid"
            gridTemplateColumns={{ base: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }}
            gap={space[3]}
          >
            {targets.map((target) => (
              <ActionLink
                key={target.direction}
                to={target.href}
                underline="hover"
                aria-label={target.ariaLabel}
                color="text.primary"
                iconStart={
                  target.direction === 'previous' ? <FiArrowLeft aria-hidden="true" /> : undefined
                }
                iconEnd={
                  target.direction === 'next' ? <FiArrowRight aria-hidden="true" /> : undefined
                }
                display="flex"
                alignItems="center"
                gap={space[2]}
                /* The next part is the forward move, so it sits on the right. */
                justifyContent={target.direction === 'next' ? 'flex-end' : 'flex-start'}
                gridColumn={
                  target.direction === 'next' && targets.length === 1
                    ? { base: 'auto', sm: '2' }
                    : undefined
                }
              >
                <Box display="flex" flexDirection="column" minW={0}>
                  <Text as="span" recipe="metadata">
                    {target.direction === 'previous' ? 'Previous part' : 'Next part'}
                  </Text>
                  <Text as="span" recipe="body" color="text.primary">
                    {target.title}
                  </Text>
                </Box>
              </ActionLink>
            ))}
          </Box>
        ) : null}
      </Box>
    </Surface>
  )
})

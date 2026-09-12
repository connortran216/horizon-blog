/**
 * Where the blog being read sits in its Series.
 *
 * The design system's `SeriesContext` owns the shape: a `nav` landmark, the
 * position, and the two moves the reader can make from here - each one carrying
 * its destination's title in its accessible name, so a screen reader hears
 * where "Next part" goes instead of hearing one bare word.
 */

import { SeriesContext } from '../../../design-system'
import { toSeriesReadingContext } from '../series.presentation'
import { PublicSeriesContext } from '../series.types'

interface SeriesContextCardProps {
  context: PublicSeriesContext
}

const SeriesContextCard = ({ context }: SeriesContextCardProps) => (
  <SeriesContext context={toSeriesReadingContext(context)} overviewLabel="View full series" />
)

export default SeriesContextCard

/**
 * One public Series on a shelf or in the index grid.
 *
 * A thin adapter over the design system's `SeriesCard`, which is what gives a
 * Series its book identity - the feature radius, the spine and the "Series · 4
 * blogs" line that names the object before its title. None of that is drawn
 * here.
 */

import { SeriesCard as SeriesCardPattern } from '../../../design-system'
import { toSeriesSummary } from '../series.presentation'
import { PublicSeriesSummary } from '../series.types'

interface SeriesCardProps {
  series: PublicSeriesSummary
  /** Lines the description is clamped to in a dense grid. */
  descriptionLines?: number
}

const SeriesCard = ({ series, descriptionLines = 3 }: SeriesCardProps) => (
  <SeriesCardPattern series={toSeriesSummary(series)} descriptionLines={descriptionLines} />
)

export default SeriesCard

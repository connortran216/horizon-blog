/**
 * The blogs in a Series, in order.
 *
 * The design system's `PartList` owns the sequence: a real `ol`, an ordinal
 * marker per part, and the connectors that make the run read as a reading order
 * rather than as a stack of cards.
 *
 * The wording changed with the pattern. "Start here" and "Part 02" became
 * "Part 1 of 8" throughout, which is the phrasing `DESIGN.md` fixes for Series
 * position and the one the reader already meets on a post's metadata line.
 */

import { PartList } from '../../../design-system'
import { toSeriesParts } from '../series.presentation'
import { PublicSeriesPart } from '../series.types'

interface SeriesPartListProps {
  parts: PublicSeriesPart[]
  /** Zero-based index of the part the reader is on, when inside the Series. */
  currentIndex?: number | null
}

const SeriesPartList = ({ parts, currentIndex = null }: SeriesPartListProps) => (
  <PartList
    parts={toSeriesParts(parts)}
    label="Series blogs"
    currentIndex={currentIndex}
    titleAs="h3"
  />
)

export default SeriesPartList

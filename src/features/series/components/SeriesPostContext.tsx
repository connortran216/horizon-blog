/**
 * A post's Series reference, as an inline line of metadata.
 *
 * Nothing renders this any more. Home's cards, the archive cards and the
 * archive feature all used to draw the Series title and position themselves;
 * since this release they hand the post's metadata to `PostMetadata`, which
 * carries the same fact as a link to the Series and announces the Series title
 * as part of that link's accessible name.
 *
 * It is kept off legacy tokens so the compatibility bridge has one fewer
 * caller, and it should be deleted with its inventory row rather than migrated
 * again.
 */

import { Metadata, Text } from '../../../design-system'
import { BlogSeriesContext } from '../../../core/types/blog.types'

interface SeriesPostContextProps {
  series?: BlogSeriesContext | null
}

const SeriesPostContext = ({ series }: SeriesPostContextProps) => {
  if (!series) return null

  return (
    <Metadata as="p" color="action.primary">
      <Text as="span" recipe="metadata" color="action.primary" lineClamp={1}>
        {series.title}
      </Text>
      <Text as="span" recipe="metadata" aria-hidden="true">
        /
      </Text>
      <Text as="span" recipe="metadata" color="text.secondary">
        Part {series.position} of {series.total}
      </Text>
    </Metadata>
  )
}

export default SeriesPostContext

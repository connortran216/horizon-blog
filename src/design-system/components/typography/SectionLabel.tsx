import { forwardRef } from 'react'
import { Box, type BoxProps } from '@chakra-ui/react'

import { typographyRecipe } from './typography.logic'

export interface SectionLabelProps extends Omit<BoxProps, 'as'> {
  /** Outline depth. A section directly under the page title is `h2`. */
  as?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

/**
 * A section's heading, at the size of a kicker.
 *
 * `Eyebrow` and this look identical and mean opposite things, which is the
 * whole reason both exist. An eyebrow sits above a heading and repeats or
 * categorises it, so it must stay out of the outline or every section gets two
 * entries. A section label is the only name a group has - there is no heading
 * under it - so it must be in the outline, or the group has no name at all.
 *
 * The gap this fills was found by measuring the rendered outlines:
 *
 *   /cv       H1, then H3 x8 - zero h2 on the page. "Summary", "Experience"
 *             and "Education" were 13px paragraphs, so a reader navigating by
 *             heading got a name and then eight unrelated job titles.
 *   /about    H1, then H3 x3 in the hero under "Editorial track"
 *   /contact  H1, then H3 x3 for the contact channels
 *
 * Nothing looked wrong on any of them, which is exactly why it survived the
 * migration. The fix is not to let `Eyebrow` become a heading - it must not,
 * and its type refuses - but to say which of the two jobs a given label is
 * doing.
 *
 * Visually this is the `metadata` recipe with the eyebrow's uppercase and
 * tracking, so promoting a label changes the outline and nothing on screen.
 */
export const SectionLabel = forwardRef<HTMLHeadingElement, SectionLabelProps>(function SectionLabel(
  { as = 'h2', ...rest },
  ref,
) {
  const { textStyle } = typographyRecipe('metadata')

  return (
    <Box
      ref={ref}
      as={as}
      display="block"
      textStyle={textStyle}
      textTransform="uppercase"
      letterSpacing="wider"
      color="text.muted"
      {...rest}
    />
  )
})

import { forwardRef } from 'react'
import { Box, type BoxProps } from '@chakra-ui/react'

import { sectionSpacing, type SectionDensity } from './layout.logic'
import type { RegionElement } from './semanticElements'

export interface SectionProps extends Omit<BoxProps, 'as'> {
  /** Semantic element. Defaults to `section`; use `div` for a non-landmark run. */
  as?: RegionElement
  /** 48/80 (`comfortable`), 24/48 (`compact`) or none (`flush`). */
  density?: SectionDensity
}

/**
 * Vertical rhythm between major runs of a page. Padding rather than margin, so
 * two adjacent sections do not collapse into one another and a background set
 * on a section actually covers its own air.
 */
export const Section = forwardRef<HTMLElement, SectionProps>(function Section(
  { as = 'section', density = 'comfortable', ...rest },
  ref,
) {
  return <Box ref={ref} as={as} py={sectionSpacing(density)} {...rest} />
})

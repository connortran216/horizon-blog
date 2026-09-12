/**
 * Pure layout decisions.
 *
 * Everything here answers a question a structural primitive has to answer before
 * it can render: which breakpoint a transition happens at, how wide the frame
 * is, how much air a section gets, how many columns survive on a phone. Keeping
 * them as functions is what makes them testable in a repo with no DOM.
 */

import { layout, sectionSpace, space, type SpaceToken } from '../../../theme/tokens'

/**
 * The four transitions the system actually has, named by what changes rather
 * than by their pixel value. `src/theme/tokens/primitives.ts` owns the numbers
 * (sm 681, md 801, lg 1001, xl 1169) and this maps each layout decision onto
 * one of them, so no component picks a breakpoint on its own.
 *
 *   typeRamp     681px  headings and prose reach their desktop sizes
 *   sectionRhythm 681px  section padding goes 48px -> 80px, with the type
 *   columns      801px  multi-column content grids appear
 *   composition 1001px  the full desktop composition (tall header, widest type)
 *   frame       1169px  the content frame stops tightening against the viewport
 */
export const layoutBreakpoints = {
  typeRamp: 'sm',
  sectionRhythm: 'sm',
  columns: 'md',
  composition: 'lg',
  frame: 'xl',
} as const

export type LayoutBreakpoint = (typeof layoutBreakpoints)[keyof typeof layoutBreakpoints]

/** Responsive value: a base plus one override at a named breakpoint. */
export type ResponsiveValue<T> = { base: T } & Partial<Record<LayoutBreakpoint, T>>

export type ContainerWidth = 'content' | 'prose' | 'full'

/**
 * Container widths resolve to Chakra `sizes` entries rather than raw lengths -
 * `horizonTheme` registers `content` (1120px) and `prose` (68ch) from the same
 * primitives this module imports.
 */
export function containerMaxWidth(width: ContainerWidth): string {
  switch (width) {
    case 'prose':
      return 'prose'
    case 'full':
      return '100%'
    case 'content':
    default:
      return 'content'
  }
}

/** The measured value behind a container width, for tests and the gallery. */
export function containerMaxWidthValue(width: ContainerWidth): string {
  switch (width) {
    case 'prose':
      return layout.prose
    case 'full':
      return '100%'
    case 'content':
    default:
      return layout.content
  }
}

/**
 * Side gutters. 16px on a phone, 24px once the frame has room - the prototype's
 * `padding: 0 20px` / `0 24px` pair, snapped onto the spacing scale.
 */
export function containerGutter(): ResponsiveValue<string> {
  return { base: space[4], sm: space[6] }
}

export type SectionDensity = 'comfortable' | 'compact' | 'flush'

/**
 * Section rhythm. `comfortable` is the documented 48/80 pair; `compact` halves
 * it for stacked sub-sections; `flush` opts out entirely so a parent can own the
 * spacing instead. There is no fourth option - a page that needs one is asking
 * for a page override, which this layer does not grant.
 */
export function sectionSpacing(density: SectionDensity): ResponsiveValue<string> {
  switch (density) {
    case 'flush':
      // Zero is an absence of spacing, not a spacing value, so it has no token.
      return { base: '0', sm: '0' }
    case 'compact':
      return { base: space[6], sm: space[12] }
    case 'comfortable':
    default:
      return { base: sectionSpace.mobile, sm: sectionSpace.desktop }
  }
}

export type GridColumns = 1 | 2 | 3 | 4

/**
 * Grids collapse to a single column below `columns` (801px) unless the caller
 * asks for a different transition. `minmax(0, 1fr)` rather than `1fr`: a grid
 * child with a long unbroken token (a URL, a code span) would otherwise widen
 * the track and push the document sideways.
 */
export function gridColumnTemplate(
  columns: GridColumns,
  collapseAt: LayoutBreakpoint = layoutBreakpoints.columns,
): ResponsiveValue<string> {
  const track = (count: number) => `repeat(${count}, minmax(0, 1fr))`

  if (columns === 1) {
    return { base: track(1) }
  }

  return { base: track(1), [collapseAt]: track(columns) } as ResponsiveValue<string>
}

export type StackDirection = 'row' | 'column'

/**
 * A row stack becomes a column below its collapse point. Passing `collapseAt`
 * as `undefined` keeps a row a row at every width - correct for a group of two
 * short controls, wrong for anything holding text.
 */
export function stackFlexDirection(
  direction: StackDirection,
  collapseAt?: LayoutBreakpoint,
): ResponsiveValue<StackDirection> {
  if (direction === 'column' || collapseAt === undefined) {
    return { base: direction }
  }

  return { base: 'column', [collapseAt]: 'row' } as ResponsiveValue<StackDirection>
}

/** Gap values come from the spacing scale; the token key is the public API. */
export function stackGap(gap: SpaceToken): string {
  return space[gap]
}

/**
 * Horizon Design System v2 - how the four post surfaces stay different.
 *
 * `dsv2.5.1` acceptance 1: "Signature and normal cards remain distinct."
 *
 * `DESIGN.md` lists "Building one universal card" as a non-goal and "One
 * rounded-card treatment for every domain" under Avoid. The tempting shortcut -
 * one `PostCard` with `size="large"` - fails both: a signature story is not a
 * bigger card, it is a different editorial object with its own radius, its own
 * elevation, its own type ramp and its own cover proportion.
 *
 * Keeping that as data rather than as four hand-written style blocks means the
 * distinctness is something a test can assert instead of something a reviewer
 * has to eyeball at four viewport widths.
 */

import { componentTokens, radii, typeScale } from '../../../theme/tokens'
import { frameOwnsCorners, type MediaCorners } from '../../components/media'
import type { HeadingRecipeName } from '../../components/typography'

export type PostPattern = 'signature' | 'featured' | 'card' | 'row'

export const postPatterns: readonly PostPattern[] = ['signature', 'featured', 'card', 'row']

export interface PostPresentation {
  /**
   * Which component token family owns the surface. `feature` is the layered
   * editorial treatment; `card` is the ordinary content card; a row has no
   * surface of its own and sits directly on the page.
   */
  readonly family: 'feature' | 'card' | 'none'
  readonly borderRadius: string
  readonly titleRecipe: HeadingRecipeName
  /** CSS aspect ratio for the cover, in the form `MediaFrame` accepts. */
  readonly coverAspectRatio: string
  /**
   * The corner decision handed to `MediaFrame`: a radius token when the cover
   * draws its own corners, `'container'` when it declines them because the
   * pattern's `Surface` draws and clips them instead - a full-bleed cover.
   */
  readonly coverRadius: MediaCorners
  /**
   * Whether a bounding `Surface` wraps the whole pattern. The Signature and the
   * row deliberately have none: the Signature's identity is carried by its
   * artwork plate, and a row is separated from its neighbours by a rule. Only
   * the card and the archive feature are boxes.
   */
  readonly ownsSurface: boolean
  /** Lines the excerpt is clamped to; `0` means the excerpt is not shown. */
  readonly excerptLines: number
  /** Tags shown before the overflow chip takes over. */
  readonly tagLimit: number
}

/**
 * Cover proportions. The signature and featured artwork are wide editorial
 * plates; a card cover is the familiar 16/9; a row thumbnail is nearly square
 * on a phone because a 144px-wide 16/9 strip is too short to read as an image.
 *
 * Covers differ in where their corners come from as well as in shape. The
 * Signature and the row are plates sitting on the page with nothing clipping
 * them, so they round themselves. The card's cover bleeds to the card's edge -
 * the approved prototype's `.article-card .art { border-radius: 0 }` inside an
 * `.article-card { border-radius: 20px; overflow: hidden }` - so it declines its
 * corners and the `Surface` supplies them.
 */
const presentations = {
  signature: {
    family: 'feature',
    borderRadius: componentTokens.feature.radius,
    titleRecipe: 'display',
    coverAspectRatio: '16 / 10',
    coverRadius: 'feature',
    ownsSurface: false,
    excerptLines: 3,
    tagLimit: 3,
  },
  featured: {
    family: 'feature',
    borderRadius: componentTokens.feature.radius,
    titleRecipe: 'pageTitle',
    coverAspectRatio: '4 / 3',
    coverRadius: 'feature',
    ownsSurface: true,
    excerptLines: 3,
    tagLimit: 3,
  },
  card: {
    family: 'card',
    borderRadius: componentTokens.card.radius,
    titleRecipe: 'cardTitle',
    coverAspectRatio: '16 / 9',
    coverRadius: 'container',
    ownsSurface: true,
    excerptLines: 3,
    tagLimit: 2,
  },
  row: {
    family: 'none',
    borderRadius: componentTokens.card.radius,
    titleRecipe: 'cardTitle',
    coverAspectRatio: '4 / 3',
    coverRadius: 'control',
    ownsSurface: false,
    excerptLines: 2,
    tagLimit: 0,
  },
} as const satisfies Record<PostPattern, PostPresentation>

export function postPresentation(pattern: PostPattern): PostPresentation {
  return presentations[pattern]
}

/**
 * Whether this pattern's cover reaches the edge of the surface around it.
 *
 * Derived from the cover's corner decision rather than stored beside it, so the
 * two cannot get out of step: a cover bleeds exactly when it has handed its
 * corners to its container, and it has handed them over exactly when it bleeds.
 *
 * A bleeding cover also moves the padding. The `Surface` cannot hold it - that
 * padding is the inset - so it renders unpadded and the copy block underneath
 * the cover carries the card padding instead, which is what the prototype's
 * `.card-copy` does.
 */
export function coverBleeds(pattern: PostPattern): boolean {
  return !frameOwnsCorners(postPresentation(pattern).coverRadius)
}

/**
 * Whether two patterns are visually distinct enough to read as different
 * objects rather than as two sizes of the same one.
 *
 * Three independent channels have to differ - the surface family, the radius
 * and the title ramp - so a reader who is scrolling past at speed, a reader on
 * a 375px phone where the widths converge, and a reader with the page zoomed to
 * 200% all still see two different things. Any single channel could be defeated
 * by a viewport; three cannot be defeated by accident.
 *
 * `signature` and `featured` are the deliberate exception and this returns
 * `false` for them: they are the same editorial object at two altitudes - Home
 * and the archive - and they are separated by the title ramp and the cover
 * proportion rather than by the surface. The pair the acceptance criterion is
 * about is signature against card, and that pair differs on all three.
 */
export function patternsAreDistinct(a: PostPattern, b: PostPattern): boolean {
  if (a === b) {
    return false
  }

  const left = postPresentation(a)
  const right = postPresentation(b)

  return (
    left.family !== right.family &&
    left.borderRadius !== right.borderRadius &&
    left.titleRecipe !== right.titleRecipe
  )
}

/**
 * The title size a pattern draws at, in pixels at the desktop end of the ramp.
 * Used by the distinctness test and by the gallery's type audit; never by a
 * component, which reads the recipe name instead.
 */
export function titleSizePx(pattern: PostPattern): number {
  const recipe = postPresentation(pattern).titleRecipe

  return Number.parseFloat(typeScale[recipe].fontSize[1])
}

/**
 * Radius tokens, exposed for the gallery so a reviewer can see that the four
 * surfaces really do sit on three different radii rather than trusting the
 * screenshot.
 */
export const postRadiusScale = {
  feature: radii.feature,
  card: radii.card,
  control: radii.control,
} as const

export interface CardLinkOverlay {
  readonly content: '""'
  readonly position: 'absolute'
  readonly inset: 0
  readonly borderRadius: 'inherit'
}

/**
 * The whole card is one link.
 *
 * A card whose title alone is clickable but whose surface lifts on hover is
 * lying about its target, and a card wrapped in a link that also contains the
 * author link and three topic links nests interactive elements, which no
 * browser resolves the same way. The overlay is the third option: exactly one
 * anchor, whose hit area is stretched over the card by a pseudo-element.
 *
 * `inset: 0` rather than a set of offsets, and `borderRadius: 'inherit'`, so
 * the hit area is the card - not a rectangle poking out of its rounded corners.
 * Anything the reader must still be able to click - a topic chip, the author
 * name - is raised above it by the pattern.
 */
export function cardLinkOverlayStyle(): CardLinkOverlay {
  return { content: '""', position: 'absolute', inset: 0, borderRadius: 'inherit' }
}

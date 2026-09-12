/**
 * Typography recipes.
 *
 * A recipe is a named editorial role - "this is a page title" - bound to three
 * decisions: which entry in the theme's `textStyles` it renders at, which
 * element it defaults to, and which text colour role it carries. Callers name
 * the role; they never name a size.
 *
 * Recipes intentionally do not expose a raw size. `horizonTheme` already makes
 * every `textStyles` entry responsive at the `sm` (681px) transition, which is
 * where the prototype's own `max-width: 680px` query drops headings to their
 * mobile sizes, so a recipe never has to restate the breakpoint.
 *
 * `sectionTitle` has its own step in the ramp. The approved baseline table did
 * not list one, which briefly left section headings borrowing `cardTitle` and
 * rendering at the same size as the cards beneath them. The step was added to
 * `typeScale` from the prototype's own `h2` declarations (25/34 mobile, 28/38
 * desktop) - a token decision, taken at B1 rather than worked around here.
 */

import type { HeadingElement, TextElement } from '../layout/semanticElements'
import { isHeadingElement } from '../layout/semanticElements'
import type { SemanticColorToken, TypeScaleToken } from '../../../theme/tokens'

export type TypographyRecipeName =
  | 'display'
  | 'pageTitle'
  | 'sectionTitle'
  | 'cardTitle'
  | 'body'
  | 'prose'
  | 'metadata'

/**
 * The `textStyles` keys `horizonTheme` registers, derived from the ramp rather
 * than restated. `horizonTheme` builds its `textStyles` from `typeScale`, so
 * hand-writing this union let it fall behind the moment a step was added.
 */
export type TextStyleToken = TypeScaleToken

export interface TypographyRecipe {
  readonly textStyle: TextStyleToken
  readonly element: TextElement
  readonly color: SemanticColorToken
}

const recipes = {
  display: { textStyle: 'display', element: 'h1', color: 'text.primary' },
  pageTitle: { textStyle: 'pageTitle', element: 'h1', color: 'text.primary' },
  sectionTitle: { textStyle: 'sectionTitle', element: 'h2', color: 'text.primary' },
  cardTitle: { textStyle: 'cardTitle', element: 'h3', color: 'text.primary' },
  body: { textStyle: 'body', element: 'p', color: 'text.secondary' },
  prose: { textStyle: 'prose', element: 'p', color: 'text.secondary' },
  metadata: { textStyle: 'meta', element: 'p', color: 'text.muted' },
} as const satisfies Record<TypographyRecipeName, TypographyRecipe>

export const typographyRecipeNames = Object.keys(recipes) as TypographyRecipeName[]

/** Recipes whose default element is a heading. `Heading` accepts only these. */
export type HeadingRecipeName = 'display' | 'pageTitle' | 'sectionTitle' | 'cardTitle'

export const headingRecipeNames: HeadingRecipeName[] = [
  'display',
  'pageTitle',
  'sectionTitle',
  'cardTitle',
]

export function typographyRecipe(name: TypographyRecipeName): TypographyRecipe {
  return recipes[name]
}

/**
 * Resolve the element a run of text renders as.
 *
 * An explicit `as` always wins: heading rank is a document-structure decision
 * that belongs to the page, not to the size that looks right. A page with two
 * `h1`s because both used the `display` recipe is the failure this allows a
 * caller to avoid.
 */
export function resolveTextElement(
  name: TypographyRecipeName,
  as?: TextElement,
): { element: TextElement; isHeading: boolean } {
  const element = as ?? recipes[name].element

  return { element, isHeading: isHeadingElement(element) }
}

/** Heading rank as a number, for outline checks in the gallery. */
export function headingLevel(element: HeadingElement): number {
  return Number.parseInt(element.slice(1), 10)
}

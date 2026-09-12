/**
 * The semantic elements a structural primitive is allowed to render as.
 *
 * `CONVENTIONS.md` requires polymorphism without `any`. Chakra's own `As` type
 * accepts every element and every component, which is wider than any structural
 * primitive wants: `<Section as="input">` should not compile. An explicit union
 * keeps the `as` prop honest and keeps the resolved element inspectable by a
 * pure function, so the choice can be tested without rendering.
 */

/** Block-level regions. What a frame, container, section or surface may be. */
export const regionElements = [
  'div',
  'section',
  'article',
  'aside',
  'main',
  'header',
  'footer',
  'nav',
  'figure',
  'fieldset',
] as const

export type RegionElement = (typeof regionElements)[number]

/** Regions plus the list containers, for stacks and grids of repeated items. */
export const collectionElements = [...regionElements, 'ul', 'ol', 'dl'] as const

export type CollectionElement = (typeof collectionElements)[number]

/** Headings, in document order of rank. */
export const headingElements = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const

export type HeadingElement = (typeof headingElements)[number]

/** Elements a run of text may be. */
export const textElements = [
  'p',
  'span',
  'div',
  'dd',
  'dt',
  'li',
  'figcaption',
  'blockquote',
  'small',
  'strong',
  'em',
  'label',
  ...headingElements,
] as const

export type TextElement = (typeof textElements)[number]

export function isHeadingElement(element: TextElement): element is HeadingElement {
  return (headingElements as readonly string[]).includes(element)
}

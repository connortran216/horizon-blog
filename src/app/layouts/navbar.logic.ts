/**
 * Pure decision logic for the mobile nav menu's keyboard behaviour.
 *
 * Split out so it is testable without a DOM: this repo's shell tests render
 * with `renderToStaticMarkup`, which has no layout engine and no DOM event
 * system, so a test can never dispatch a real `keydown` and observe the menu
 * close. The decision itself - "does this keypress close the menu" - has
 * nothing to do with the DOM, so it lives here as a pure function; `Navbar`
 * wires it to a real `keydown` listener that only exists while the menu is
 * open (see B-3, specs/021-contact-editorial-letter).
 */
export function shouldCloseOnKey(key: string, isMenuOpen: boolean): boolean {
  return isMenuOpen && key === 'Escape'
}

export interface HeaderSurfaceInput {
  /** The route whose first screen is the synapse field. */
  readonly overField: boolean
  /** The page has not been scrolled past the top. */
  readonly atTop: boolean
}

export interface HeaderSurface {
  /** The bar paints its own fill and border. */
  readonly floating: boolean
}

/**
 * Over a field (Home's first screen, About's hero) the header has no box of its own: the field runs under
 * it and the bar is only its items. The moment the reader scrolls, or on any
 * other route, it is the compact floating surface again - readers who scroll
 * back up get the field back, not a bar sitting on it.
 */
export function headerSurface({ overField, atTop }: HeaderSurfaceInput): HeaderSurface {
  return { floating: !(overField && atTop) }
}

/** Routes whose first screen is a synapse field: Home, and About's hero. */
const FIELD_ROUTES = new Set(['/', '/about'])

/** Whether a route opens on a synapse field, so the header starts without its box. */
export function opensOnField(pathname: string): boolean {
  return FIELD_ROUTES.has(pathname.replace(/\/+$/u, '') || '/')
}

/** Scroll positions this close to the top still count as the top. */
export const HEADER_TOP_THRESHOLD_PX = 8

export function isAtTop(scrollY: number): boolean {
  return scrollY < HEADER_TOP_THRESHOLD_PX
}

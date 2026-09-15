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

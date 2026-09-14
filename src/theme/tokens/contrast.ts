/**
 * Horizon Design System v2 - the contrast arithmetic the token table is judged by.
 *
 * WCAG 2.1 relative luminance and contrast ratio, over the `#rrggbb` form every
 * approved role is written in. It lives beside the tokens rather than inside a
 * test because more than one check needs it: the token table asserts its own
 * pairs, and a component test has to be able to ask the same question about the
 * colours a component actually emitted. Two hand-copied implementations of this
 * had already appeared before it was worth naming.
 *
 * Alpha values are out of scope on purpose. A ratio is only meaningful once a
 * colour is composited over a known background, and the `derived` roles that
 * carry alpha are the ones `DESIGN.md` still has an open question against.
 */

/** WCAG 2.1 relative luminance of a `#rrggbb` colour. */
export function relativeLuminance(hex: string): number {
  const channels = (hex.match(/[0-9a-f]{2}/gi) || [])
    .map((value) => Number.parseInt(value, 16) / 255)
    .map((value) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4))

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

/** WCAG 2.1 contrast ratio between two `#rrggbb` colours, from 1 to 21. */
export function contrastRatio(foreground: string, background: string): number {
  const foregroundLuminance = relativeLuminance(foreground)
  const backgroundLuminance = relativeLuminance(background)

  return (
    (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
    (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
  )
}

/** The AA floor for body and label text. */
export const textContrastFloor = 4.5

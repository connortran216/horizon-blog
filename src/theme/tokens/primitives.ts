/**
 * Horizon Design System v2 - primitive tokens.
 *
 * Primitives are raw values with no meaning attached. Nothing in the product
 * references a primitive directly; semantic roles in `semantic.ts` and component
 * aliases in `components.ts` are the public surface.
 *
 * Every colour below is an approved value from the Signal baseline
 * (`specs/018-signal-uiux-redesign/design-handoff/approved-tokens.md`, v0.2).
 * Ramp steps are ordered by luminance so a family reads light -> dark; a gap in
 * the numbering means the baseline simply has no value at that step. Do not
 * interpolate a missing step, and do not add a pigment that the baseline and
 * `DESIGN.md` do not already contain.
 */

export const palette = {
  white: '#FFFFFF',
  black: '#000000',

  /** Cool neutrals that carry light-theme canvas, surfaces, borders and text. */
  mist: {
    50: '#F5F7FC',
    100: '#EDF1FA',
    200: '#DCE3EF',
    500: '#7E8BA5',
    600: '#5D6B82',
    700: '#53617A',
    900: '#17213A',
  },

  /** Deep neutrals that carry dark-theme canvas, surfaces, borders and text. */
  night: {
    50: '#E9EEFA',
    200: '#A7B4CC',
    300: '#8B9AB5',
    400: '#697B9D',
    500: '#2B3852',
    600: '#1C2740',
    700: '#1A2438',
    800: '#151D2E',
    900: '#0D1220',
    950: '#101A35',
  },

  /** Signal cobalt: actions, links and focus in both themes. */
  cobalt: {
    100: '#ABC0FF',
    200: '#A9BAFF',
    300: '#A4B8FF',
    400: '#8AA4FF',
    600: '#3158D4',
    700: '#294BC4',
    800: '#2648B6',
  },

  /** Restrained lime accent. 200/300 are surfaces, 800/900 are text on them. */
  lime: {
    200: '#DDF89A',
    300: '#C5EC83',
    800: '#263A12',
    900: '#1C2C0C',
  },

  success: {
    300: '#80D7A1',
    600: '#206B43',
  },

  warning: {
    300: '#F1C36C',
    600: '#8A5300',
  },

  danger: {
    300: '#FF929F',
    600: '#B42336',
  },
} as const

/**
 * Shared spacing scale in pixels. `section` is a deliberate exception recorded in
 * the approved baseline: section rhythm is 48px on mobile and 80px on desktop.
 */
export const space = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  6: '24px',
  8: '32px',
  12: '48px',
  16: '64px',
  24: '96px',
} as const

export const sectionSpace = {
  mobile: '48px',
  desktop: '80px',
} as const

export const radii = {
  control: '12px',
  card: '20px',
  feature: '28px',
  tag: '999px',
} as const

/**
 * Blur radii for atmospheric artwork.
 *
 * A blur is neither a spacing value nor a radius, so it gets its own scale
 * instead of borrowing one that means something else. Two steps is all the
 * system needs: `bloom` is the soft edge on a small travelling highlight, and
 * `ambient` is the wide wash that turns a flat colour into atmosphere behind a
 * feature surface. `DESIGN.md`'s Motion section sanctions ambient artwork on
 * Home and About; these are the radii it may use, so no component ever writes a
 * pixel blur of its own.
 */
export const blur = {
  bloom: '24px',
  ambient: '120px',
} as const

export const fontFamilies = {
  heading:
    '"Be Vietnam Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  body: '"Be Vietnam Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
  /*
   * The display face, and only the display face.
   *
   * `heading` and `body` above are deliberately the same family, and that is
   * why nothing on a page could have a voice of its own - a heading was a
   * larger size of the body, never a different character. `display` is the
   * second voice, spent on the few places a page needs one: the page title and
   * the one figure or value a page exists for.
   *
   * It does not replace `heading`. Every existing `Heading` keeps Be Vietnam
   * Pro until that is a decision someone makes deliberately and can see.
   *
   * Vietnamese coverage is the hard condition a display face has to clear here,
   * and Bitter clears it - see `src/theme/bitter.css` for the measurement.
   */
  display: '"Bitter", Georgia, "Times New Roman", serif',
} as const

export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const

/**
 * Type ramp. A pair means the value is responsive: `[mobile, desktop]`.
 * Sizes and line heights come from the approved baseline; the mobile/desktop
 * split for display, pageTitle and prose is the interpolation settled in
 * `DESIGN.md`.
 *
 * `sectionTitle` is the one step the baseline table does not list. It is not
 * invented: the approved prototype draws section headings at 28/38 on desktop
 * and 25px on mobile, and those are the values recorded here. Without it a
 * section heading has to borrow `cardTitle`, which puts an `h2` at the same size
 * as the cards beneath it and flattens the hierarchy.
 */
export const typeScale = {
  display: {
    fontSize: ['40px', '64px'],
    lineHeight: ['48px', '72px'],
    fontWeight: fontWeights.bold,
  },
  pageTitle: {
    fontSize: ['32px', '44px'],
    lineHeight: ['40px', '54px'],
    fontWeight: fontWeights.semibold,
  },
  sectionTitle: {
    fontSize: ['25px', '28px'],
    lineHeight: ['34px', '38px'],
    fontWeight: fontWeights.semibold,
  },
  cardTitle: {
    fontSize: ['22px', '22px'],
    lineHeight: ['30px', '30px'],
    fontWeight: fontWeights.semibold,
  },
  body: {
    fontSize: ['16px', '16px'],
    lineHeight: ['26px', '26px'],
    fontWeight: fontWeights.regular,
  },
  prose: {
    fontSize: ['18px', '19px'],
    lineHeight: ['30px', '32px'],
    fontWeight: fontWeights.regular,
  },
  meta: {
    fontSize: ['13px', '13px'],
    lineHeight: ['20px', '20px'],
    fontWeight: fontWeights.medium,
  },
} as const

export const layout = {
  /** Comfortable measure for long-form prose. */
  prose: '68ch',
  /** Outer content frame; the compact header is capped to it. */
  content: '1120px',
  /**
   * The reader page's own, wider frame - `ReaderFrame`'s symmetric
   * `200px` TOC column and its mirrored margin on the article's other side
   * (`w11.1`) cost 2 * (200px rail + 64px gap) = 528px, plus the 48px side
   * gutter, before the article column even starts. Against the shared
   * `content` frame (1120px) that left only 808px for the article at every
   * desktop width from 1120px up to 2560px and beyond - never enough to reach
   * the 68ch prose measure (~873px at the desktop 19px prose size), so the
   * reading column read as cramped no matter how wide the screen actually was
   * (`w11.2`). `content` itself is untouched - it is the frame every other
   * page still measures against - so this is a second, reader-only frame:
   * 528px of margin + 48px of gutter + roughly 873px for the article to
   * finally reach its own measure, rounded up for a small buffer.
   */
  readingFrame: '1456px',
  header: {
    mobile: '64px',
    desktop: '72px',
  },
} as const

/**
 * Layout transitions, taken from the approved prototype's own media queries.
 * Chakra breakpoints are min-widths, so each one sits a pixel above the
 * prototype's max-width boundary:
 *
 *   sm 681px   above it the desktop navigation and the larger type ramp apply
 *              (prototype `max-width: 680px` collapses nav and shrinks headings)
 *   md 801px   above it multi-column content grids apply
 *   lg 1001px  the full desktop composition: tall header, widest type
 *   xl 1169px  above it the header and feature grids stop tightening
 *
 * These are not the same thing as the widths the system is reviewed at - see
 * `reviewWidths`. Mixing the two produces breakpoints that no design decision
 * ever asked for.
 */
export const breakpoints = {
  sm: '681px',
  md: '801px',
  lg: '1001px',
  xl: '1169px',
} as const

/**
 * Widths every component is checked at before it passes review. A review width
 * deliberately sits inside a range rather than on its boundary.
 */
export const reviewWidths = ['375px', '768px', '1024px', '1440px'] as const

export const elevation = {
  card: {
    light: '0 8px 24px rgb(23 33 58 / 6%)',
    dark: '0 8px 24px rgb(0 0 0 / 20%)',
  },
} as const

export const focusRing = {
  width: '2px',
  offset: '3px',
} as const

export type Palette = typeof palette
export type SpaceToken = keyof typeof space
export type RadiusToken = keyof typeof radii
export type BlurToken = keyof typeof blur
export type TypeScaleToken = keyof typeof typeScale
export type BreakpointToken = keyof typeof breakpoints

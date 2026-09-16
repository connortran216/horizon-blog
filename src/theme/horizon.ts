/**
 * Horizon Design System v2 - Chakra adapter.
 *
 * **This is the theme the app mounts.** Release M1 swapped it in at `App.tsx`,
 * so every route renders under it.
 *
 * It was built as a second, separate theme rather than a merge, because the two
 * systems share twelve token names with different values - `bg.page`,
 * `text.primary`, `action.primary` and friends. Keeping them apart let v2 hold
 * the clean names while the legacy theme kept its own, so nothing shipped
 * changed appearance until the swap was reviewed on its own.
 *
 * The legacy "Obsidian" theme that used to live at `./index.ts` is gone -
 * release M8 (`horizon-blog-y2e.9.1`) removed it along with the raw palette it
 * exposed as `colors.obsidian`, which no production file read directly anymore.
 *
 * That same release also removed the semantic alias bridge (`legacyAliases`)
 * that used to sit here: the last production call sites reading pre-v2 names
 * (`bg.secondary`, `text.tertiary`, `border.default`, `accent.primary`,
 * `action.active`, `action.glow`, `loading.glow`, `bg.glass`, ...) were
 * migrated onto their v2 equivalents first, so the bridge had nothing left to
 * carry.
 */

import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

import './fonts.css'
import './bitter.css'
import {
  breakpoints,
  componentTokens,
  duration,
  easing,
  elevation,
  focusRing,
  fontFamilies,
  fontWeights,
  layout,
  palette,
  radii,
  reducedMotionQuery,
  sectionSpace,
  semanticColors,
  space,
  transform,
  transitionFor,
  typeScale,
} from './tokens'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

/** Every paired role, handed to Chakra in its own light/dark shape. */
const semanticColorTokens = Object.fromEntries(
  Object.entries(semanticColors).map(([token, pair]) => [
    token,
    { default: pair.light, _dark: pair.dark },
  ]),
)

/**
 * The type ramp switches at `sm` (681px), matching the prototype: its
 * `max-width: 680px` query is what drops headings to the mobile sizes. Switching
 * at the desktop breakpoint instead would leave tablets on mobile type.
 */
const responsive = (scale: { fontSize: readonly string[]; lineHeight: readonly string[] }) => ({
  fontSize: { base: scale.fontSize[0], sm: scale.fontSize[1] },
  lineHeight: { base: scale.lineHeight[0], sm: scale.lineHeight[1] },
})

const textStyles = {
  /*
   * The one recipe that carries the display face. `display` is the page title
   * and nothing else - Home, About, Contact and the CV - so binding the family
   * here gives those four a voice without restyling every `Heading` in the app.
   * `sectionTitle` and below stay on the body face deliberately.
   */
  display: {
    ...responsive(typeScale.display),
    fontWeight: typeScale.display.fontWeight,
    fontFamily: fontFamilies.display,
  },
  pageTitle: { ...responsive(typeScale.pageTitle), fontWeight: typeScale.pageTitle.fontWeight },
  sectionTitle: {
    ...responsive(typeScale.sectionTitle),
    fontWeight: typeScale.sectionTitle.fontWeight,
  },
  cardTitle: { ...responsive(typeScale.cardTitle), fontWeight: typeScale.cardTitle.fontWeight },
  body: { ...responsive(typeScale.body), fontWeight: typeScale.body.fontWeight },
  prose: { ...responsive(typeScale.prose), fontWeight: typeScale.prose.fontWeight },
  meta: { ...responsive(typeScale.meta), fontWeight: typeScale.meta.fontWeight },
}

const focusVisible = {
  outline: `${focusRing.width} solid`,
  outlineColor: 'focus.ring',
  outlineOffset: focusRing.offset,
  boxShadow: 'none',
}

/**
 * A busy control is not an inactive one.
 *
 * A loading control carries `aria-disabled="true"` so it stops accepting clicks
 * while keeping focus - which is correct, but Chakra's `_disabled` styling
 * matches `[aria-disabled=true]` as well as `[disabled]`, so a button that was
 * merely working painted itself with the disabled fill. Measured in the
 * gallery, that put "Publishing post" at 1.81:1 in light and 1.64:1 in dark
 * against a 4.5:1 floor.
 *
 * WCAG 1.4.3 exempts *inactive* components, not busy ones, and a progress label
 * is exactly the text a reader needs while waiting. So a busy control keeps its
 * resting fill; the spinner and the label carry the state instead. Declared
 * after `_disabled` so it wins on order, the two selectors having equal weight.
 *
 * Both selectors are needed because busy arrives by two routes: our own
 * `controlState` marks it with `aria-busy`, while Chakra's `isLoading` sets
 * `disabled` and `data-loading`. Matching only the first left the retry buttons
 * at 3.23:1.
 */
const busyKeepsRestingFill = (style: Record<string, unknown>) => ({
  '&[aria-busy="true"], &[data-loading]': { ...style, opacity: 1 },
})

/**
 * Press travel: 1px of push rather than a third colour step, because the
 * approved palette has no darker action value and inventing one would put an
 * unverified pigment in front of every primary action.
 */
const pressTravel = 'translateY(1px)'

export const horizonTheme = extendTheme({
  config,

  breakpoints,

  colors: { horizon: palette },

  semanticTokens: {
    colors: { ...semanticColorTokens },
    shadows: {
      card: { default: elevation.card.light, _dark: elevation.card.dark },
    },
  },

  fonts: {
    heading: fontFamilies.heading,
    body: fontFamilies.body,
    mono: fontFamilies.mono,
  },

  fontWeights,

  space: {
    1: space[1],
    2: space[2],
    3: space[3],
    4: space[4],
    6: space[6],
    8: space[8],
    12: space[12],
    16: space[16],
    24: space[24],
  },

  sizes: {
    prose: layout.prose,
    content: layout.content,
    reading: layout.readingFrame,
    headerMobile: layout.header.mobile,
    headerDesktop: layout.header.desktop,
    sectionMobile: sectionSpace.mobile,
    sectionDesktop: sectionSpace.desktop,
  },

  radii: {
    control: radii.control,
    card: radii.card,
    feature: radii.feature,
    tag: radii.tag,
  },

  transition: {
    duration,
    easing: { standard: easing.standard },
  },

  textStyles,

  styles: {
    global: {
      body: {
        bg: 'bg.page',
        color: 'text.primary',
        fontFamily: 'body',
        ...textStyles.body,
        transition: `${transitionFor('background-color')}, ${transitionFor('color')}`,
      },
      '::selection': {
        bg: 'bg.selection',
      },
      /*
       * A string with nowhere to break must not be allowed to set a box's width.
       *
       * Chakra's reset leaves everything at `overflow-wrap: break-word`, which
       * moves a long word to the next line but does not count as a break when
       * the browser computes min-content width. A flex or grid child is floored
       * at min-content by `min-width: auto`, so one unbreakable token - a URL, a
       * hash, an identifier, Vietnamese written without spaces - makes its box
       * as wide as the token and the layout gives way above it. Measured at
       * 375px with a 56-character token: the sign-in heading rendered 1042px
       * wide and took the whole page sideways to 709px; the CV name rendered
       * 1224px inside a 293px column and `article.cv-document`, which hides its
       * overflow, cut the text off with nothing to say it had.
       *
       * `anywhere` is the one value that also shrinks min-content, so the floor
       * drops and the box fits. That is the entire fix: adding `min-width: 0`
       * alongside it changes nothing, and adding it *instead* changes nothing at
       * all - both measured. The twenty components carrying a hand-placed
       * `minWidth: 0` were each treating a symptom.
       *
       * Block code is the deliberate exception. A code listing is read by line
       * and breaking a token mid-word corrupts it, so `pre` keeps `normal` and
       * scrolls instead. Inline `code` inside a sentence wraps like the prose
       * around it; a long identifier there would otherwise burst the article.
       */
      '*': {
        overflowWrap: 'anywhere',
      },
      'pre, pre *': {
        overflowWrap: 'normal',
      },
      '*:focus-visible': focusVisible,
      /*
       * Reduced motion collapses duration instead of removing the rule, so a
       * hover colour, a focus ring or a saved state still lands - it just lands
       * immediately, with no travel.
       */
      [`@media ${reducedMotionQuery}`]: {
        '*, *::before, *::after': {
          animationDuration: '0.01ms !important',
          animationIterationCount: '1 !important',
          transitionDuration: '0.01ms !important',
          scrollBehavior: 'auto !important',
        },
      },
    },
  },

  components: {
    Button: {
      baseStyle: {
        fontWeight: fontWeights.semibold,
        borderRadius: componentTokens.control.radius,
        // Longhand rather than the `transition` shorthand: Chakra's base style
        // already sets these three, and two competing declarations on one
        // property is a coin flip decided by emission order.
        transitionProperty: 'common',
        transitionDuration: componentTokens.control.transition,
        transitionTimingFunction: 'standard',
        _focusVisible: focusVisible,
        /*
         * Depth on hover and travel on press, for every tone at once.
         *
         * They belong here and not on the component. A `_hover` style prop
         * replaces the variant's `_hover` rather than merging into it, so a
         * component that wrote the lift that way silently took the variant's
         * hover colour with it - which is exactly what happened, and why every
         * button in the system hovered with a lift and no colour change.
         *
         * Transform only, capped by the motion token, so a row of buttons does
         * not reflow when the pointer crosses one.
         */
        _hover: {
          transform: `translateY(${transform.hoverLift})`,
          /*
           * A pointer that is pressing is also hovering, and `:hover:active` is
           * one selector heavier than `:hover`, so the press travel wins here
           * without depending on which of the two rules Chakra emits last.
           */
          _active: { transform: pressTravel },
        },
        _active: { transform: pressTravel },
      },
      /*
       * Each variant is a function so it replaces Chakra's colorScheme-derived
       * default outright. Merging into it instead leaves shards behind - the
       * default `_active` resolves against a colorScheme this system does not
       * use and yields `undefined.700`. For the same reason every variant keeps
       * stating `_hover` and `_active`: an omitted key is a key Chakra's own
       * default still fills in.
       *
       * What each one states there is the colour. The movement - the hover lift
       * and the press travel - is in `baseStyle`, so a tone cannot acquire one
       * without the other.
       */
      variants: {
        solid: () => ({
          bg: componentTokens.control.solidBg,
          color: componentTokens.control.solidFg,
          _hover: {
            bg: componentTokens.control.solidHoverBg,
            _disabled: { bg: componentTokens.control.solidDisabledBg },
          },
          _active: { bg: componentTokens.control.solidHoverBg },
          _disabled: { bg: componentTokens.control.solidDisabledBg, opacity: 1 },
          ...busyKeepsRestingFill({
            bg: componentTokens.control.solidBg,
            color: componentTokens.control.solidFg,
          }),
        }),
        ghost: () => ({
          bg: 'transparent',
          color: componentTokens.control.quietFg,
          _hover: {
            bg: componentTokens.control.quietHoverBg,
            color: componentTokens.control.quietHoverFg,
          },
          _active: { bg: componentTokens.control.quietHoverBg },
          _disabled: { color: componentTokens.control.disabledFg, opacity: 1 },
          ...busyKeepsRestingFill({ color: componentTokens.control.quietFg }),
        }),
        outline: () => ({
          bg: 'transparent',
          border: '1px solid',
          borderColor: componentTokens.control.solidBg,
          color: componentTokens.control.solidBg,
          _hover: { bg: componentTokens.control.quietHoverBg },
          _active: { bg: componentTokens.control.quietHoverBg },
          _disabled: {
            borderColor: 'border.disabled',
            color: componentTokens.control.disabledFg,
            opacity: 1,
          },
          ...busyKeepsRestingFill({
            borderColor: componentTokens.control.solidBg,
            color: componentTokens.control.solidBg,
          }),
        }),
        /** Chakra's own `link` variant is grey; the system's inline link is not. */
        link: () => ({
          padding: 0,
          height: 'auto',
          lineHeight: 'normal',
          verticalAlign: 'baseline',
          bg: 'transparent',
          color: componentTokens.reader.link,
          _hover: { textDecoration: 'underline', _disabled: { textDecoration: 'none' } },
          _active: { color: componentTokens.reader.link },
          _disabled: { color: componentTokens.control.disabledFg, opacity: 1 },
        }),
        danger: () => ({
          bg: 'transparent',
          border: '1px solid',
          borderColor: componentTokens.control.dangerFg,
          color: componentTokens.control.dangerFg,
          _hover: { bg: componentTokens.control.dangerSurface },
          _active: { bg: componentTokens.control.dangerSurface },
          _disabled: {
            borderColor: 'border.disabled',
            color: componentTokens.control.disabledFg,
            opacity: 1,
          },
          ...busyKeepsRestingFill({
            borderColor: componentTokens.control.dangerFg,
            color: componentTokens.control.dangerFg,
          }),
        }),
      },
      defaultProps: { variant: 'solid' },
    },

    /*
     * `_focusVisible.borderColor` and `addon.bg` are set on purpose: Chakra's
     * own outline variant hard-codes a focus blue and a grey addon, and the
     * merge keeps whatever we do not state.
     */
    Input: {
      variants: {
        outline: {
          field: {
            bg: componentTokens.field.bg,
            borderColor: componentTokens.field.border,
            borderRadius: componentTokens.field.radius,
            color: componentTokens.field.fg,
            transition: transitionFor('border-color', 'fast'),
            _hover: { borderColor: componentTokens.field.hoverBorder },
            _placeholder: { color: componentTokens.field.placeholder },
            _invalid: { borderColor: componentTokens.field.invalidBorder, boxShadow: 'none' },
            _disabled: {
              bg: componentTokens.field.disabledBg,
              borderColor: componentTokens.field.disabledBorder,
              color: componentTokens.field.disabledFg,
              opacity: 1,
            },
            _focusVisible: { ...focusVisible, borderColor: componentTokens.field.hoverBorder },
          },
          addon: {
            bg: 'bg.subtle',
            borderColor: componentTokens.field.border,
            color: componentTokens.field.hint,
          },
        },
      },
      defaultProps: { variant: 'outline' },
    },

    Textarea: {
      variants: {
        outline: {
          bg: componentTokens.field.bg,
          borderColor: componentTokens.field.border,
          borderRadius: componentTokens.field.radius,
          color: componentTokens.field.fg,
          transition: transitionFor('border-color', 'fast'),
          _hover: { borderColor: componentTokens.field.hoverBorder },
          _placeholder: { color: componentTokens.field.placeholder },
          _invalid: { borderColor: componentTokens.field.invalidBorder, boxShadow: 'none' },
          _disabled: {
            bg: componentTokens.field.disabledBg,
            borderColor: componentTokens.field.disabledBorder,
            color: componentTokens.field.disabledFg,
            opacity: 1,
          },
          _focusVisible: { ...focusVisible, borderColor: componentTokens.field.hoverBorder },
        },
      },
      defaultProps: { variant: 'outline' },
    },

    FormLabel: {
      baseStyle: { color: componentTokens.field.label, ...textStyles.meta },
    },

    Link: {
      baseStyle: {
        color: componentTokens.reader.link,
        transition: transitionFor('color', 'fast'),
        _hover: { textDecoration: 'underline' },
        _focusVisible: focusVisible,
      },
    },

    Card: {
      baseStyle: {
        container: {
          bg: componentTokens.card.bg,
          borderColor: componentTokens.card.border,
          borderRadius: componentTokens.card.radius,
          boxShadow: 'card',
        },
      },
    },

    /*
     * Chakra drives menu colour through `--menu-bg` / `--menu-shadow`, and its
     * defaults point those at grey and white. Setting `bg` alone wins for rest
     * and hover but leaves `_active` and `_expanded` - which only move the
     * variable - with no background at all, so both the variables and the
     * states are stated here.
     */
    Menu: {
      baseStyle: {
        list: {
          '--menu-bg': 'colors.bg.elevated',
          '--menu-shadow': 'shadows.card',
          _dark: {
            '--menu-bg': 'colors.bg.elevated',
            '--menu-shadow': 'shadows.card',
          },
          bg: componentTokens.overlay.bg,
          borderColor: componentTokens.overlay.border,
          borderRadius: componentTokens.overlay.radius,
          boxShadow: 'card',
        },
        item: {
          '--menu-bg': 'colors.bg.elevated',
          _dark: { '--menu-bg': 'colors.bg.elevated' },
          bg: 'transparent',
          color: 'text.primary',
          transitionDuration: componentTokens.control.transition,
          transitionTimingFunction: 'standard',
          _hover: { bg: 'bg.subtle' },
          _focus: {
            '--menu-bg': 'colors.bg.subtle',
            _dark: { '--menu-bg': 'colors.bg.subtle' },
            bg: 'bg.subtle',
          },
          _active: {
            '--menu-bg': 'colors.bg.subtle',
            _dark: { '--menu-bg': 'colors.bg.subtle' },
            bg: 'bg.subtle',
          },
          _expanded: {
            '--menu-bg': 'colors.bg.subtle',
            _dark: { '--menu-bg': 'colors.bg.subtle' },
            bg: 'bg.subtle',
          },
        },
      },
    },

    Modal: {
      baseStyle: {
        overlay: { bg: componentTokens.overlay.scrim },
        dialog: {
          bg: componentTokens.overlay.bg,
          borderRadius: componentTokens.overlay.radius,
        },
        header: { color: 'text.primary', ...textStyles.cardTitle },
        body: { color: 'text.primary' },
        footer: { borderTopColor: componentTokens.overlay.border },
      },
    },
  },
})

export default horizonTheme

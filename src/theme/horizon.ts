/**
 * Horizon Design System v2 - Chakra adapter.
 *
 * This is a second, separate theme. The legacy theme in `./index.ts` keeps its
 * own values and stays mounted on every production route, so nothing here can
 * change how a shipped page looks. v2 components and the component gallery mount
 * this theme instead.
 *
 * The two systems share twelve token names with different values - `bg.page`,
 * `text.primary`, `action.primary` and friends - which is exactly why they are
 * kept in separate themes rather than merged behind a prefix. v2 keeps the clean
 * names; page migration is then a provider swap in `main.tsx` followed by
 * deleting the legacy theme, not a rename of every call site.
 *
 * Do not import this from a production page. The migration gate
 * (`horizon-blog-dsv2.7.3`) is what opens that door.
 */

import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

import './fonts.css'
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
  display: { ...responsive(typeScale.display), fontWeight: typeScale.display.fontWeight },
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

export const horizonTheme = extendTheme({
  config,

  breakpoints,

  colors: { horizon: palette },

  semanticTokens: {
    colors: semanticColorTokens,
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
      },
      /*
       * Each variant is a function so it replaces Chakra's colorScheme-derived
       * default outright. Merging into it instead leaves shards behind - the
       * default `_active` resolves against a colorScheme this system does not
       * use and yields `undefined.700`.
       *
       * Press feedback is 1px of travel rather than a third colour step: the
       * approved palette has no darker action value, and inventing one would put
       * an unverified pigment in front of every primary action.
       */
      variants: {
        solid: () => ({
          bg: componentTokens.control.solidBg,
          color: componentTokens.control.solidFg,
          _hover: {
            bg: componentTokens.control.solidHoverBg,
            _disabled: { bg: componentTokens.control.solidDisabledBg },
          },
          _active: { bg: componentTokens.control.solidHoverBg, transform: 'translateY(1px)' },
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
          _active: { bg: componentTokens.control.quietHoverBg, transform: 'translateY(1px)' },
          _disabled: { color: componentTokens.control.disabledFg, opacity: 1 },
          ...busyKeepsRestingFill({ color: componentTokens.control.quietFg }),
        }),
        outline: () => ({
          bg: 'transparent',
          border: '1px solid',
          borderColor: componentTokens.control.solidBg,
          color: componentTokens.control.solidBg,
          _hover: { bg: componentTokens.control.quietHoverBg },
          _active: { bg: componentTokens.control.quietHoverBg, transform: 'translateY(1px)' },
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
          _active: { bg: componentTokens.control.dangerSurface, transform: 'translateY(1px)' },
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

/**
 * Horizon Design System v2 - component aliases.
 *
 * An alias gives a component family a stable name for a decision, so the family
 * can be retuned in one place instead of at every call site. Aliases point at
 * semantic roles and primitive scales; they never hold a raw value.
 *
 * Colour references go through `color()`. It is an identity function whose only
 * job is to make a mistyped role a compile error while keeping the literal type,
 * so `componentTokens.card.bg` still narrows to `'bg.surface'`.
 *
 * These are component families, not pages. A token that only one route could
 * ever use does not belong here - that is a page override, and page overrides
 * are out of scope until the migration gate passes.
 */

import { blur, layout, radii, space, typeScale } from './primitives'
import type { SemanticColorToken } from './semantic'

const color = <T extends SemanticColorToken>(token: T): T => token

export const componentTokens = {
  /** Compact floating site header, capped to the content frame. */
  header: {
    height: layout.header,
    maxWidth: layout.content,
    bg: color('bg.surface'),
    border: color('border.subtle'),
    radius: radii.card,
    transition: 'navigation',
    itemRest: color('text.secondary'),
    itemActive: color('text.primary'),
    itemIndicator: color('action.primary'),
    itemHoverBg: color('action.subtle'),
  },

  /** Buttons, icon buttons and rail controls. */
  control: {
    radius: radii.control,
    paddingX: space[4],
    minTouchTarget: '44px',
    transition: 'fast',
    solidBg: color('action.primary'),
    solidHoverBg: color('action.hover'),
    solidFg: color('text.onAction'),
    solidDisabledBg: color('action.disabled'),
    quietFg: color('text.secondary'),
    quietHoverBg: color('action.subtle'),
    quietHoverFg: color('text.primary'),
    disabledFg: color('text.disabled'),
    dangerFg: color('status.danger'),
    dangerSurface: color('status.dangerSurface'),
  },

  /** Inputs, textareas, selects and their labelling. */
  field: {
    radius: radii.control,
    transition: 'fast',
    bg: color('bg.surface'),
    border: color('border.control'),
    hoverBorder: color('action.primary'),
    fg: color('text.primary'),
    placeholder: color('text.muted'),
    label: color('text.secondary'),
    hint: color('text.muted'),
    invalidBorder: color('status.danger'),
    invalidText: color('status.danger'),
    disabledBg: color('bg.disabled'),
    disabledBorder: color('border.disabled'),
    disabledFg: color('text.disabled'),
  },

  /** The default content card. One owner for border, radius, shadow and lift. */
  card: {
    radius: radii.card,
    padding: space[6],
    transition: 'normal',
    title: typeScale.cardTitle,
    meta: typeScale.meta,
    bg: color('bg.surface'),
    border: color('border.subtle'),
    hoverBg: color('bg.subtle'),
  },

  /** Layered editorial surfaces: signature story, featured artwork, About depth. */
  feature: {
    radius: radii.feature,
    transition: 'reveal',
    bg: color('bg.elevated'),
    border: color('border.subtle'),
    accent: color('accent.lime'),
    accentFg: color('text.onAccent'),
    /*
     * The ambient scene a feature surface may carry. Grouped here rather than
     * on a page alias because the surface family owns it: Home's Signature
     * artwork and About's hero are the two surfaces `DESIGN.md` sanctions it
     * for, and neither is a page-specific token.
     */
    ambientGlow: color('ambient.glow'),
    ambientAccentGlow: color('ambient.accentGlow'),
    ambientSweep: color('ambient.sweep'),
    ambientBlur: blur.ambient,
    ambientBloom: blur.bloom,
  },

  /*
   * A signal carried along a line - `SignalRoute` / `SignalLine`, the inner
   * pages' share of Home's Dawn language. The rail is a hairline in either the
   * quiet divider role or the action colour; the tip borrows the field's own
   * ink: a shade-deeper cobalt on the light canvas, lime on the dark one, each
   * in the ambient glow of its theme. No new pigment.
   */
  signal: {
    rail: color('border.subtle'),
    railActive: color('action.primary'),
    spark: color('action.hover'),
    sparkDark: color('accent.lime'),
    halo: color('ambient.glow'),
    haloDark: color('ambient.accentGlow'),
    sparkSize: space[1],
    haloBlur: blur.bloom,
    transition: 'reveal',
  },

  /** Long-form reading. Prose stays calm; only progress and TOC move. */
  reader: {
    measure: layout.prose,
    prose: typeScale.prose,
    codeRadius: radii.control,
    transition: 'fast',
    fg: color('text.primary'),
    secondaryFg: color('text.secondary'),
    link: color('link.default'),
    codeBg: color('bg.code'),
    selectionBg: color('bg.selection'),
    progressTrack: color('loading.track'),
    progressIndicator: color('loading.indicator'),
    tocRest: color('text.muted'),
    tocActive: color('action.primary'),
  },

  /** Series carries a book identity, distinct from the post card. */
  series: {
    radius: radii.card,
    coverRadius: radii.feature,
    transition: 'normal',
    bg: color('bg.surface'),
    border: color('border.subtle'),
    connector: color('border.subtle'),
    connectorActive: color('action.primary'),
    partRest: color('text.secondary'),
    partCurrent: color('text.primary'),
  },

  /** Empty, error, permission, offline and success feedback. */
  feedback: {
    radius: radii.card,
    transition: 'normal',
    neutralBg: color('bg.subtle'),
    neutralFg: color('text.secondary'),
    successBg: color('status.successSurface'),
    successFg: color('status.success'),
    warningBg: color('status.warningSurface'),
    warningFg: color('status.warning'),
    dangerBg: color('status.dangerSurface'),
    dangerFg: color('status.danger'),
    skeletonBase: color('loading.base'),
    skeletonHighlight: color('loading.highlight'),
  },

  /** Dense authoring and administration surfaces. */
  workspace: {
    radius: radii.control,
    transition: 'fast',
    bg: color('bg.page'),
    panelBg: color('bg.surface'),
    border: color('border.subtle'),
    toolbarBg: color('bg.subtle'),
    autosaveIdle: color('text.muted'),
    autosaveSaving: color('text.secondary'),
    autosaveSaved: color('status.success'),
    autosaveFailed: color('status.danger'),
    tableHeaderBg: color('bg.subtle'),
    tableRowHoverBg: color('bg.subtle'),
    tableBorder: color('border.subtle'),
  },

  /** Images and other resolved media. */
  media: {
    radius: radii.card,
    transition: 'normal',
    placeholderBg: color('media.placeholder'),
    placeholderAccent: color('media.placeholderAccent'),
    errorBg: color('media.error'),
    errorFg: color('status.danger'),
  },

  /** Modals, menus and popovers. */
  overlay: {
    radius: radii.card,
    transition: 'normal',
    scrim: color('bg.overlay'),
    bg: color('bg.elevated'),
    border: color('border.subtle'),
  },
} as const

export type ComponentFamily = keyof typeof componentTokens

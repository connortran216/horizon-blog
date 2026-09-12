/**
 * Depth is a role, not a shadow.
 *
 * `DESIGN.md` gives one elevation value for the whole system and reserves
 * layered editorial depth for featured discovery surfaces. So a component asks
 * for the role it plays - flat, raised, feature - and this module answers with
 * token names. No component ever writes a shadow, and retuning depth is a change
 * to `elevation` in the token source plus this table, nowhere else.
 *
 * `boxShadow: 'card'` is the semantic shadow `horizonTheme` registers, which
 * already pairs a light and a dark value. `'none'` is an absence of depth, not a
 * value, which is why it is a literal here and not a token.
 */

import {
  componentTokens,
  transform,
  transitionFor,
  type SemanticColorToken,
} from '../../../theme/tokens'

/** Identity function that makes a mistyped semantic role a compile error. */
const role = <T extends SemanticColorToken>(token: T): T => token

export type SurfaceDepth = 'flat' | 'raised' | 'feature'

/** What a depth role decides. Clipping is not among them - see `surfaceStyle`. */
interface SurfaceDepthStyle {
  readonly bg: string
  readonly borderColor: string
  readonly borderWidth: string
  readonly borderRadius: string
  readonly boxShadow: string
}

export interface SurfaceStyle extends SurfaceDepthStyle {
  readonly overflow: 'hidden'
}

const depthStyles = {
  /** Sits on the page. Its own border is the only thing separating it. */
  flat: {
    bg: componentTokens.card.bg,
    borderColor: componentTokens.card.border,
    borderWidth: '1px',
    borderRadius: componentTokens.card.radius,
    boxShadow: 'none',
  },
  /** Lifted off the page. The default content card. */
  raised: {
    bg: componentTokens.card.bg,
    borderColor: componentTokens.card.border,
    borderWidth: '1px',
    borderRadius: componentTokens.card.radius,
    boxShadow: 'card',
  },
  /** Editorial depth: the elevated canvas and the wider feature radius. */
  feature: {
    bg: componentTokens.feature.bg,
    borderColor: componentTokens.feature.border,
    borderWidth: '1px',
    borderRadius: componentTokens.feature.radius,
    boxShadow: 'card',
  },
} as const satisfies Record<SurfaceDepth, SurfaceDepthStyle>

export const surfaceDepths = Object.keys(depthStyles) as SurfaceDepth[]

/**
 * Every surface clips, at every depth, and that is deliberately not a choice.
 *
 * A surface draws a radius; anything it contains that reached its corner would
 * poke out of the shape the reader sees. So clipping travels with the radius
 * rather than beside it, and it lives in the returned style - not as a literal
 * on the `Box` that a caller could override through `BoxProps` - so a test can
 * hold the system to it.
 *
 * It is also what makes a full-bleed child possible: a child that hands its
 * corners over (`containerCorners` in `components/media/media.logic.ts`) is
 * relying on this clip to give them back. See `surfaceClipsChildren`.
 */
export function surfaceStyle(depth: SurfaceDepth): SurfaceStyle {
  return { ...depthStyles[depth], overflow: 'hidden' }
}

/**
 * Whether this surface can take over a child's corners.
 *
 * Only a surface that clips can: it draws the radius and cuts everything inside
 * it to that shape, so the child renders square and still reads as rounded.
 * Every depth role clips today, so this is always true - it is a function
 * rather than a constant because the answer is a property of the surface, and a
 * surface that ever stopped clipping must stop being a full-bleed container in
 * the same change rather than silently keep the promise in its type.
 */
export function surfaceClipsChildren(depth: SurfaceDepth): boolean {
  return surfaceStyle(depth).overflow === 'hidden'
}

export interface SurfaceInteractionStyle {
  readonly transition: string
  readonly _hover: { transform: string; borderColor: string; boxShadow: string }
  readonly _active: { transform: string }
}

/**
 * Hover depth for a surface that is itself a link or a button target.
 *
 * Transform and shadow only. A surface that thickened its border or gained
 * padding on hover would move every sibling beside it; `translateY` and
 * `box-shadow` are both outside layout. The lift is the 2px the motion tokens
 * allow, and the border colour change is what carries the state for anyone who
 * cannot perceive a 2px translation. None of it replaces a persistent
 * affordance - a hover state is feedback, never the only signal.
 */
export function surfaceInteraction(depth: SurfaceDepth): SurfaceInteractionStyle {
  return {
    transition: `${transitionFor('transform')}, ${transitionFor('border-color')}, ${transitionFor('box-shadow')}`,
    _hover: {
      transform: `translateY(${transform.hoverLift})`,
      borderColor: depth === 'feature' ? componentTokens.feature.accent : role('border.control'),
      boxShadow: 'card',
    },
    _active: { transform: 'translateY(0)' },
  }
}

export type DividerOrientation = 'horizontal' | 'vertical'

export interface DividerStyle {
  readonly borderColor: string
  readonly borderTopWidth?: string
  readonly borderLeftWidth?: string
  readonly width?: string
  readonly height?: string
  readonly alignSelf?: string
}

/** A divider is one hairline in one direction. It never carries a shadow. */
export function dividerStyle(orientation: DividerOrientation): DividerStyle {
  if (orientation === 'vertical') {
    return {
      borderColor: componentTokens.card.border,
      borderLeftWidth: '1px',
      width: '0',
      alignSelf: 'stretch',
    }
  }

  return {
    borderColor: componentTokens.card.border,
    borderTopWidth: '1px',
    width: '100%',
    height: '0',
  }
}

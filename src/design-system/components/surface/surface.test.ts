import { describe, expect, it } from 'vitest'

import { componentTokens, radii, semanticColors, transform } from '../../../theme/tokens'
import {
  dividerStyle,
  surfaceClipsChildren,
  surfaceDepths,
  surfaceInteraction,
  surfaceStyle,
  type SurfaceDepth,
} from './surface.logic'

/**
 * dsv2.3.1 acceptance 2: "Surfaces define depth roles rather than hardcoded
 * shadows."
 *
 * The check that matters is negative: no depth role may resolve to anything
 * that looks like a CSS shadow value. `card` is the semantic shadow token
 * `horizonTheme` registers, and `none` is an absence of depth.
 */
describe('surface depth roles', () => {
  it('offers exactly the three documented roles', () => {
    expect(surfaceDepths).toEqual(['flat', 'raised', 'feature'])
  })

  it('never resolves a depth role to a literal shadow value', () => {
    for (const depth of surfaceDepths) {
      expect(['card', 'none']).toContain(surfaceStyle(depth).boxShadow)
    }
  })

  it('resolves flat to no depth and raised to the semantic card shadow', () => {
    expect(surfaceStyle('flat').boxShadow).toBe('none')
    expect(surfaceStyle('raised').boxShadow).toBe('card')
  })

  it('gives the feature role the editorial canvas and the wider radius', () => {
    expect(surfaceStyle('feature').bg).toBe(componentTokens.feature.bg)
    expect(surfaceStyle('feature').borderRadius).toBe(componentTokens.feature.radius)
    expect(surfaceStyle('feature').borderRadius).not.toBe(surfaceStyle('raised').borderRadius)
  })

  it('resolves every colour to a paired semantic role, never a raw value', () => {
    for (const depth of surfaceDepths) {
      const style = surfaceStyle(depth)

      expect(Object.keys(semanticColors)).toContain(style.bg)
      expect(Object.keys(semanticColors)).toContain(style.borderColor)
    }
  })

  it('keeps a card-role surface on the card radius token', () => {
    for (const depth of ['flat', 'raised'] satisfies SurfaceDepth[]) {
      expect(surfaceStyle(depth).borderRadius).toBe(componentTokens.card.radius)
    }
  })
})

/**
 * `horizon-blog-dsv2.7.3`: a full-bleed cover works because the surface around
 * it draws the corners and clips to them. Clipping used to be a literal on the
 * `Box` that any caller could override through `BoxProps`; it is part of the
 * style contract now, so these tests can hold the system to it.
 */
describe('the clip that lets a surface own a child’s corners', () => {
  it('clips at every depth, so the radius it draws is the shape the reader sees', () => {
    for (const depth of surfaceDepths) {
      expect(surfaceStyle(depth).overflow).toBe('hidden')
      expect(surfaceClipsChildren(depth)).toBe(true)
    }
  })

  it('supplies a radius from the token scale to whatever it clips', () => {
    for (const depth of surfaceDepths) {
      expect(Object.values(radii)).toContain(surfaceStyle(depth).borderRadius)
    }
  })

  it('hands a card-depth child the card radius - the one the prototype draws', () => {
    expect(surfaceStyle('raised').borderRadius).toBe(componentTokens.card.radius)
    expect(surfaceClipsChildren('raised')).toBe(true)
  })

  it('carries the clip with the depth style rather than beside it', () => {
    // If `overflow` ever stopped travelling with the style, a Surface could draw
    // a radius without clipping to it and a full-bleed child would square off
    // the corners it had handed over.
    for (const depth of surfaceDepths) {
      expect(Object.keys(surfaceStyle(depth))).toContain('overflow')
    }
  })
})

/**
 * DESIGN.md: "hover depth cannot change layout footprint", and CONVENTIONS.md
 * caps the lift at 2px. Both are checked against the motion tokens rather than
 * against a number written here.
 */
describe('surfaceInteraction', () => {
  it('lifts with a transform, at the distance the motion tokens allow', () => {
    expect(surfaceInteraction('raised')._hover.transform).toBe(`translateY(${transform.hoverLift})`)
    expect(transform.hoverLift).toBe('-2px')
  })

  it('animates only properties that are outside layout', () => {
    const transition = surfaceInteraction('flat').transition
    // Each entry is `<property> <duration> <easing>`; the easing carries commas.
    const properties = [...transition.matchAll(/([a-z-]+)\s+\d+ms/g)].map((match) => match[1])

    expect(properties).toEqual(['transform', 'border-color', 'box-shadow'])
    for (const property of properties) {
      expect(['width', 'height', 'margin', 'padding', 'top', 'left']).not.toContain(property)
    }
  })

  it('returns the surface to rest on press rather than pushing it further', () => {
    expect(surfaceInteraction('raised')._active.transform).toBe('translateY(0)')
  })

  it('pairs the lift with a border-colour change, so depth is not the only cue', () => {
    for (const depth of surfaceDepths) {
      const hover = surfaceInteraction(depth)._hover

      expect(hover.borderColor).not.toBe(surfaceStyle(depth).borderColor)
      expect(Object.keys(semanticColors)).toContain(hover.borderColor)
    }
  })
})

describe('dividerStyle', () => {
  it('draws a horizontal rule with a top border and no height', () => {
    const style = dividerStyle('horizontal')

    expect(style.borderTopWidth).toBe('1px')
    expect(style.height).toBe('0')
    expect(style.borderLeftWidth).toBeUndefined()
  })

  it('draws a vertical rule with a left border and no width', () => {
    const style = dividerStyle('vertical')

    expect(style.borderLeftWidth).toBe('1px')
    expect(style.width).toBe('0')
    expect(style.borderTopWidth).toBeUndefined()
  })

  it('takes its colour from the same border role the card uses', () => {
    expect(dividerStyle('horizontal').borderColor).toBe(componentTokens.card.border)
  })
})

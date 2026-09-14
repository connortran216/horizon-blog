import { describe, expect, it } from 'vitest'

import { componentTokens, radii, typeScale } from '../../../theme/tokens'
import { containerCorners, frameOwnsCorners, mediaFrameStyle } from '../../components/media'
import { surfaceClipsChildren, surfaceStyle } from '../../components/surface'
import {
  cardLinkOverlayStyle,
  coverBleeds,
  patternsAreDistinct,
  postPatterns,
  postPresentation,
  titleSizePx,
} from './presentation.logic'

/** dsv2.5.1 acceptance 1: signature and normal cards remain distinct. */
describe('signature against card', () => {
  it('differs on the surface family, the radius and the title ramp at once', () => {
    expect(patternsAreDistinct('signature', 'card')).toBe(true)
  })

  it('draws the Signature on the feature radius and the card on the card radius', () => {
    expect(postPresentation('signature').borderRadius).toBe(radii.feature)
    expect(postPresentation('card').borderRadius).toBe(radii.card)
  })

  it('gives the Signature a visibly larger title', () => {
    expect(titleSizePx('signature')).toBeGreaterThan(titleSizePx('card'))
  })

  it('gives them different cover proportions', () => {
    expect(postPresentation('signature').coverAspectRatio).not.toBe(
      postPresentation('card').coverAspectRatio,
    )
  })

  it('does not collapse to one card with a size prop', () => {
    // If these two ever resolve to the same presentation object, the "one
    // universal card" non-goal has quietly been abandoned.
    expect(postPresentation('signature')).not.toEqual(postPresentation('card'))
  })
})

describe('the four post patterns', () => {
  it('are exactly the four the design contract names', () => {
    expect(postPatterns).toEqual(['signature', 'featured', 'card', 'row'])
  })

  it('sit on values from the token source, never a literal', () => {
    const allowedRadii = Object.values(radii)

    for (const pattern of postPatterns) {
      expect(allowedRadii).toContain(postPresentation(pattern).borderRadius)
    }
  })

  it('use the shared card and feature radius aliases', () => {
    expect(postPresentation('featured').borderRadius).toBe(componentTokens.feature.radius)
    expect(postPresentation('card').borderRadius).toBe(componentTokens.card.radius)
  })

  it('box only the two patterns that are boxes', () => {
    expect(postPresentation('card').ownsSurface).toBe(true)
    expect(postPresentation('featured').ownsSurface).toBe(true)
    expect(postPresentation('signature').ownsSurface).toBe(false)
    expect(postPresentation('row').ownsSurface).toBe(false)
  })

  /*
   * Rewritten for `uix.1`. It used to assert `titleSizePx('signature') >
   * titleSizePx('featured')`, which held only because the Signature was on the
   * `display` ramp - the brand statement ramp - and that is the defect. Both are
   * article headings and both now sit on `pageTitle`, so the separation between
   * them is the surface and the cover, and that is what this asserts instead.
   */
  it('keeps the two editorial siblings on one family and one article ramp', () => {
    expect(patternsAreDistinct('signature', 'featured')).toBe(false)
    expect(postPresentation('signature').family).toBe(postPresentation('featured').family)
    expect(postPresentation('signature').titleRecipe).toBe(postPresentation('featured').titleRecipe)
  })

  it('separates the two siblings by the surface and the cover instead', () => {
    expect(postPresentation('signature').ownsSurface).not.toBe(
      postPresentation('featured').ownsSurface,
    )
    expect(postPresentation('signature').coverAspectRatio).not.toBe(
      postPresentation('featured').coverAspectRatio,
    )
  })

  it('leaves the display ramp to the site, not to an article', () => {
    // `type.display` is the brand statement; `type.pageTitle` is documented as
    // "Page and article headings". No post pattern is a brand statement, so the
    // Home `h1` is the only thing on the page drawing at 64px.
    for (const pattern of postPatterns) {
      expect(postPresentation(pattern).titleRecipe, pattern).not.toBe('display')
    }
  })

  it('puts the site headline a full step above the story it leads with', () => {
    expect(titleSizePx('signature')).toBeLessThan(Number.parseFloat(typeScale.display.fontSize[1]))
  })

  it('is never distinct from itself', () => {
    for (const pattern of postPatterns) {
      expect(patternsAreDistinct(pattern, pattern)).toBe(false)
    }
  })

  it('gives the row no excerpt room to speak of and no topic chips', () => {
    expect(postPresentation('row').tagLimit).toBe(0)
    expect(postPresentation('row').excerptLines).toBeLessThan(postPresentation('card').excerptLines)
  })
})

/**
 * `horizon-blog-dsv2.7.3`: the PostCard cover is full-bleed, matching the
 * approved prototype. The risk the ruling creates is two owners for one set of
 * corners, so these tests state who owns what.
 */
describe('the card cover bleeds to the card edge', () => {
  const cardDepth = 'raised' as const

  it('hands the corners to the container rather than drawing its own', () => {
    expect(postPresentation('card').coverRadius).toBe(containerCorners)
    expect(coverBleeds('card')).toBe(true)
  })

  it('leaves the cover frame with no radius of its own', () => {
    const card = postPresentation('card')
    const frame = mediaFrameStyle({
      aspectRatio: card.coverAspectRatio,
      radius: card.coverRadius,
    })

    expect(frame.borderRadius).toBe('0')
    expect(Object.values(radii)).not.toContain(frame.borderRadius)
  })

  it('has the clipping Surface supply the only radius in play', () => {
    expect(surfaceClipsChildren(cardDepth)).toBe(true)
    expect(surfaceStyle(cardDepth).borderRadius).toBe(componentTokens.card.radius)
    expect(postPresentation('card').borderRadius).toBe(surfaceStyle(cardDepth).borderRadius)
  })

  it('leaves exactly one owner, not none and not two', () => {
    const card = postPresentation('card')
    const frameOwns = frameOwnsCorners(card.coverRadius)
    const surfaceOwns = surfaceClipsChildren(cardDepth)

    expect(frameOwns).toBe(false)
    expect(surfaceOwns).toBe(true)
    // Exclusive or, written out: exactly one of the two draws the corners.
    expect(Number(frameOwns) + Number(surfaceOwns)).toBe(1)
  })

  it('reserves the 16/9 box the ordinary card has always reserved', () => {
    expect(postPresentation('card').coverAspectRatio).toBe('16 / 9')
  })

  it('is the only pattern that bleeds, so no other cover changes', () => {
    expect(postPatterns.filter((pattern) => coverBleeds(pattern))).toEqual(['card'])

    for (const pattern of ['signature', 'featured', 'row'] as const) {
      expect(frameOwnsCorners(postPresentation(pattern).coverRadius)).toBe(true)
      expect(Object.values(radii)).toContain(
        mediaFrameStyle({
          aspectRatio: postPresentation(pattern).coverAspectRatio,
          radius: postPresentation(pattern).coverRadius,
        }).borderRadius,
      )
    }
  })

  it('does not flatten the signature, featured and card distinction', () => {
    // The ruling changed where the card's cover corners come from. It must not
    // have made the card read as the same editorial object as its siblings.
    expect(patternsAreDistinct('signature', 'card')).toBe(true)
    expect(patternsAreDistinct('featured', 'card')).toBe(true)
    expect(postPresentation('signature')).not.toEqual(postPresentation('card'))
  })
})

describe('cardLinkOverlayStyle', () => {
  it('covers the whole card, corners included', () => {
    expect(cardLinkOverlayStyle()).toEqual({
      content: '""',
      position: 'absolute',
      inset: 0,
      borderRadius: 'inherit',
    })
  })
})

import { describe, expect, it } from 'vitest'

import { componentTokens, radii } from '../../../theme/tokens'
import { fullMotionPolicy, reducedMotionPolicy } from '../../motion'
import {
  altAttributes,
  assertAspectRatio,
  buildSrcSet,
  containerCorners,
  fallbackSource,
  frameOwnsCorners,
  isDecorative,
  mediaFadeStyle,
  mediaFrameStyle,
  type MediaAltInput,
} from './media.logic'
import {
  initialMediaState,
  mediaReducer,
  type MediaState,
  type MediaStatus,
} from './mediaState.logic'

describe('the frame', () => {
  // Acceptance criterion 4.3: the aspect ratio holds the layout at every state.
  // `mediaFrameStyle` cannot vary with the status because the status is not one
  // of its arguments - that is the guarantee, and this test states it.
  it('depends on nothing but the ratio and the radius', () => {
    const first = mediaFrameStyle({ aspectRatio: '16 / 9' })
    const second = mediaFrameStyle({ aspectRatio: '16 / 9' })

    expect(first).toEqual(second)
    expect(first.aspectRatio).toBe('16 / 9')
    expect(first.overflow).toBe('hidden')
    expect(first.position).toBe('relative')
  })

  it('paints a ground colour so no state can flash blank', () => {
    expect(mediaFrameStyle({ aspectRatio: '3 / 2' }).backgroundColor).toBe(
      componentTokens.media.placeholderBg,
    )
  })

  it('takes its radius from the radius scale', () => {
    expect(mediaFrameStyle({ aspectRatio: '1' }).borderRadius).toBe(radii.card)
    expect(mediaFrameStyle({ aspectRatio: '1', radius: 'feature' }).borderRadius).toBe(
      radii.feature,
    )
    expect(mediaFrameStyle({ aspectRatio: '1', radius: 'control' }).borderRadius).toBe(
      radii.control,
    )
  })

  it('accepts the ratio forms a caller will actually write', () => {
    expect(assertAspectRatio('16 / 9')).toBe('16 / 9')
    expect(assertAspectRatio('1.55')).toBe('1.55')
    expect(assertAspectRatio(' 4/3 ')).toBe('4/3')
  })

  it('refuses a ratio that would let the box collapse', () => {
    expect(() => assertAspectRatio('')).toThrow(TypeError)
    expect(() => assertAspectRatio('auto')).toThrow(TypeError)
    expect(() => assertAspectRatio('16 by 9')).toThrow(TypeError)
    expect(() => mediaFrameStyle({ aspectRatio: 'none' })).toThrow(TypeError)
  })
})

/**
 * `horizon-blog-dsv2.7.3`: the PostCard cover is full-bleed, matching the
 * approved prototype's `.article-card .art { border-radius: 0 }` inside an
 * `.article-card { border-radius: 20px; overflow: hidden }`.
 *
 * CONVENTIONS.md rule 4 allows exactly one visual owner per surface, so the
 * frame has to be able to say it is not that owner. These tests hold both halves
 * of that: a declining frame draws no radius of its own, and it gives up nothing
 * else - the reserved box is byte-for-byte the box an owning frame reserves.
 */
describe('who owns the frame corners', () => {
  it('draws no radius of its own when the container owns the corners', () => {
    expect(mediaFrameStyle({ aspectRatio: '16 / 9', radius: containerCorners }).borderRadius).toBe(
      '0',
    )
  })

  it('never resolves a declining frame to a value from the radius scale', () => {
    const declined = mediaFrameStyle({ aspectRatio: '16 / 9', radius: containerCorners })

    expect(Object.values(radii)).not.toContain(declined.borderRadius)
  })

  it('says which frames own their corners and which have handed them over', () => {
    expect(frameOwnsCorners('card')).toBe(true)
    expect(frameOwnsCorners('feature')).toBe(true)
    expect(frameOwnsCorners('control')).toBe(true)
    expect(frameOwnsCorners('tag')).toBe(true)
    expect(frameOwnsCorners(containerCorners)).toBe(false)
  })

  it('still owns its corners by default, so no existing caller changes', () => {
    expect(frameOwnsCorners('card')).toBe(true)
    expect(mediaFrameStyle({ aspectRatio: '16 / 9' }).borderRadius).toBe(radii.card)
  })

  it('gives up the corners and nothing else', () => {
    const owned = mediaFrameStyle({ aspectRatio: '16 / 9', radius: 'card' })
    const declined = mediaFrameStyle({ aspectRatio: '16 / 9', radius: containerCorners })

    // The clip is still the frame's: an image at `objectFit: cover` overflows
    // the reserved box in one axis by definition, bleeding or not.
    expect(declined.overflow).toBe('hidden')
    expect({ ...declined, borderRadius: owned.borderRadius }).toEqual(owned)
  })
})

/**
 * Acceptance criterion 4.3 again, now that the corner decision exists: a
 * full-bleed cover must reserve its box exactly as an inset one does, so the
 * card does not reflow when an image arrives or fails.
 */
describe('the reserved box across the five media states', () => {
  const allStatuses: readonly MediaStatus[] = ['absent', 'loading', 'ready', 'error', 'retrying']

  function everyReachableState(): readonly MediaState[] {
    const absent = initialMediaState()
    const loading = initialMediaState({ src: 'cover.jpg', maxAttempts: 2 })
    const ready = mediaReducer(loading, { type: 'loaded' })
    const failed = mediaReducer(loading, { type: 'failed', reason: 'network' })
    const retrying = mediaReducer(failed, { type: 'retry' })

    return [absent, loading, ready, failed, retrying]
  }

  it('reaches all five states, so the check below is not testing three of them', () => {
    expect(everyReachableState().map((state) => state.status)).toEqual(allStatuses)
  })

  it('reserves one identical box at every state, bleeding or inset', () => {
    for (const radius of ['card', containerCorners] as const) {
      const frames = everyReachableState().map(() =>
        // The state is deliberately not in scope for this call: `mediaFrameStyle`
        // has no status argument, which is what makes "no reflow" structural
        // rather than a thing each caller has to remember.
        mediaFrameStyle({ aspectRatio: '16 / 9', radius }),
      )

      for (const frame of frames) {
        expect(frame).toEqual(frames[0])
        expect(frame.aspectRatio).toBe('16 / 9')
        expect(frame.backgroundColor).toBe(componentTokens.media.placeholderBg)
      }
    }
  })

  it('ignores a status even when one is handed to it', () => {
    const base = mediaFrameStyle({ aspectRatio: '16 / 9', radius: containerCorners })

    for (const status of allStatuses) {
      // Not an object literal at the call site, so this reaches the function
      // rather than being rejected as an excess property at compile time.
      const input = { aspectRatio: '16 / 9', radius: containerCorners, status } as const

      expect(mediaFrameStyle(input)).toEqual(base)
    }
  })
})

describe('alt semantics', () => {
  // Acceptance criterion 4.3.2: alt and decorative semantics are explicit.
  it('hides a decorative image from assistive technology', () => {
    const attributes = altAttributes({ decorative: true })

    expect(attributes).toEqual({ alt: '', role: 'presentation', 'aria-hidden': true })
    expect(isDecorative({ decorative: true })).toBe(true)
  })

  it('passes a content image its alt text and nothing else', () => {
    const attributes = altAttributes({ alt: 'A terminal showing a failing build' })

    expect(attributes).toEqual({ alt: 'A terminal showing a failing build' })
    expect(attributes.role).toBeUndefined()
    expect(attributes['aria-hidden']).toBeUndefined()
    expect(isDecorative({ alt: 'A terminal' })).toBe(false)
  })

  it('trims the alt text', () => {
    expect(altAttributes({ alt: '  A cover photo  ' }).alt).toBe('A cover photo')
  })

  it('refuses a content image with a blank alt rather than shipping one', () => {
    expect(() => altAttributes({ alt: '' })).toThrow(TypeError)
    expect(() => altAttributes({ alt: '   ' })).toThrow(TypeError)
    // `decorative: false` is the explicit "this carries meaning" case, so a
    // missing alt there is the same mistake.
    expect(() => altAttributes({ decorative: false, alt: '' })).toThrow(TypeError)
  })

  it('mentions the decorative escape hatch in the error, so the fix is obvious', () => {
    expect(() => altAttributes({ alt: '' })).toThrow(/decorative/)
  })

  it('covers both shapes of the union', () => {
    const inputs: MediaAltInput[] = [{ decorative: true }, { alt: 'A diagram of the pipeline' }]

    inputs.forEach((input) => {
      expect(typeof altAttributes(input).alt).toBe('string')
    })
  })
})

describe('the fade', () => {
  it('fades in only once the image is visible', () => {
    expect(mediaFadeStyle(fullMotionPolicy, false).opacity).toBe(0)
    expect(mediaFadeStyle(fullMotionPolicy, true).opacity).toBe(1)
  })

  it('is an opacity transition and nothing else', () => {
    const style = mediaFadeStyle(fullMotionPolicy, true)

    expect(style.transition).toContain('opacity')
    expect(style.transition).not.toContain('transform')
  })

  it('drops the transition entirely under reduced motion', () => {
    const style = mediaFadeStyle(reducedMotionPolicy, true)

    expect(style.transition).toBeUndefined()
    // The image still appears - reduced motion removes the fade, not the image.
    expect(style.opacity).toBe(1)
  })
})

describe('responsive sources', () => {
  const sources = [
    { src: 'cover-1200.jpg', width: 1200 },
    { src: 'cover-400.jpg', width: 400 },
    { src: 'cover-800.jpg', width: 800 },
  ]

  it('sorts candidates by width and writes w descriptors', () => {
    expect(buildSrcSet(sources)).toBe(
      'cover-400.jpg 400w, cover-800.jpg 800w, cover-1200.jpg 1200w',
    )
  })

  it('returns undefined rather than an invalid empty srcset', () => {
    expect(buildSrcSet([])).toBeUndefined()
    expect(buildSrcSet(undefined)).toBeUndefined()
  })

  it('falls back to the widest candidate when no explicit src is given', () => {
    expect(fallbackSource(undefined, sources)).toBe('cover-1200.jpg')
    expect(fallbackSource(null, [])).toBeNull()
    expect(fallbackSource(null, undefined)).toBeNull()
  })

  it('lets an explicit src win over the candidates', () => {
    expect(fallbackSource('chosen.jpg', sources)).toBe('chosen.jpg')
  })
})

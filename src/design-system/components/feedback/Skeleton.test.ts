import { describe, expect, it } from 'vitest'

import { radii, space, typeScale } from '../../../theme/tokens'
import { reservesLayout, resolveSkeletonDimensions, type SkeletonShape } from './Skeleton.logic'

const everyShape: SkeletonShape[] = [
  { shape: 'text', textStyle: 'body' },
  { shape: 'text', textStyle: 'prose', lines: 4 },
  { shape: 'block', height: 12 },
  { shape: 'media', aspectRatio: '16 / 9' },
  { shape: 'circle', size: 12 },
]

describe('skeleton dimensions', () => {
  // Acceptance criterion 4.2.3: skeletons preserve layout. Every shape has to
  // constrain at least one axis, or the content jumps when it lands.
  it('reserves layout for every shape', () => {
    everyShape.forEach((shape) => {
      expect(reservesLayout(resolveSkeletonDimensions(shape)), shape.shape).toBe(true)
    })
  })

  it('takes a text line height from the type ramp the content will use', () => {
    const dimensions = resolveSkeletonDimensions({ shape: 'text', textStyle: 'prose', lines: 3 })

    expect(dimensions.lines).toHaveLength(3)
    dimensions.lines.forEach((line) => {
      expect(line.height).toEqual({
        base: typeScale.prose.lineHeight[0],
        sm: typeScale.prose.lineHeight[1],
      })
    })
  })

  it('gives a multi-line skeleton a ragged last line and a single line none', () => {
    const paragraph = resolveSkeletonDimensions({ shape: 'text', textStyle: 'body', lines: 3 })

    expect(paragraph.lines.map((line) => line.width)).toEqual(['100%', '100%', '65%'])

    const single = resolveSkeletonDimensions({ shape: 'text', textStyle: 'body' })

    expect(single.lines.map((line) => line.width)).toEqual(['100%'])
  })

  it('honours an explicit ragged width', () => {
    const dimensions = resolveSkeletonDimensions({
      shape: 'text',
      textStyle: 'meta',
      lines: 2,
      lastLineWidth: '40%',
    })

    expect(dimensions.lines[1].width).toBe('40%')
  })

  it('never renders fewer than one line', () => {
    expect(
      resolveSkeletonDimensions({ shape: 'text', textStyle: 'body', lines: 0 }).lines,
    ).toHaveLength(1)
    expect(
      resolveSkeletonDimensions({ shape: 'text', textStyle: 'body', lines: -3 }).lines,
    ).toHaveLength(1)
  })

  it('holds a media skeleton by aspect ratio, not by a guessed height', () => {
    const dimensions = resolveSkeletonDimensions({ shape: 'media', aspectRatio: '16 / 9' })

    expect(dimensions.aspectRatio).toBe('16 / 9')
    expect(dimensions.height).toBeUndefined()
    expect(dimensions.width).toBe('100%')
  })

  it('sizes block and circle skeletons from the spacing scale', () => {
    expect(resolveSkeletonDimensions({ shape: 'block', height: 12 }).height).toBe(space[12])

    const circle = resolveSkeletonDimensions({ shape: 'circle', size: 12 })

    expect(circle.width).toBe(space[12])
    expect(circle.height).toBe(space[12])
  })

  it('takes every radius from the radius scale', () => {
    const scale = new Set<string>(Object.values(radii))

    everyShape.forEach((shape) => {
      expect(scale.has(resolveSkeletonDimensions(shape).borderRadius), shape.shape).toBe(true)
    })

    expect(resolveSkeletonDimensions({ shape: 'media', aspectRatio: '3 / 2' }).borderRadius).toBe(
      radii.card,
    )
    expect(resolveSkeletonDimensions({ shape: 'circle', size: 8 }).borderRadius).toBe(radii.tag)
  })
})

describe('reservesLayout', () => {
  it('rejects a skeleton that constrains nothing', () => {
    expect(reservesLayout({ lines: [], gap: space[2], borderRadius: radii.card })).toBe(false)
  })
})

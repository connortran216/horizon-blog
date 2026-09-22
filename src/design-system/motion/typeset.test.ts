import { describe, expect, it } from 'vitest'

import { transform } from '../../theme/tokens'
import { fullMotionPolicy, reducedMotionPolicy } from './policy.logic'
import {
  typesetDelays,
  typesetEmphasis,
  typesetRuleDelays,
  typesetVariants,
  typesetWords,
} from './typeset.logic'

describe('typesetWords', () => {
  it('splits on runs of whitespace and keeps punctuation with its word', () => {
    expect(typesetWords('  Human stories,   blogs.\n and readers. ').map((w) => w.text)).toEqual([
      'Human',
      'stories,',
      'blogs.',
      'and',
      'readers.',
    ])
  })

  it('gives repeated words distinct keys', () => {
    const keys = typesetWords('read read read').map((w) => w.key)

    expect(new Set(keys).size).toBe(3)
  })

  it('returns nothing for an empty sentence', () => {
    expect(typesetWords('   ')).toEqual([])
  })
})

describe('typesetDelays', () => {
  it('spaces neighbouring words one tick apart', () => {
    const delays = typesetDelays(4, fullMotionPolicy)

    expect(delays).toEqual([0, 0.04, 0.08, 0.12])
  })

  it('honours an initial delay and the stagger cap', () => {
    const delays = typesetDelays(40, fullMotionPolicy, 0.1)

    expect(delays[0]).toBe(0.1)
    expect(Math.max(...delays)).toBeLessThanOrEqual(0.6)
  })

  it('sets the whole line at once under reduced motion', () => {
    expect(typesetDelays(5, reducedMotionPolicy)).toEqual([0, 0, 0, 0, 0])
  })
})

describe('typesetVariants', () => {
  it('rises through the baseline by the token distance', () => {
    expect(typesetVariants(fullMotionPolicy).hidden.y).toBe(transform.typesetRise)
    expect(typesetVariants(fullMotionPolicy).visible).toEqual({ opacity: 1, y: '0em' })
  })

  it('keeps only the fade under reduced motion', () => {
    expect(typesetVariants(reducedMotionPolicy).hidden).toEqual({ opacity: 0, y: '0em' })
  })
})

describe('typesetEmphasis', () => {
  const words = typesetWords('Human stories for curious readers.')

  it('marks the run of words that matches the phrase', () => {
    expect([...typesetEmphasis(words, 'curious readers.')]).toEqual([3, 4])
  })

  it('marks nothing when the phrase is absent, empty or longer than the sentence', () => {
    expect(typesetEmphasis(words, 'curious readers').size).toBe(0)
    expect(typesetEmphasis(words, '').size).toBe(0)
    expect(typesetEmphasis(words).size).toBe(0)
    expect(typesetEmphasis(words, 'a b c d e f g').size).toBe(0)
  })

  it('takes the first match only', () => {
    const repeated = typesetWords('read it then read it again')

    expect([...typesetEmphasis(repeated, 'read it')]).toEqual([0, 1])
  })
})

describe('typesetRuleDelays', () => {
  it('starts after the last word has landed and travels left to right', () => {
    const delays = typesetRuleDelays(
      new Set([3, 4]),
      [0, 0.04, 0.08, 0.12, 0.16],
      0.48,
      fullMotionPolicy,
    )

    expect(delays.get(3)).toBeCloseTo(0.64)
    expect(delays.get(4)).toBeCloseTo(0.88)
  })

  it('draws every rule at once under reduced motion', () => {
    const delays = typesetRuleDelays(new Set([3, 4]), [0, 0, 0, 0, 0], 0, reducedMotionPolicy)

    expect([...delays.values()]).toEqual([0, 0])
  })
})

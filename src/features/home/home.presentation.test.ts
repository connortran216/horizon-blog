import { describe, it, expect } from 'vitest'
import { partitionHomeWriting } from './home.presentation'
describe('Home editorial selection', () => {
  it('keeps Signature separate from six unique Latest entries', () => {
    const posts = Array.from({ length: 9 }, (_, i) => ({ id: String(i) }))
    const result = partitionHomeWriting([posts[0], posts[0], ...posts.slice(1)])
    expect(result.signature?.id).toBe('0')
    expect(result.latest.map((p) => p.id)).toEqual(['1', '2', '3', '4', '5', '6'])
  })
  it('handles no writing and fewer than seven blogs', () => {
    expect(partitionHomeWriting([])).toEqual({ signature: undefined, latest: [] })
    expect(partitionHomeWriting([{ id: 'only' }]).latest).toEqual([])
  })
})

import { cleanHomeExcerpt } from './home.presentation'
it('cleans markdown and TOC artifacts without dropping technical decimals in prose', () => {
  expect(cleanHomeExcerpt('1.00 _Hello world._ Table of Contents 1. Intro')).toBe('Hello world.')
  expect(cleanHomeExcerpt('Uses version 1.00 safely.')).toBe('Uses version 1.00 safely.')
  expect(cleanHomeExcerpt('Hello tr�...')).toBe('Hello')
})

import { describe, expect, it } from 'vitest'

import { spanWithin, trackIndicator, trackLead } from './navTrack.logic'

describe('trackIndicator', () => {
  it('underlines the current label inside its padding', () => {
    expect(trackIndicator(400, { left: 100, width: 80 }, 12)).toEqual({
      x: 112,
      scale: 56 / 400,
      visible: true,
    })
  })

  it('shows no bar without a current item', () => {
    expect(trackIndicator(400, null, 12).visible).toBe(false)
  })

  it('shows no bar on a set that is not laid out', () => {
    expect(trackIndicator(0, { left: 0, width: 80 }, 12).visible).toBe(false)
  })
})

describe('trackLead', () => {
  const at = (x: number, scale = 0.1) => ({ x, scale, visible: true })

  it('does not travel on the first placement', () => {
    expect(trackLead(null, at(40), 400).travels).toBe(false)
  })

  it('leads with the right end when moving right', () => {
    expect(trackLead(at(40), at(200), 400)).toEqual({ from: 80, to: 240, travels: true })
  })

  it('leads with the left end when moving left', () => {
    expect(trackLead(at(200), at(40), 400)).toEqual({ from: 200, to: 40, travels: true })
  })

  it('does not travel to where it already is', () => {
    expect(trackLead(at(40), at(40), 400).travels).toBe(false)
  })
})

describe('spanWithin', () => {
  it('measures an item from the start of its set', () => {
    expect(spanWithin({ left: 300 }, { left: 360, width: 70 })).toEqual({ left: 60, width: 70 })
  })
})

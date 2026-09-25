import { describe, expect, it } from 'vitest'

import { fullMotionPolicy, reducedMotionPolicy } from './policy.logic'
import {
  carrierTransform,
  projectOnRail,
  railLength,
  railTransform,
  reachedAt,
  routeStops,
  routeTravels,
  signalLineFrame,
  signalRouteTiming,
} from './signalRoute.logic'

const rail = { left: 100, top: 50, width: 400, height: 300 }

describe('railLength', () => {
  it('is the width of a horizontal line and the height of a vertical one', () => {
    expect(railLength(rail, 'horizontal')).toBe(400)
    expect(railLength(rail, 'vertical')).toBe(300)
  })
})

describe('projectOnRail', () => {
  it('places an anchor centre along the line', () => {
    const anchor = { left: 180, top: 0, width: 40, height: 10 }

    expect(projectOnRail(anchor, rail, 'horizontal')).toBeCloseTo(0.25)
  })

  it('reads the vertical axis for a vertical line', () => {
    const anchor = { left: 0, top: 185, width: 10, height: 30 }

    expect(projectOnRail(anchor, rail, 'vertical')).toBeCloseTo(0.5)
  })

  it('clamps an anchor beyond either end to that end', () => {
    expect(projectOnRail({ left: 0, top: 0, width: 10, height: 10 }, rail, 'horizontal')).toBe(0)
    expect(projectOnRail({ left: 900, top: 0, width: 10, height: 10 }, rail, 'horizontal')).toBe(1)
  })

  it('is zero on a line that is not laid out', () => {
    const hidden = { left: 0, top: 0, width: 0, height: 0 }

    expect(projectOnRail({ left: 5, top: 5, width: 1, height: 1 }, hidden, 'vertical')).toBe(0)
  })
})

describe('routeStops', () => {
  it('spaces anchors evenly in writing order at the order pace', () => {
    expect(routeStops([0.9, 0.1, 0.5], 'order')).toEqual([0.25, 0.5, 0.75])
  })

  it('never writes a later anchor before an earlier one at the position pace', () => {
    // A headline's second line folds back to the start of the rail beneath it.
    expect(routeStops([0.2, 0.7, 0.1, 0.9], 'position')).toEqual([0.2, 0.7, 0.7, 0.9])
  })

  it('clamps stray projections', () => {
    expect(routeStops([-1, 2], 'position')).toEqual([0, 1])
  })
})

describe('reachedAt', () => {
  it('returns the anchors the tip has passed that were not already written', () => {
    expect(reachedAt([0.2, 0.5, 0.8], 0.55, new Set([0]))).toEqual([1])
  })

  it('returns nothing before the first stop', () => {
    expect(reachedAt([0.2, 0.5], 0.1, new Set())).toEqual([])
  })
})

describe('signalRouteTiming', () => {
  it('travels in two editorial reveals after a normal beat', () => {
    const timing = signalRouteTiming(fullMotionPolicy)

    expect(timing.travel).toBeCloseTo(0.96)
    expect(timing.delay).toBeCloseTo(0.2)
    expect(timing.pulse).toBeCloseTo(0.48)
  })

  it('adds a caller delay and ignores a negative one', () => {
    expect(signalRouteTiming(fullMotionPolicy, 0.5).delay).toBeCloseTo(0.7)
    expect(signalRouteTiming(fullMotionPolicy, -3).delay).toBeCloseTo(0.2)
  })

  it('is all zero under reduced motion', () => {
    expect(signalRouteTiming(reducedMotionPolicy, 1)).toEqual({ delay: 0, travel: 0, pulse: 0 })
  })
})

describe('routeTravels', () => {
  it('travels only with motion and a laid-out line', () => {
    expect(routeTravels(fullMotionPolicy, 320)).toBe(true)
    expect(routeTravels(fullMotionPolicy, 0)).toBe(false)
    expect(routeTravels(reducedMotionPolicy, 320)).toBe(false)
  })
})

describe('signalLineFrame', () => {
  it('draws the rail exactly as far as the tip has gone', () => {
    expect(signalLineFrame(0.4).draw).toBe(0.4)
  })

  it('has no tip at rest or once arrived', () => {
    expect(signalLineFrame(0).tip).toBe(0)
    expect(signalLineFrame(1).tip).toBe(0)
  })

  it('fades the tip in as it leaves and out as it arrives', () => {
    expect(signalLineFrame(0.04).tip).toBeCloseTo(0.5)
    expect(signalLineFrame(0.5).tip).toBe(1)
    expect(signalLineFrame(0.94).tip).toBeCloseTo(0.5)
  })
})

describe('transforms', () => {
  it('moves the carrier by its own length so the tip sits at the progress', () => {
    expect(carrierTransform(0, 'horizontal')).toBe('translateX(-100%)')
    expect(carrierTransform(0.25, 'vertical')).toBe('translateY(-75%)')
    expect(carrierTransform(1, 'horizontal')).toBe('translateX(0%)')
  })

  it('scales the rail along its own axis', () => {
    expect(railTransform(0.5, 'horizontal')).toBe('scaleX(0.5)')
    expect(railTransform(2, 'vertical')).toBe('scaleY(1)')
  })
})

import { describe, expect, it } from 'vitest'

import { fullMotionPolicy, reducedMotionPolicy } from './policy.logic'
import {
  DEFAULT_VEIL,
  NO_VEIL,
  SYNAPSE,
  bezierPoint,
  chooseLink,
  createNodes,
  createRng,
  curveControl,
  decayExcitation,
  distanceToRect,
  exciteNear,
  fieldAwake,
  fieldInk,
  fieldOpacity,
  linkNodes,
  nearestNodeTo,
  parseColorChannels,
  rgba,
  sentenceWrittenAt,
  signalRate,
  stepNodes,
  stirredUntil,
  synapseScene,
  synapseTiming,
  veilNear,
} from './synapse.logic'

const ASPECT = 2

describe('createRng', () => {
  it('is deterministic and stays in [0, 1)', () => {
    const a = createRng(7)
    const b = createRng(7)
    const values = Array.from({ length: 50 }, () => a())

    expect(values).toEqual(Array.from({ length: 50 }, () => b()))
    expect(values.every((value) => value >= 0 && value < 1)).toBe(true)
  })
})

describe('createNodes', () => {
  it('covers the plate evenly from the first frame', () => {
    const nodes = createNodes(40, createRng(7))

    expect(nodes).toHaveLength(40)
    expect(nodes.some((node) => node.x < 0.3)).toBe(true)
    expect(nodes.some((node) => node.x > 0.7)).toBe(true)
    expect(nodes.every((node) => node.x > 0 && node.x < 1 && node.y > 0 && node.y < 1)).toBe(true)
  })

  it('returns nothing for a non-positive count', () => {
    expect(createNodes(0, createRng(1))).toEqual([])
  })
})

describe('stepNodes', () => {
  it('wanders every node yet keeps all of them inside the plate', () => {
    const nodes = createNodes(30, createRng(3))
    const start = nodes.map((node) => ({ x: node.x, y: node.y }))

    for (let frame = 0; frame < 60 * 30; frame += 1) {
      stepNodes(nodes, 1 / 60, frame / 60, ASPECT)
    }

    const moved = nodes.filter(
      (node, index) => Math.hypot(node.x - start[index].x, node.y - start[index].y) > 0.02,
    )

    expect(moved.length).toBeGreaterThan(nodes.length * 0.8)
    expect(nodes.every((node) => node.x > 0 && node.x < 1 && node.y > 0 && node.y < 1)).toBe(true)
  })

  it('eases two nodes apart when they start on top of each other', () => {
    const nodes = createNodes(2, createRng(1))

    nodes[1].x = nodes[0].x + 0.001
    nodes[1].y = nodes[0].y

    for (let frame = 0; frame < 120; frame += 1) {
      stepNodes(nodes, 1 / 60, frame / 60, ASPECT)
    }

    expect(Math.hypot(nodes[0].x - nodes[1].x, (nodes[0].y - nodes[1].y) / ASPECT)).toBeGreaterThan(
      0.01,
    )
  })
})

describe('linkNodes', () => {
  it('links only within reach and keeps each node to its nearest few', () => {
    const nodes = createNodes(40, createRng(9))
    const links = linkNodes(nodes, ASPECT)
    const degree = new Map<number, number>()

    for (const link of links) {
      expect(link.d).toBeLessThan(SYNAPSE.linkReach)
      expect(link.w).toBeGreaterThan(0)
      expect(link.w).toBeLessThanOrEqual(1)
      degree.set(link.i, (degree.get(link.i) ?? 0) + 1)
      degree.set(link.j, (degree.get(link.j) ?? 0) + 1)
    }

    // A node can be chosen by several neighbours, but never more than twice the cap.
    expect(Math.max(...degree.values())).toBeLessThanOrEqual(SYNAPSE.neighbours * 2)
  })

  it('bows a link the same way for the same pair', () => {
    const a = { x: 0.2, y: 0.5 }
    const b = { x: 0.4, y: 0.5 }

    expect(curveControl(a, b, 1, 2, ASPECT)).toEqual(curveControl(a, b, 1, 2, ASPECT))
    expect(bezierPoint(a, curveControl(a, b, 1, 2, ASPECT), b, 0)).toEqual(a)
    expect(bezierPoint(a, curveControl(a, b, 1, 2, ASPECT), b, 1)).toEqual(b)
  })
})

describe('excitation', () => {
  it('lights nodes near the pointer and lets them fade', () => {
    const nodes = createNodes(10, createRng(2))
    const target = nodes[0]

    exciteNear(nodes, { x: target.x, y: target.y }, ASPECT)
    expect(target.excitation).toBeCloseTo(SYNAPSE.pointerStrength)

    decayExcitation(nodes, 2)
    expect(target.excitation).toBe(0)
  })
})

describe('the veil around the copy', () => {
  const copy = { left: 100, top: 100, width: 400, height: 200 }

  it('measures distance to the copy box, zero inside it', () => {
    expect(distanceToRect({ x: 200, y: 150 }, copy)).toBe(0)
    expect(distanceToRect({ x: 50, y: 150 }, copy)).toBe(50)
    expect(distanceToRect({ x: 500, y: 400 }, copy)).toBe(100)
    expect(distanceToRect({ x: 40, y: 20 }, copy)).toBeCloseTo(100)
  })

  it('is faint under the words and back to full a feather away', () => {
    expect(veilNear({ x: 200, y: 150 }, copy, DEFAULT_VEIL)).toBe(DEFAULT_VEIL.floor)
    expect(veilNear({ x: 200, y: 340 }, copy, DEFAULT_VEIL)).toBeGreaterThan(DEFAULT_VEIL.floor)
    expect(veilNear({ x: 200, y: 340 }, copy, DEFAULT_VEIL)).toBeLessThan(1)
    expect(veilNear({ x: 200, y: 500 }, copy, DEFAULT_VEIL)).toBe(1)
  })

  it('is uniform with no copy or no veil', () => {
    expect(veilNear({ x: 200, y: 150 }, null, DEFAULT_VEIL)).toBe(1)
    expect(veilNear({ x: 200, y: 150 }, copy, NO_VEIL)).toBe(1)
  })
})

describe('scrolling the field away', () => {
  it('is fully present while most of it shows and gone when none does', () => {
    expect(fieldOpacity(1)).toBe(1)
    expect(fieldOpacity(0.7)).toBe(1)
    expect(fieldOpacity(0.35)).toBeGreaterThan(0)
    expect(fieldOpacity(0.35)).toBeLessThan(1)
    expect(fieldOpacity(0)).toBe(0)
  })

  it('sleeps only once it has left the viewport', () => {
    expect(fieldAwake(0.01)).toBe(true)
    expect(fieldAwake(0)).toBe(false)
  })

  it('treats a scroll as a touch for one pulse', () => {
    expect(stirredUntil(1000, 480)).toBe(1480)
  })
})

describe('chooseLink', () => {
  const nodes = createNodes(30, createRng(5))
  const links = linkNodes(nodes, ASPECT)

  it('returns null with nothing to travel', () => {
    expect(chooseLink([], nodes, createRng(1))).toBeNull()
  })

  it('continues from the node a chained signal landed on', () => {
    const from = links[0].i
    const route = chooseLink(links, nodes, createRng(1), { from })

    expect(route?.from).toBe(from)
    expect(
      links.some(
        (link) =>
          (link.i === from && link.j === route?.to) || (link.j === from && link.i === route?.to),
      ),
    ).toBe(true)
  })

  it('returns null when the node it should continue from has no links', () => {
    expect(chooseLink(links, nodes, createRng(1), { from: 9999 })).toBeNull()
  })
})

describe('nearestNodeTo', () => {
  it('prefers a node to the right of the anchor, then falls back to the nearest', () => {
    const nodes = createNodes(3, createRng(1))

    nodes[0].x = 0.2
    nodes[0].y = 0.5
    nodes[1].x = 0.5
    nodes[1].y = 0.5
    nodes[2].x = 0.9
    nodes[2].y = 0.5

    expect(nearestNodeTo(nodes, { x: 0.3, y: 0.5 }, ASPECT)).toBe(1)
    expect(nearestNodeTo(nodes, { x: 0.95, y: 0.5 }, ASPECT)).toBe(2)
    expect(nearestNodeTo([], { x: 0.5, y: 0.5 }, ASPECT)).toBe(-1)
  })
})

describe('rates and timing', () => {
  it('stirs when hovered', () => {
    expect(signalRate(1, true)).toBeGreaterThan(signalRate(1, false))
  })

  it('builds every beat from duration tokens', () => {
    const timing = synapseTiming(fullMotionPolicy)

    expect(timing.entryDelay).toBeCloseTo(0.2)
    expect(timing.entryGap).toBeCloseTo(0.08)
    expect(timing.anchorFlightMin).toBeCloseTo(0.48)
    expect(timing.pulse).toBeCloseTo(0.48)
    expect(sentenceWrittenAt(10, timing)).toBeCloseTo(0.2 + 9 * 0.08 + 0.72)
    expect(sentenceWrittenAt(0, timing)).toBe(0)
  })

  it('is a still picture under reduced motion', () => {
    const timing = synapseTiming(reducedMotionPolicy)

    expect(Object.values(timing).every((value) => value === 0)).toBe(true)
    expect(synapseScene(reducedMotionPolicy).isRunning).toBe(false)
    expect(synapseScene(fullMotionPolicy).isRunning).toBe(true)
  })
})

describe('colour', () => {
  it('reads the shapes a Chakra colour variable resolves to', () => {
    expect(parseColorChannels('#3158D4')).toEqual([49, 88, 212])
    expect(parseColorChannels('#fff')).toEqual([255, 255, 255])
    expect(parseColorChannels('rgb(49, 88, 212)')).toEqual([49, 88, 212])
    expect(parseColorChannels('rgba(49, 88, 212, 0.5)')).toEqual([49, 88, 212])
    expect(parseColorChannels('rgb(221 248 154 / 60%)')).toEqual([221, 248, 154])
    expect(parseColorChannels('')).toBeNull()
    expect(parseColorChannels('var(--x)')).toBeNull()
  })

  it('paints at its own alpha, clamped', () => {
    expect(rgba([1, 2, 3], 0.5)).toBe('rgb(1 2 3 / 0.5)')
    expect(rgba([1, 2, 3], 4)).toBe('rgb(1 2 3 / 1)')
  })
})

describe('fieldInk', () => {
  it('is light on the dark canvas: lime signals, no gain', () => {
    const ink = fieldInk('dark')

    expect(ink.particle).toContain('accent-lime')
    expect(ink.halo).toContain('ambient-accentGlow')
    expect(ink.linkGain).toBe(1)
  })

  it('is ink on the light canvas: cobalt throughout, lifted alphas', () => {
    const ink = fieldInk('light')

    expect(ink.particle).toContain('action-hover')
    expect(ink.halo).toContain('action-primary')
    expect(ink.linkGain).toBeGreaterThan(1)
    expect(ink.nodeGain).toBeGreaterThan(1)
    expect(ink.coreFloor).toBeGreaterThan(fieldInk('dark').coreFloor)
  })
})

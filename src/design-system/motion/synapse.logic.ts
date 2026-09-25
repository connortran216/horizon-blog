/**
 * Horizon Design System v2 - the synapse field.
 *
 * Home's artwork is a living network: soft nodes that wander the plate on slow
 * curving paths, hairline links that form between near neighbours and dissolve
 * as they drift apart, and signals - small particles - that travel a link,
 * light the node they reach and sometimes carry on. The copy sits on the field
 * and is written by it: each word is an anchor the network sends a signal to,
 * and the word appears when the signal lands.
 *
 * Everything here is pure and deterministic given a seed, in unit coordinates
 * (0..1 across and down the plate, with `aspect` = width / height so distance
 * is honest). `SynapseField` only integrates and draws; a test can hold every
 * decision without a canvas.
 */

import { durationSeconds, type MotionPolicy } from './policy.logic'

/* -------------------------------------------------------------------------- */
/* Randomness                                                                 */
/* -------------------------------------------------------------------------- */

export type Rng = () => number

/** A small LCG. The same seed gives the same field, which is what a test wants. */
export function createRng(seed: number): Rng {
  let state = seed >>> 0

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0

    return state / 4294967296
  }
}

/* -------------------------------------------------------------------------- */
/* Nodes                                                                      */
/* -------------------------------------------------------------------------- */

export const SYNAPSE = {
  /** Unit distance within which two nodes may link. */
  linkReach: 0.15,
  /** Each node keeps links to at most this many nearest nodes. */
  neighbours: 3,
  /** Below this unit distance nodes ease apart, so the field never clumps. */
  repelReach: 0.07,
  /** Nodes steer back inside this far from an edge. */
  wall: 0.08,
  /** How quickly a node's velocity follows its wandering heading, per second. */
  turn: 1.6,
  /** Wander speed range, unit per second. Slow enough to read as suspended. */
  minSpeed: 0.01,
  speedSpread: 0.016,
  /** Pointer reach and strength for excitation. */
  pointerReach: 0.14,
  pointerStrength: 0.7,
  /** How fast excitation fades, per second. */
  excitationDecay: 0.9,
  /** How many links a chained signal may travel after the first. */
  maxHops: 3,
  /** Chance a landed signal carries on along another link. */
  chainChance: 0.55,
  /** How far a focus reaches to draw nodes in, unit distance. */
  gatherReach: 0.24,
  /** Inside this unit distance a gathered node is left alone - a cluster, not a point. */
  gatherRest: 0.08,
  /** How strongly a focus draws its reach in, per second at the focus. */
  gatherRate: 0.55,
  /** How brightly a focus keeps its neighbourhood lit, 0..1. */
  focusStrength: 0.32,
} as const

export interface SynapseNode {
  x: number
  y: number
  vx: number
  vy: number
  /** Unit per second. */
  readonly speed: number
  /** Heading noise: two slow sines. */
  readonly f1: number
  readonly f2: number
  readonly p1: number
  readonly p2: number
  /** Resting radius in px and resting brightness 0..1. */
  readonly radius: number
  readonly base: number
  /** Excitation 0..1: lit by a landing signal or a near pointer, then fading. */
  excitation: number
}

/**
 * A jittered grid, so the field starts evenly covered and no corner is empty
 * on the first frame; the wander then takes over.
 */
export function createNodes(count: number, rng: Rng): SynapseNode[] {
  if (count <= 0) {
    return []
  }

  const cols = Math.ceil(Math.sqrt(count * 2))
  const rows = Math.ceil(count / cols)
  const nodes: SynapseNode[] = []

  for (let index = 0; index < count; index += 1) {
    const col = index % cols
    const row = Math.floor(index / cols)

    nodes.push({
      x: 0.04 + ((col + 0.2 + rng() * 0.6) / cols) * 0.92,
      y: 0.06 + ((row + 0.2 + rng() * 0.6) / rows) * 0.88,
      vx: 0,
      vy: 0,
      speed: SYNAPSE.minSpeed + rng() * SYNAPSE.speedSpread,
      f1: 0.12 + rng() * 0.18,
      f2: 0.1 + rng() * 0.16,
      p1: rng() * Math.PI * 2,
      p2: rng() * Math.PI * 2,
      radius: 1.2 + rng() * 2.2,
      base: 0.35 + rng() * 0.45,
      excitation: 0,
    })
  }

  return nodes
}

const clampUnit = (value: number) => Math.min(0.995, Math.max(0.005, value))

/**
 * One integration step. A node's desired heading is two slow sines, which is
 * what makes the walk a set of curves rather than a jitter; velocity eases
 * towards it. Soft walls push back well before an edge, and near neighbours
 * ease apart. Mutates in place - forty nodes at sixty frames a second is not
 * a place to allocate.
 */
export function stepNodes(nodes: SynapseNode[], dt: number, time: number, aspect: number): void {
  const follow = Math.min(1, dt * SYNAPSE.turn)

  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i]
    const heading =
      Math.sin(time * node.f1 + node.p1) * Math.PI +
      Math.cos(time * node.f2 + node.p2) * Math.PI * 0.5
    let ax = Math.cos(heading) * node.speed
    let ay = (Math.sin(heading) * node.speed) / aspect

    const wall = SYNAPSE.wall
    if (node.x < wall) ax += (wall - node.x) * 0.25
    if (node.x > 1 - wall) ax -= (node.x - (1 - wall)) * 0.25
    if (node.y < wall) ay += (wall - node.y) * 0.25
    if (node.y > 1 - wall) ay -= (node.y - (1 - wall)) * 0.25

    for (let j = 0; j < nodes.length; j += 1) {
      if (j === i) continue

      const other = nodes[j]
      const dx = node.x - other.x
      const dy = (node.y - other.y) / aspect
      const distance = Math.hypot(dx, dy)

      if (distance < SYNAPSE.repelReach && distance > 1e-4) {
        const force = ((SYNAPSE.repelReach - distance) / SYNAPSE.repelReach) * 0.02

        ax += (dx / distance) * force
        ay += ((dy / distance) * force) / aspect
      }
    }

    node.vx += (ax - node.vx) * follow
    node.vy += (ay - node.vy) * follow
    node.x = clampUnit(node.x + node.vx * dt)
    node.y = clampUnit(node.y + node.vy * dt)
  }
}

export function decayExcitation(nodes: SynapseNode[], dt: number): void {
  for (const node of nodes) {
    node.excitation = Math.max(0, node.excitation - dt * SYNAPSE.excitationDecay)
  }
}

export interface UnitPoint {
  readonly x: number
  readonly y: number
}

/**
 * Nodes near a point light up in proportion to how near. The pointer's job,
 * and - more softly and further out - a focus's.
 */
export function exciteNear(
  nodes: SynapseNode[],
  point: UnitPoint,
  aspect: number,
  strength: number = SYNAPSE.pointerStrength,
  reach: number = SYNAPSE.pointerReach,
): void {
  for (const node of nodes) {
    const distance = Math.hypot(node.x - point.x, (node.y - point.y) / aspect)

    if (distance < reach) {
      node.excitation = Math.max(node.excitation, (1 - distance / reach) * strength)
    }
  }
}

/**
 * A focus draws the network towards it. Nodes within reach drift in, faster
 * the nearer they already are, and stop a little short so the result is a
 * cluster the repulsion keeps open rather than a knot. Nodes beyond reach go
 * on wandering, so moving the focus reads as the network leaning somewhere
 * new, not as the whole plate being dragged. Mutates in place, like
 * `stepNodes`.
 */
export function gatherTowards(
  nodes: SynapseNode[],
  focus: UnitPoint,
  dt: number,
  aspect: number,
): void {
  for (const node of nodes) {
    const dx = focus.x - node.x
    const dy = (focus.y - node.y) / aspect
    const distance = Math.hypot(dx, dy)

    if (distance >= SYNAPSE.gatherReach || distance <= SYNAPSE.gatherRest) {
      continue
    }

    const pull = Math.min(1, SYNAPSE.gatherRate * (1 - distance / SYNAPSE.gatherReach) * dt)

    node.x = clampUnit(node.x + dx * pull)
    node.y = clampUnit(node.y + dy * aspect * pull)
  }
}

/* -------------------------------------------------------------------------- */
/* Links                                                                      */
/* -------------------------------------------------------------------------- */

export interface SynapseLink {
  readonly i: number
  readonly j: number
  /** Unit distance. */
  readonly d: number
  /** 1 when touching, 0 at the reach. Drives the link's alpha. */
  readonly w: number
  /** Control point of the gentle curve, in unit coordinates. */
  readonly cx: number
  readonly cy: number
}

/**
 * Pairs within reach, then each node keeps only its nearest few. The result is
 * a neural graph - short, local, a little irregular - rather than the spider
 * web every "particles" background draws.
 */
export function linkNodes(nodes: readonly SynapseNode[], aspect: number): SynapseLink[] {
  const candidates: { i: number; j: number; d: number }[][] = nodes.map(() => [])

  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const d = Math.hypot(nodes[i].x - nodes[j].x, (nodes[i].y - nodes[j].y) / aspect)

      if (d < SYNAPSE.linkReach) {
        const pair = { i, j, d }

        candidates[i].push(pair)
        candidates[j].push(pair)
      }
    }
  }

  const kept = new Map<string, { i: number; j: number; d: number }>()

  for (const list of candidates) {
    list.sort((a, b) => a.d - b.d)

    for (const pair of list.slice(0, SYNAPSE.neighbours)) {
      kept.set(`${pair.i}:${pair.j}`, pair)
    }
  }

  return [...kept.values()].map((pair) => {
    const a = nodes[pair.i]
    const b = nodes[pair.j]
    const control = curveControl(a, b, pair.i, pair.j, aspect)

    return { ...pair, w: (1 - pair.d / SYNAPSE.linkReach) ** 1.4, cx: control.x, cy: control.y }
  })
}

/**
 * A quadratic control point a little off the chord, on a side decided by the
 * pair's indices, so a link bows the same way for as long as it exists.
 */
export function curveControl(
  a: UnitPoint,
  b: UnitPoint,
  i: number,
  j: number,
  aspect: number,
): UnitPoint {
  const mx = (a.x + b.x) / 2
  const my = (a.y + b.y) / 2
  const nx = -(b.y - a.y) / aspect
  const ny = b.x - a.x
  const length = Math.hypot(nx, ny) || 1
  const bow = (((i * 7 + j * 13) % 5) - 2) * 0.012

  return { x: mx + (nx / length) * bow, y: my + ((ny / length) * bow) / aspect }
}

export function bezierPoint(a: UnitPoint, control: UnitPoint, b: UnitPoint, u: number): UnitPoint {
  const v = 1 - u

  return {
    x: v * v * a.x + 2 * v * u * control.x + u * u * b.x,
    y: v * v * a.y + 2 * v * u * control.y + u * u * b.y,
  }
}

/* -------------------------------------------------------------------------- */
/* The veil around the copy                                                   */
/* -------------------------------------------------------------------------- */

export interface Veil {
  /** How much of the field survives directly under the copy, 0..1. */
  readonly floor: number
  /** How far outside the copy's box the field takes to come back, in px. */
  readonly featherPx: number
}

/**
 * The field is faint under the words and comes back over a hand's width
 * around them, wherever the words happen to be. Measured against the copy's
 * own box rather than a fixed share of the plate, so it holds when the copy
 * wraps differently, sits in a content frame narrower than the field, or
 * moves on a phone. The feather is the `space[24]` step.
 */
export const DEFAULT_VEIL: Veil = { floor: 0.08, featherPx: 96 }

/** No veil at all, for a field with nothing laid over it. */
export const NO_VEIL: Veil = { floor: 1, featherPx: 0 }

export interface PixelRect {
  readonly left: number
  readonly top: number
  readonly width: number
  readonly height: number
}

export interface PixelPoint {
  readonly x: number
  readonly y: number
}

/** Zero inside the box, otherwise the straight-line distance to its edge. */
export function distanceToRect(point: PixelPoint, rect: PixelRect): number {
  const dx = Math.max(rect.left - point.x, 0, point.x - (rect.left + rect.width))
  const dy = Math.max(rect.top - point.y, 0, point.y - (rect.top + rect.height))

  return Math.hypot(dx, dy)
}

export function smoothstep(t: number): number {
  const c = Math.min(1, Math.max(0, t))

  return c * c * (3 - 2 * c)
}

/** How visible the field is at a point, given the copy's box. 1 with no copy. */
export function veilNear(point: PixelPoint, copy: PixelRect | null, veil: Veil): number {
  if (copy === null || veil.floor >= 1) {
    return 1
  }

  if (veil.featherPx <= 0) {
    return distanceToRect(point, copy) > 0 ? 1 : veil.floor
  }

  return veil.floor + (1 - veil.floor) * smoothstep(distanceToRect(point, copy) / veil.featherPx)
}

/* -------------------------------------------------------------------------- */
/* Scroll                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * The field's opacity from how much of it is in the viewport. It is fully
 * present while most of it shows and fades as the reader scrolls it away, so
 * the content below arrives on a quiet canvas. Opacity only - no transform.
 */
export function fieldOpacity(intersectionRatio: number): number {
  return smoothstep(intersectionRatio / 0.7)
}

/** Whether the loop should run at all for this much of the field in view. */
export function fieldAwake(intersectionRatio: number): boolean {
  return intersectionRatio > 0
}

/** A scroll counts as a touch for this long: the field stirs, then settles. */
export function stirredUntil(nowMs: number, stirMs: number): number {
  return nowMs + stirMs
}

export function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
}

/* -------------------------------------------------------------------------- */
/* Signals                                                                    */
/* -------------------------------------------------------------------------- */

export interface ChooseLinkOptions {
  /** Continue from this node: only its links qualify. */
  readonly from?: number
  /** Prefer links whose first node is near this point, most of the time. */
  readonly near?: { readonly point: UnitPoint; readonly aspect: number; readonly reach: number }
}

export interface LinkRoute {
  readonly from: number
  readonly to: number
}

/**
 * Which link the next signal travels, and in which direction. A chained
 * signal leaves the node it landed on; a fresh one prefers the pointer's
 * neighbourhood when there is a pointer, so hovering feels like stirring.
 */
export function chooseLink(
  links: readonly SynapseLink[],
  nodes: readonly SynapseNode[],
  rng: Rng,
  { from, near }: ChooseLinkOptions = {},
): LinkRoute | null {
  if (links.length === 0) {
    return null
  }

  let pool: readonly SynapseLink[] = links

  if (from !== undefined) {
    pool = links.filter((link) => link.i === from || link.j === from)

    if (pool.length === 0) {
      return null
    }
  } else if (near) {
    const close = links.filter(
      (link) =>
        Math.hypot(nodes[link.i].x - near.point.x, (nodes[link.i].y - near.point.y) / near.aspect) <
        near.reach,
    )

    if (close.length > 0 && rng() < 0.8) {
      pool = close
    }
  }

  const link = pool[Math.floor(rng() * pool.length)]
  const forward = from === undefined ? rng() < 0.5 : link.i === from

  return forward ? { from: link.i, to: link.j } : { from: link.j, to: link.i }
}

/**
 * The node that sends a signal to an anchor: the nearest one to its right,
 * so a dendrite reaches in from the open field rather than from behind the
 * copy - or simply the nearest, when nothing is to the right.
 */
export function nearestNodeTo(
  nodes: readonly SynapseNode[],
  anchor: UnitPoint,
  aspect: number,
  rightOf = 0.04,
): number {
  let best = -1
  let bestDistance = Number.POSITIVE_INFINITY

  const consider = (predicate: (node: SynapseNode) => boolean) => {
    nodes.forEach((node, index) => {
      if (!predicate(node)) return

      const distance = Math.hypot(node.x - anchor.x, (node.y - anchor.y) / aspect)

      if (distance < bestDistance) {
        bestDistance = distance
        best = index
      }
    })
  }

  consider((node) => node.x > anchor.x + rightOf)

  if (best < 0) {
    consider(() => true)
  }

  return best
}

/** Signals per second. Hovering stirs the field. */
export function signalRate(base: number, hovering: boolean): number {
  return base * (hovering ? 2.6 : 1)
}

/** Ambient word hits per second, once the sentence has been written. */
export function anchorHitRate(hovering: boolean): number {
  return hovering ? 0.9 : 0.35
}

/* -------------------------------------------------------------------------- */
/* Timing and policy                                                          */
/* -------------------------------------------------------------------------- */

export interface SynapseTiming {
  /** Seconds before the first signal leaves for the first anchor. */
  readonly entryDelay: number
  /** Seconds between two anchors being sent for. */
  readonly entryGap: number
  /** A signal's flight to an anchor, seconds, min and max. */
  readonly anchorFlightMin: number
  readonly anchorFlightMax: number
  /** A particle's travel along a link, seconds, min and max. */
  readonly linkFlightMin: number
  readonly linkFlightMax: number
  /** How long a word stays lit after a hit. */
  readonly pulse: number
}

/**
 * Every beat is a duration token or a multiple of one. Under reduced motion
 * everything is zero: the field is a still picture and the words are simply
 * there.
 */
export function synapseTiming(policy: MotionPolicy): SynapseTiming {
  const reveal = durationSeconds('reveal', policy)

  return {
    entryDelay: durationSeconds('normal', policy),
    entryGap: durationSeconds('tick', policy) * 2,
    anchorFlightMin: reveal,
    anchorFlightMax: reveal * 1.5,
    linkFlightMin: reveal * 2.3,
    linkFlightMax: reveal * 4.8,
    pulse: reveal,
  }
}

/** Seconds from mount until the last of `count` anchors has been written. */
export function sentenceWrittenAt(count: number, timing: SynapseTiming): number {
  if (count <= 0) {
    return 0
  }

  return timing.entryDelay + (count - 1) * timing.entryGap + timing.anchorFlightMax
}

export interface SynapseScene {
  /** The loop runs: nodes wander, signals travel. */
  readonly isRunning: boolean
}

/**
 * The field is Home artwork, which `DESIGN.md` allows to move ambiently; the
 * policy's `ambient` flag is therefore the whole decision. Under reduced motion
 * one frame is drawn and nothing moves.
 */
export function synapseScene(policy: MotionPolicy): SynapseScene {
  return { isRunning: policy.ambient }
}

/* -------------------------------------------------------------------------- */
/* Colour                                                                     */
/* -------------------------------------------------------------------------- */

export type FieldTheme = 'light' | 'dark'

export interface FieldInk {
  /** Which colour roles paint the field, as Chakra colour variable names. */
  readonly node: string
  readonly particle: string
  readonly halo: string
  /** Multipliers on the alphas tuned for the dark theme. */
  readonly linkGain: number
  readonly nodeGain: number
  /** The least opaque a node's core may be. */
  readonly coreFloor: number
}

/**
 * On the dark canvas the field is light: cobalt nodes, lime signals, a lime
 * glow. On the light canvas the same lime is invisible - 60% lime on white is
 * white - and cobalt at dark-tuned alphas washes out to nothing. So in light
 * the field is ink instead: cobalt throughout, the signal a shade deeper, the
 * glow cobalt too, and every alpha lifted. Same network, same motion; only
 * what "light" means changes with the canvas.
 */
export function fieldInk(theme: FieldTheme): FieldInk {
  if (theme === 'dark') {
    return {
      node: '--chakra-colors-action-primary',
      particle: '--chakra-colors-accent-lime',
      halo: '--chakra-colors-ambient-accentGlow',
      linkGain: 1,
      nodeGain: 1,
      coreFloor: 0.25,
    }
  }

  return {
    node: '--chakra-colors-action-primary',
    particle: '--chakra-colors-action-hover',
    halo: '--chakra-colors-action-primary',
    linkGain: 1.9,
    nodeGain: 1.5,
    coreFloor: 0.55,
  }
}

export type RgbChannels = readonly [number, number, number]

/**
 * A canvas has no tokens, so the component reads the resolved value of a
 * Chakra colour variable and paints with its channels at its own alpha. This
 * accepts the shapes those variables take: `#rgb`, `#rrggbb`, `rgb(r, g, b)`,
 * `rgba(r, g, b, a)` and the modern `rgb(r g b / a%)`.
 */
export function parseColorChannels(value: string): RgbChannels | null {
  const text = value.trim()

  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text)

  if (hex) {
    const digits = hex[1].length === 3 ? [...hex[1]].map((c) => c + c).join('') : hex[1]

    return [
      Number.parseInt(digits.slice(0, 2), 16),
      Number.parseInt(digits.slice(2, 4), 16),
      Number.parseInt(digits.slice(4, 6), 16),
    ]
  }

  const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(text)

  if (rgb) {
    return [Number.parseFloat(rgb[1]), Number.parseFloat(rgb[2]), Number.parseFloat(rgb[3])]
  }

  return null
}

export function rgba(channels: RgbChannels, alpha: number): string {
  const a = Math.min(1, Math.max(0, alpha))

  return `rgb(${channels[0]} ${channels[1]} ${channels[2]} / ${a})`
}

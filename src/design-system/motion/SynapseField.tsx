/**
 * Horizon Design System v2 - the synapse field.
 *
 * A living network behind the hero copy: nodes that wander, links that form
 * and dissolve, and signals that travel them. The copy is written by it -
 * anything inside that registers as an anchor (`Typeset`, `SignalTarget`) is
 * sent a signal in registration order when the field mounts, and appears when
 * the signal lands; afterwards the field keeps sending the odd signal into a
 * word, and stirs when the pointer is over it. The geometry and every decision
 * live in `synapse.logic.ts`; this file integrates, draws and cleans up.
 *
 * It is a canvas because forty wandering nodes with curves and glows at sixty
 * frames a second is not a job for the DOM. Colours are the resolved values of
 * the system's own colour variables, painted at the field's own alpha, so the
 * canvas follows the theme without a single literal. The browser withholds
 * frames from a hidden tab, so the loop rests there; it never starts under
 * reduced motion - one still frame is
 * drawn and every anchor is hit at once. Copy never waits on the field for
 * longer than `fallbackMs`.
 *
 * Two shells. As a `surface` the field is a feature plate: `Surface` owns the
 * border, radius, shadow and clipping. As a `canvas` it is the page itself:
 * no box, the field runs edge to edge on the page canvas, dissolves along
 * its bottom edge, fades as the reader scrolls it away (opacity only) and
 * sleeps once it has left the viewport. A scroll stirs it the way a pointer
 * does. Either way the children render above the canvas, and the field is
 * faint in a hand's width around their box.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { Box, useColorMode, type BoxProps } from '@chakra-ui/react'

import { space } from '../../theme/tokens'
import { Surface } from '../components/surface'
import { createDisposerBag, scheduleFrame } from './lifecycle.logic'
import { durationSeconds, type Disposer } from './policy.logic'
import {
  DEFAULT_VEIL,
  SYNAPSE,
  anchorHitRate,
  bezierPoint,
  chooseLink,
  createNodes,
  createRng,
  decayExcitation,
  easeInOut,
  exciteNear,
  fieldAwake,
  fieldOpacity,
  linkNodes,
  nearestNodeTo,
  parseColorChannels,
  rgba,
  signalRate,
  stepNodes,
  stirredUntil,
  synapseScene,
  synapseTiming,
  veilNear,
  type PixelRect,
  type RgbChannels,
  type SynapseLink,
  type SynapseNode,
  type UnitPoint,
  type Veil,
} from './synapse.logic'
import { SynapseContext, type SynapseAnchorHandle, type SynapseSignals } from './synapseContext'
import { useMotionPolicy } from './useMotionPolicy'

export interface SynapseFieldProps extends Omit<BoxProps, 'as'> {
  /** Copy laid over the field. Anchors inside it are written by the field. */
  children?: ReactNode
  /**
   * `surface`: a feature plate with its own border, radius and shadow.
   * `canvas`: no box - the field is the page for the height it is given,
   * dissolving along its bottom edge and fading as it scrolls away.
   */
  variant?: 'surface' | 'canvas'
  /** The landmark the canvas variant renders as. */
  as?: 'header' | 'section' | 'div'
  /** How many nodes. Forty reads as a network; twenty as a few thoughts. */
  density?: number
  /** Fresh signals per second at rest. */
  signalRate?: number
  /** How faint the field is around the copy's box. `NO_VEIL` for a bare field. */
  veil?: Veil
  /** Same seed, same field. Change it for a different arrangement. */
  seed?: number
}

interface Particle {
  from: number
  to: number
  t: number
  dur: number
  hops: number
}

interface AnchorSignal {
  from: number
  anchor: AnchorEntry
  t: number
  dur: number
}

interface AnchorEntry extends SynapseAnchorHandle {
  hit: boolean
}

interface Palette {
  node: RgbChannels
  particle: RgbChannels
  halo: RgbChannels
}

const frameScheduler = {
  request: (callback: () => void) => window.requestAnimationFrame(callback),
  cancel: (handle: number) => window.cancelAnimationFrame(handle),
}

const fallbackPalette: Palette = {
  node: [49, 88, 212],
  particle: [49, 88, 212],
  halo: [197, 236, 131],
}

/** The system's colour variables the canvas paints with, per theme. */
function readPalette(colorMode: 'light' | 'dark'): Palette {
  const root = getComputedStyle(document.documentElement)
  const read = (name: string, fallback: RgbChannels) =>
    parseColorChannels(root.getPropertyValue(name)) ?? fallback

  return {
    node: read('--chakra-colors-action-primary', fallbackPalette.node),
    particle:
      colorMode === 'dark'
        ? read('--chakra-colors-accent-lime', fallbackPalette.halo)
        : read('--chakra-colors-action-primary', fallbackPalette.particle),
    halo: read('--chakra-colors-ambient-accentGlow', fallbackPalette.halo),
  }
}

export function SynapseField({
  children,
  variant = 'surface',
  as = 'div',
  density = 40,
  signalRate: baseRate = 1.1,
  veil = DEFAULT_VEIL,
  seed = 7,
  ...rest
}: SynapseFieldProps) {
  const policy = useMotionPolicy()
  const { colorMode } = useColorMode()
  const scene = synapseScene(policy)
  const timing = synapseTiming(policy)
  const stirMs = Math.round(durationSeconds('reveal', policy) * 1000)

  const plateRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const pointerRef = useRef<UnitPoint | null>(null)
  const stirUntilRef = useRef(0)
  const anchorsRef = useRef<AnchorEntry[]>([])
  const paletteRef = useRef<Palette>(fallbackPalette)
  const reducedRef = useRef(policy.reduced)

  reducedRef.current = policy.reduced

  /*
   * Anchors register from effects in their tree order, which is writing order.
   * Under reduced motion there is no signal to wait for: the anchor is hit as
   * it registers and the word is simply there.
   */
  const register = useCallback((handle: SynapseAnchorHandle): Disposer => {
    const entry: AnchorEntry = { ...handle, hit: false }

    anchorsRef.current = [...anchorsRef.current, entry]

    if (reducedRef.current) {
      entry.hit = true
      handle.onHit(true)
    }

    return () => {
      anchorsRef.current = anchorsRef.current.filter((item) => item !== entry)
    }
  }, [])

  /*
   * Room for a long headline: the delay, two dozen beats and the longest
   * flight. In practice the sentence is written well inside it; this is the
   * ceiling content is guaranteed to appear by, whatever the frame loop does.
   */
  const fallbackMs = Math.round(
    (timing.entryDelay + 24 * timing.entryGap + timing.anchorFlightMax) * 1000,
  )
  const signals = useMemo<SynapseSignals>(() => ({ register, fallbackMs }), [register, fallbackMs])

  useEffect(() => {
    paletteRef.current = readPalette(colorMode)
  }, [colorMode])

  useEffect(() => {
    const plate = plateRef.current
    const canvas = canvasRef.current

    if (plate === null || canvas === null) {
      return
    }

    const context = canvas.getContext('2d')

    if (context === null) {
      return
    }

    const bag = createDisposerBag()
    const rng = createRng(seed)
    const nodes: SynapseNode[] = createNodes(density, rng)
    const particles: Particle[] = []
    const anchorSignals: AnchorSignal[] = []
    let width = 0
    let height = 0
    let time = 0
    let last = performance.now()
    let spawnClock = 0
    let entryClock = -timing.entryDelay
    let entryIndex = 0
    let hitClock = 0

    const resize = () => {
      const box = plate.getBoundingClientRect()
      const ratio = Math.min(2, window.devicePixelRatio || 1)

      width = box.width
      height = box.height
      canvas.width = Math.max(1, Math.round(width * ratio))
      canvas.height = Math.max(1, Math.round(height * ratio))
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const observer = new ResizeObserver(resize)

    observer.observe(plate)
    bag.add(() => observer.disconnect())
    resize()

    /*
     * The copy's box in the plate's pixel space, for the veil. Read once per
     * frame from the wrapper the children render in; null when there are no
     * children, which is also the whole veil switched off.
     */
    const copyRect = (): PixelRect | null => {
      const copy = copyRef.current

      if (copy === null) {
        return null
      }

      const plateBox = plate.getBoundingClientRect()
      const box = copy.getBoundingClientRect()

      return {
        left: box.left - plateBox.left,
        top: box.top - plateBox.top,
        width: box.width,
        height: box.height,
      }
    }

    const anchorPoint = (entry: AnchorEntry): UnitPoint | null => {
      if (width <= 0 || height <= 0) {
        return null
      }

      const plateBox = plate.getBoundingClientRect()
      const box = entry.element.getBoundingClientRect()

      return {
        x: (box.left + box.width * 0.5 - plateBox.left) / width,
        y: (box.top + box.height * 0.72 - plateBox.top) / height,
      }
    }

    const sendTo = (entry: AnchorEntry, aspect: number) => {
      const point = anchorPoint(entry)

      if (point === null) {
        return
      }

      const from = nearestNodeTo(nodes, point, aspect)

      if (from < 0) {
        return
      }

      anchorSignals.push({
        from,
        anchor: entry,
        t: 0,
        dur: timing.anchorFlightMin + rng() * (timing.anchorFlightMax - timing.anchorFlightMin),
      })
    }

    const spawn = (links: SynapseLink[], aspect: number, from?: number) => {
      const route = chooseLink(links, nodes, rng, {
        from,
        near: pointerRef.current ? { point: pointerRef.current, aspect, reach: 0.22 } : undefined,
      })

      if (route === null) {
        return
      }

      particles.push({
        from: route.from,
        to: route.to,
        t: 0,
        dur: timing.linkFlightMin + rng() * (timing.linkFlightMax - timing.linkFlightMin),
        hops: from === undefined ? 0 : 1,
      })
    }

    const draw = (dt: number) => {
      if (width <= 0 || height <= 0) {
        return
      }

      const aspect = width / height
      const running = scene.isRunning
      const pointer = pointerRef.current
      const palette = paletteRef.current
      const copy = copyRect()
      const stirred = pointer !== null || performance.now() < stirUntilRef.current
      const visibleAt = (point: UnitPoint) =>
        veilNear({ x: point.x * width, y: point.y * height }, copy, veil)

      if (running) {
        time += dt
        stepNodes(nodes, dt, time, aspect)

        if (pointer) {
          exciteNear(nodes, pointer, aspect)
        }
      }

      const links = linkNodes(nodes, aspect)

      if (running) {
        // Writing the copy: one anchor per beat, in registration order.
        const anchors = anchorsRef.current

        if (entryIndex < anchors.length) {
          entryClock += dt

          while (entryClock >= 0 && entryIndex < anchors.length) {
            sendTo(anchors[entryIndex], aspect)
            entryIndex += 1
            entryClock -= timing.entryGap
          }
        } else if (anchors.length > 0) {
          // Reading it back: now and then a signal lands on a word.
          hitClock += dt * anchorHitRate(stirred)

          if (hitClock >= 1) {
            hitClock -= 1

            if (rng() < 0.6) {
              sendTo(anchors[Math.floor(rng() * anchors.length)], aspect)
            }
          }
        }

        spawnClock += dt * signalRate(baseRate, stirred)

        while (spawnClock >= 1) {
          spawnClock -= 1
          spawn(links, aspect)
        }
      }

      context.clearRect(0, 0, width, height)
      context.lineCap = 'round'

      // Links: soft curved hairlines, brighter where a node is excited.
      for (const link of links) {
        const a = nodes[link.i]
        const b = nodes[link.j]
        const excitement = Math.max(a.excitation, b.excitation)
        const visible = Math.min(visibleAt(a), visibleAt(b))
        const alpha = (0.06 + 0.22 * link.w + 0.35 * excitement) * visible

        if (alpha < 0.01) continue

        context.beginPath()
        context.moveTo(a.x * width, a.y * height)
        context.quadraticCurveTo(link.cx * width, link.cy * height, b.x * width, b.y * height)
        context.strokeStyle = rgba(palette.node, alpha)
        context.lineWidth = 0.8 + excitement * 0.8
        context.stroke()
      }

      // Particles along links. A landing lights the node and may carry on.
      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index]
        const link = links.find(
          (candidate) =>
            (candidate.i === particle.from && candidate.j === particle.to) ||
            (candidate.i === particle.to && candidate.j === particle.from),
        )

        if (running) {
          particle.t += dt / particle.dur
        }

        if (link === undefined || particle.t >= 1) {
          if (link !== undefined && particle.t >= 1) {
            nodes[particle.to].excitation = 1

            if (particle.hops < SYNAPSE.maxHops && rng() < SYNAPSE.chainChance) {
              spawn(links, aspect, particle.to)
            }
          }

          particles.splice(index, 1)
          continue
        }

        const a = nodes[particle.from]
        const b = nodes[particle.to]
        const point = bezierPoint(a, { x: link.cx, y: link.cy }, b, easeInOut(particle.t))
        const fade = Math.sin(particle.t * Math.PI) * visibleAt(point)

        paintSpark(context, point, width, height, palette, fade)
      }

      // Signals into the copy: a dendrite that exists only while it travels.
      for (let index = anchorSignals.length - 1; index >= 0; index -= 1) {
        const signal = anchorSignals[index]
        const target = anchorPoint(signal.anchor)

        if (target === null) {
          anchorSignals.splice(index, 1)
          continue
        }

        if (running) {
          signal.t += dt / signal.dur
        }

        const a = nodes[signal.from]
        const progress = Math.min(1, signal.t)
        const control = { x: (a.x + target.x) / 2, y: (a.y + target.y) / 2 - 0.06 }
        const point = bezierPoint(a, control, target, easeInOut(progress))
        const life = Math.sin(progress * Math.PI)

        context.beginPath()
        context.moveTo(a.x * width, a.y * height)
        context.quadraticCurveTo(
          control.x * width,
          control.y * height,
          target.x * width,
          target.y * height,
        )
        context.strokeStyle = rgba(palette.node, 0.28 * life)
        context.lineWidth = 0.9
        context.stroke()
        paintSpark(context, point, width, height, palette, Math.max(life, 0.35))

        if (signal.t >= 1) {
          a.excitation = Math.max(a.excitation, 0.5)

          const first = !signal.anchor.hit

          signal.anchor.hit = true
          signal.anchor.onHit(first)
          anchorSignals.splice(index, 1)
        }
      }

      // Nodes: a soft body, a brighter core, and a warm bloom when excited.
      for (const node of nodes) {
        const visible = visibleAt(node)
        const radius = node.radius * (1 + node.excitation * 0.9)
        const alpha = (node.base * 0.55 + node.excitation * 0.45) * visible
        const x = node.x * width
        const y = node.y * height

        const body = context.createRadialGradient(x, y, 0, x, y, radius * 4.5)

        body.addColorStop(0, rgba(palette.node, alpha * 0.55))
        body.addColorStop(0.35, rgba(palette.node, alpha * 0.16))
        body.addColorStop(1, rgba(palette.node, 0))
        context.fillStyle = body
        context.beginPath()
        context.arc(x, y, radius * 4.5, 0, Math.PI * 2)
        context.fill()

        if (node.excitation > 0.05) {
          const bloom = context.createRadialGradient(x, y, 0, x, y, radius * 7)

          bloom.addColorStop(0, rgba(palette.halo, node.excitation * 0.35 * visible))
          bloom.addColorStop(1, rgba(palette.halo, 0))
          context.fillStyle = bloom
          context.beginPath()
          context.arc(x, y, radius * 7, 0, Math.PI * 2)
          context.fill()
        }

        context.fillStyle = rgba(palette.node, Math.min(1, alpha + 0.25))
        context.beginPath()
        context.arc(x, y, radius, 0, Math.PI * 2)
        context.fill()
      }

      if (running) {
        decayExcitation(nodes, dt)
      }
    }

    let awake = true
    let looping = false

    const tick = () => {
      const now = performance.now()
      const dt = Math.min(0.05, (now - last) / 1000)

      last = now
      draw(dt)

      /*
       * One frame at a time, each scheduling the next. The browser itself
       * withholds animation frames from a hidden tab, so the loop rests there
       * without a visibility listener of its own, and `dt` is capped so the
       * first frame after a long rest is a step, never a leap. Once the field
       * has scrolled out of the viewport the loop stops scheduling itself and
       * the intersection observer wakes it again.
       */
      if (scene.isRunning && awake) {
        bag.add(scheduleFrame(frameScheduler, tick))
      } else {
        looping = false
      }
    }

    const wake = () => {
      if (scene.isRunning && awake && !looping) {
        looping = true
        last = performance.now()
        bag.add(scheduleFrame(frameScheduler, tick))
      }
    }

    // The first frame is drawn at once - under reduced motion it is the only one.
    draw(0)
    wake()

    if (variant === 'canvas' && typeof IntersectionObserver !== 'undefined') {
      const thresholds = Array.from({ length: 11 }, (_unused, index) => index / 10)
      const seen = new IntersectionObserver(
        (entries) => {
          const ratio = entries[entries.length - 1]?.intersectionRatio ?? 1

          canvas.style.opacity = String(fieldOpacity(ratio))
          awake = fieldAwake(ratio)
          wake()
        },
        { threshold: thresholds },
      )

      seen.observe(plate)
      bag.add(() => seen.disconnect())

      const onScroll = () => {
        stirUntilRef.current = stirredUntil(performance.now(), stirMs)
      }

      window.addEventListener('scroll', onScroll, { passive: true })
      bag.add(() => window.removeEventListener('scroll', onScroll))
    }

    return () => bag.dispose()
  }, [
    density,
    seed,
    baseRate,
    veil,
    scene.isRunning,
    variant,
    stirMs,
    timing.entryDelay,
    timing.entryGap,
    timing.anchorFlightMin,
    timing.anchorFlightMax,
    timing.linkFlightMin,
    timing.linkFlightMax,
  ])

  const follow = (event: ReactPointerEvent<HTMLElement>) => {
    const box = event.currentTarget.getBoundingClientRect()

    if (box.width <= 0 || box.height <= 0) {
      return
    }

    pointerRef.current = {
      x: (event.clientX - box.left) / box.width,
      y: (event.clientY - box.top) / box.height,
    }
  }

  const canvasLayer = (
    <Box
      as="canvas"
      ref={canvasRef}
      aria-hidden="true"
      position="absolute"
      inset={0}
      width="100%"
      height="100%"
      display="block"
      pointerEvents="none"
      sx={
        variant === 'canvas'
          ? {
              /* The field dissolves into the page along its bottom edge. */
              maskImage: `linear-gradient(to bottom, black calc(100% - ${space[24]}), transparent)`,
              WebkitMaskImage: `linear-gradient(to bottom, black calc(100% - ${space[24]}), transparent)`,
            }
          : undefined
      }
    />
  )

  const copyLayer =
    children === undefined ? null : (
      <Box ref={copyRef} position="relative" zIndex={1} width="100%">
        {children}
      </Box>
    )

  const pointerProps = {
    onPointerMove: follow,
    onPointerLeave: () => {
      pointerRef.current = null
    },
  }

  if (variant === 'canvas') {
    return (
      <SynapseContext.Provider value={signals}>
        <Box
          ref={plateRef}
          as={as}
          position="relative"
          overflow="hidden"
          display="flex"
          alignItems="center"
          {...pointerProps}
          {...rest}
        >
          {canvasLayer}
          {copyLayer}
        </Box>
      </SynapseContext.Provider>
    )
  }

  return (
    <SynapseContext.Provider value={signals}>
      <Surface
        ref={plateRef}
        depth="feature"
        padded={false}
        position="relative"
        {...pointerProps}
        {...rest}
      >
        {canvasLayer}
        {copyLayer}
      </Surface>
    </SynapseContext.Provider>
  )
}

/** A signal: a warm halo and a bright core. */
function paintSpark(
  context: CanvasRenderingContext2D,
  point: UnitPoint,
  width: number,
  height: number,
  palette: Palette,
  strength: number,
): void {
  const x = point.x * width
  const y = point.y * height
  const halo = context.createRadialGradient(x, y, 0, x, y, 11)

  halo.addColorStop(0, rgba(palette.halo, 0.6 * strength))
  halo.addColorStop(1, rgba(palette.halo, 0))
  context.fillStyle = halo
  context.beginPath()
  context.arc(x, y, 11, 0, Math.PI * 2)
  context.fill()

  context.fillStyle = rgba(palette.particle, 0.1 + 0.9 * strength)
  context.beginPath()
  context.arc(x, y, 1.7, 0, Math.PI * 2)
  context.fill()
}

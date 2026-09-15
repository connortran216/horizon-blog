/**
 * The About hero - migrated onto Horizon Design System v2 (release M2).
 *
 * `Surface` at `feature` depth is the single visual owner of the shell: one
 * border, one radius and the one shadow the token source defines.
 *
 * Behind the copy sits an ambient scene - two glow pools that follow the
 * pointer at different rates and a slow pass of light across them.
 * `DESIGN.md`'s Motion section sanctions ambient movement on suitable Home and
 * About artwork provided it pauses on interaction and stops under reduced
 * motion. Both conditions are decided by `ambientScene` in
 * `aboutHero.logic.ts`, where they are tested; this file only draws the answer.
 * Every colour it draws comes from the `ambient.*` roles and the blur from the
 * `blur` scale, so the scene is atmosphere the token source owns rather than
 * glow a component invented.
 *
 * The editorial track is three real controls. Each is a native `button` with
 * `aria-pressed`, and pressing one changes both the emphasised thread and the
 * scene behind it. The button sits inside the `h3` rather than around it: a
 * button may not contain a heading or a paragraph, so the heading wraps the
 * control, the control's accessible name is the thread title alone, and the
 * sentence underneath stays a sibling `p` linked with `aria-describedby`.
 */

import { useEffect, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { Box } from '@chakra-ui/react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'

import { componentTokens, radii, space, transitionFor } from '../../../theme/tokens'
import {
  ActionLink,
  Divider,
  Eyebrow,
  Grid,
  Heading,
  SectionLabel,
  Stack,
  Surface,
  Text,
  createDisposerBag,
  durationSeconds,
  scheduleTimer,
  standardEase,
  useMotionPolicy,
} from '../../../design-system'
import {
  AUTO_ADVANCE_MS,
  POINTER_CENTRE,
  POINTER_SPRING,
  USER_PAUSE_MS,
  ambientScene,
  clampThreadIndex,
  nextThreadIndex,
  pointerPositionIn,
  threadDetailId,
  threadOrdinal,
  threadState,
  trackAdvances,
} from '../aboutHero.logic'
import { AboutFocusThread } from '../about.types'

interface AboutHeroProps {
  focusThreads: AboutFocusThread[]
}

/*
 * Injected rather than called inline. `CONVENTIONS.md` requires every timer to
 * go through the lifecycle helpers so that disposal is one call and a test can
 * prove it happened.
 */
const timerScheduler = {
  set: (callback: () => void, delayMs: number) => window.setTimeout(callback, delayMs),
  clear: (handle: number) => window.clearTimeout(handle),
}

/** Full-bleed decoration inside the hero. Never in the accessibility tree. */
const layerStyle = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
} as const

const AboutHero = ({ focusThreads }: AboutHeroProps) => {
  const policy = useMotionPolicy()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHeld, setIsHeld] = useState(false)

  const count = focusThreads.length
  const currentIndex = clampThreadIndex(activeIndex, count)

  const scene = ambientScene({
    threadIndex: currentIndex,
    threadCount: count,
    allowsAmbient: policy.ambient,
    allowsPointerFollowing: policy.pointerFollowing,
    isHeld,
  })

  /*
   * The pointer lives in motion values rather than in state: it changes on
   * every mouse move, and a re-render per move would put the whole track
   * through React for a decoration. The spring is what turns a jittery cursor
   * into a drift.
   */
  const pointerX = useMotionValue(POINTER_CENTRE.x)
  const pointerY = useMotionValue(POINTER_CENTRE.y)
  const smoothX = useSpring(pointerX, POINTER_SPRING)
  const smoothY = useSpring(pointerY, POINTER_SPRING)

  // Two travel rates, which is what reads as depth. Both are zero when the
  // policy forbids pointer following, so the transforms resolve to no movement
  // rather than being conditionally mounted.
  const glowX = useTransform(smoothX, [-1, 1], [-scene.travel.glowPx, scene.travel.glowPx])
  const glowY = useTransform(smoothY, [-1, 1], [scene.travel.glowPx, -scene.travel.glowPx])
  const washX = useTransform(smoothX, [-1, 1], [-scene.travel.washPx, scene.travel.washPx])
  const washY = useTransform(smoothY, [-1, 1], [scene.travel.washPx, -scene.travel.washPx])

  const layerTransition = { duration: durationSeconds('reveal', policy), ease: standardEase }

  useEffect(() => {
    if (!isHeld) {
      return
    }

    const bag = createDisposerBag()

    bag.add(scheduleTimer(timerScheduler, () => setIsHeld(false), USER_PAUSE_MS))

    return () => bag.dispose()
  }, [isHeld])

  // One timer per step rather than a repeating interval: an interval whose
  // predicate changes mid-flight keeps its old schedule, so the track would
  // jump the moment a reader's hold expired.
  useEffect(() => {
    if (!trackAdvances({ count, isPaused: isHeld, allowsAmbient: policy.ambient })) {
      return
    }

    const bag = createDisposerBag()

    bag.add(
      scheduleTimer(
        timerScheduler,
        () => setActiveIndex((index) => nextThreadIndex(index, count)),
        AUTO_ADVANCE_MS,
      ),
    )

    return () => bag.dispose()
  }, [count, currentIndex, isHeld, policy.ambient])

  /**
   * Selecting a thread also holds the track. `DESIGN.md` requires ambient
   * movement to pause on interaction; there is no hold to arrange when the
   * track is not moving in the first place.
   */
  const selectThread = (index: number) => {
    setActiveIndex(index)

    if (policy.ambient) {
      setIsHeld(true)
    }
  }

  const handlePointerMove = (event: ReactMouseEvent<HTMLElement>) => {
    if (!policy.pointerFollowing) {
      return
    }

    const position = pointerPositionIn(
      event.currentTarget.getBoundingClientRect(),
      event.clientX,
      event.clientY,
    )

    pointerX.set(position.x)
    pointerY.set(position.y)
  }

  const handlePointerLeave = () => {
    pointerX.set(POINTER_CENTRE.x)
    pointerY.set(POINTER_CENTRE.y)
  }

  return (
    <Surface
      as="section"
      depth="feature"
      position="relative"
      p={{ base: space[6], sm: space[8] }}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
    >
      {/* The far layer: the primary pool, travelling furthest. */}
      <motion.div aria-hidden="true" style={{ ...layerStyle, x: glowX, y: glowY }}>
        <motion.div
          animate={{ opacity: scene.glow.opacity, scale: scene.glow.scale }}
          transition={layerTransition}
          style={{ position: 'absolute', top: '-28%', left: '-14%', width: '58%', height: '88%' }}
        >
          <Box
            position="absolute"
            inset={0}
            borderRadius={radii.tag}
            bg={componentTokens.feature.ambientGlow}
            filter={`blur(${componentTokens.feature.ambientBlur})`}
          />
        </motion.div>
      </motion.div>

      {/* The near layer: the accent pool and the pass of light, travelling less. */}
      <motion.div aria-hidden="true" style={{ ...layerStyle, x: washX, y: washY }}>
        <motion.div
          animate={{ opacity: scene.accentGlow.opacity, scale: scene.accentGlow.scale }}
          transition={layerTransition}
          style={{ position: 'absolute', top: '-12%', right: '-8%', width: '44%', height: '70%' }}
        >
          <Box
            position="absolute"
            inset={0}
            borderRadius={radii.tag}
            bg={componentTokens.feature.ambientAccentGlow}
            filter={`blur(${componentTokens.feature.ambientBlur})`}
          />
        </motion.div>

        {scene.sweep.isRunning ? (
          <motion.div
            animate={{ x: ['-120%', '128%'], opacity: [0, scene.sweep.opacity, 0] }}
            transition={{
              duration: scene.sweep.travelSeconds,
              repeatDelay: scene.sweep.restSeconds,
              repeat: Infinity,
              ease: standardEase,
            }}
            style={{
              position: 'absolute',
              top: '-14%',
              left: '14%',
              width: '58%',
              height: '86%',
              skewX: -14,
            }}
          >
            <Box
              position="absolute"
              inset={0}
              bg={componentTokens.feature.ambientSweep}
              filter={`blur(${componentTokens.feature.ambientBloom})`}
            />
          </motion.div>
        ) : null}
      </motion.div>

      <Stack position="relative" gap={8}>
        <Stack gap={6} maxW="prose">
          <Eyebrow as="p">About Horizon</Eyebrow>

          <Heading recipe="display" as="h1">
            A personal blog shaped by engineering and a quieter interface.
          </Heading>

          <Text recipe="prose">
            Horizon is where personal writing, backend experience, and interface craft meet. It is
            both a publishing space and a deliberate product surface for ideas that come from real
            work.
          </Text>

          <Text recipe="body">
            The ambition is simple: make the writing worth returning to, then build an interface
            precise enough to hold it without noise.
          </Text>

          <Stack direction="row" collapseAt={undefined} gap={6} flexWrap="wrap">
            <ActionLink
              standalone
              to="/blog"
              underline="hover"
              iconEnd={<FiArrowRight aria-hidden="true" />}
              color="action.primary"
              fontWeight="semibold"
            >
              Read the blog
            </ActionLink>
            <ActionLink
              standalone
              to="/contact"
              underline="hover"
              color="action.primary"
              fontWeight="semibold"
            >
              Get in touch
            </ActionLink>
          </Stack>
        </Stack>

        <Divider />

        <Stack gap={4}>
          {/*
            The only name this group of three has. As a kicker it left the three
            cards as h3s directly under the page's h1, with nothing between -
            measured as the h1 -> h3 skip on /about. Same words, same size, now
            in the outline.
          */}
          <SectionLabel>Editorial track</SectionLabel>

          <Grid as="ul" columns={3} gap={6} collapseAt="lg">
            {focusThreads.map((thread, index) => {
              const state = threadState(index, currentIndex)
              const detailId = threadDetailId(index)

              return (
                <Box as="li" key={thread.label}>
                  <Stack gap={3}>
                    <Stack
                      direction="row"
                      collapseAt={undefined}
                      gap={3}
                      alignItems="baseline"
                      textStyle="meta"
                      color={state.labelColor}
                      letterSpacing="wider"
                      fontWeight="semibold"
                      transition={transitionFor('color')}
                    >
                      <Box as="span">{threadOrdinal(index)}</Box>
                      <Box as="span" textTransform="uppercase">
                        {thread.label}
                      </Box>
                    </Stack>

                    <Heading
                      recipe="cardTitle"
                      as="h3"
                      color={state.titleColor}
                      transition={transitionFor('color')}
                    >
                      {/*
                       * `h3` wrapping `button` is the one nesting that works
                       * here: a heading accepts phrasing content, a button is
                       * phrasing content, and the outline keeps its entry. The
                       * global `*:focus-visible` rule draws the ring, so this
                       * control deliberately declares no `_focus` of its own.
                       */}
                      <Box
                        as="button"
                        type="button"
                        aria-pressed={state.ariaPressed}
                        aria-describedby={detailId}
                        onClick={() => selectThread(index)}
                        onMouseEnter={() => selectThread(index)}
                        onFocus={() => selectThread(index)}
                        display="block"
                        width="100%"
                        paddingBlock={space[2]}
                        textAlign="left"
                        bg="transparent"
                        border="none"
                        borderRadius={radii.control}
                        color="inherit"
                        cursor="pointer"
                        sx={{ font: 'inherit' }}
                      >
                        {thread.title}
                      </Box>
                    </Heading>

                    <Text recipe="body" id={detailId}>
                      {thread.description}
                    </Text>

                    {/*
                     * Decoration, not state. Every thread's label, title and
                     * description is readable at every moment, so the rule and
                     * the colour step are emphasis the eye can follow; the
                     * control's own `aria-pressed` is what carries the
                     * selection. Colour only - never width or weight - so
                     * nothing beside it moves when the track advances.
                     */}
                    <Divider
                      {...(state.isActive ? { borderColor: 'action.primary' } : {})}
                      aria-hidden="true"
                      transition={transitionFor('border-color')}
                    />
                  </Stack>
                </Box>
              )
            })}
          </Grid>
        </Stack>
      </Stack>
    </Surface>
  )
}

export default AboutHero

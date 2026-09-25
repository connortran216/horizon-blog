/**
 * The About hero - migrated onto Horizon Design System v2 (release M2).
 *
 * It speaks Home's Dawn language as a first screen of its own. The field runs
 * edge to edge under a header with no bar at the top of the page, the copy
 * sits in the content frame on its left, and the field writes the headline:
 * the eyebrow and each word appear as a signal lands on them, and "quieter
 * interface." gets the drawn rule. The lede and calls to action follow a beat
 * apart as the sentence finishes. There is no box around any of it; the field
 * dissolves along its bottom edge into the editorial track beneath.
 *
 * The editorial track is three real controls, and it drives the field: each
 * thread is a place on the field (`threadFocus` in `aboutHero.logic.ts`), and
 * the network gathers towards the current thread's place, keeps it softly lit
 * and sends its fresh signals from there. The track advances on its own and
 * holds when the reader chooses a thread; under reduced motion it does not
 * advance, and the field is one still frame with every word present.
 *
 * Each thread is a native `button` with `aria-pressed`. The button sits inside
 * the `h3` rather than around it: a button may not contain a heading or a
 * paragraph, so the heading wraps the control, the control's accessible name is
 * the thread title alone, and the sentence underneath stays a sibling `p`
 * linked with `aria-describedby`.
 */

import { useEffect, useState } from 'react'
import { Box } from '@chakra-ui/react'
import { FiArrowRight } from 'react-icons/fi'

import { radii, space, transitionFor } from '../../../theme/tokens'
import {
  ActionLink,
  COPY_MARKER,
  ContentContainer,
  Divider,
  Eyebrow,
  Grid,
  Heading,
  SectionLabel,
  SignalLine,
  SignalTarget,
  Stack,
  Stagger,
  SynapseField,
  Text,
  Typeset,
  createDisposerBag,
  scheduleTimer,
  sentenceWrittenAt,
  synapseTiming,
  useMotionPolicy,
} from '../../../design-system'
import {
  AUTO_ADVANCE_MS,
  USER_PAUSE_MS,
  clampThreadIndex,
  nextThreadIndex,
  threadDetailId,
  threadFocus,
  threadOrdinal,
  threadState,
  trackAdvances,
} from '../aboutHero.logic'
import { AboutFocusThread } from '../about.types'

interface AboutHeroProps {
  focusThreads: AboutFocusThread[]
}

export const ABOUT_HEADLINE = 'A personal blog shaped by engineering and a quieter interface.'
export const ABOUT_EMPHASIS = 'quieter interface.'

/** The eyebrow plus every word of the headline: the anchors the field writes. */
const ABOUT_ANCHOR_COUNT = 1 + ABOUT_HEADLINE.trim().split(/\s+/u).length

/** Home's first screen carries 56; About's band is shorter and a little quieter. */
const FIELD_DENSITY = 44

/** The band is a first screen's worth of height at desktop, short of the full viewport. */
const FIELD_MIN_HEIGHT = '72svh'

const ABOUT_TITLE_ID = 'about-title'

/*
 * Injected rather than called inline. `CONVENTIONS.md` requires every timer to
 * go through the lifecycle helpers so that disposal is one call and a test can
 * prove it happened.
 */
const timerScheduler = {
  set: (callback: () => void, delayMs: number) => window.setTimeout(callback, delayMs),
  clear: (handle: number) => window.clearTimeout(handle),
}

const AboutHero = ({ focusThreads }: AboutHeroProps) => {
  const policy = useMotionPolicy()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHeld, setIsHeld] = useState(false)

  const count = focusThreads.length
  const currentIndex = clampThreadIndex(activeIndex, count)
  const focus = threadFocus(currentIndex, count)
  // The lede and the calls to action come in as the sentence finishes, as on Home.
  const afterHeadline = sentenceWrittenAt(ABOUT_ANCHOR_COUNT, synapseTiming(policy)) * 0.7

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
   * Selecting a thread also holds the track, so the field stays where the
   * reader sent it. There is no hold to arrange when the track is not moving
   * in the first place.
   */
  const selectThread = (index: number) => {
    setActiveIndex(index)

    if (policy.ambient) {
      setIsHeld(true)
    }
  }

  return (
    <>
      {/*
        The first screen, unboxed. The field runs edge to edge under a header
        that has no bar of its own at the top of the page, the copy sits in the
        content frame on its left, and the network gathers on the right around
        whichever thread is current - a constellation beside the sentence
        rather than a plate behind it. It dissolves along its bottom edge into
        the editorial track.
      */}
      <SynapseField
        variant="canvas"
        as="section"
        aria-labelledby={ABOUT_TITLE_ID}
        density={FIELD_DENSITY}
        focus={focus}
        seed={11}
        minH={{ lg: FIELD_MIN_HEIGHT }}
      >
        <ContentContainer py={{ base: 12, md: 16 }}>
          <Stack gap={6} maxW={{ base: 'none', lg: '64%' }} {...{ [COPY_MARKER]: '' }}>
            <SignalTarget>
              <Eyebrow as="p">About Horizon</Eyebrow>
            </SignalTarget>

            <Heading recipe="display" as="h1" id={ABOUT_TITLE_ID}>
              <Typeset emphasis={ABOUT_EMPHASIS}>{ABOUT_HEADLINE}</Typeset>
            </Heading>

            <Stagger trigger="mount" initialDelay={afterHeadline} maxDelay={afterHeadline + 0.6}>
              <Text recipe="prose" maxW="prose">
                Horizon is where personal writing, backend experience, and interface craft meet. It
                is both a publishing space and a deliberate product surface for ideas that come from
                real work.
              </Text>

              <Text recipe="body" maxW="prose">
                The ambition is simple: make the writing worth returning to, then build an interface
                precise enough to hold it without noise.
              </Text>

              <Stack
                direction="row"
                collapseAt="sm"
                gap={6}
                alignItems={{ base: 'flex-start', sm: 'center' }}
                flexWrap="wrap"
              >
                <ActionLink
                  to="/blog"
                  weight="primary"
                  iconEnd={<FiArrowRight aria-hidden="true" />}
                >
                  Read the blog
                </ActionLink>
                <ActionLink to="/contact" underline="hover" standalone color="text.secondary">
                  Get in touch
                </ActionLink>
              </Stack>
            </Stagger>
          </Stack>
        </ContentContainer>
      </SynapseField>

      {/*
        The editorial track: the band's horizon. Each thread stands on a quiet
        rule, and the current thread's rule draws over it in the action colour,
        a signal at its tip - the same moment the field leans to that thread's
        place. No box: three columns of writing under three lines.
      */}
      <ContentContainer>
        <Stack as="section" gap={6} aria-label="Editorial track" pb={{ base: 4, md: 8 }}>
          {/*
            The only name this group of three has. As a kicker it left the three
            threads as h3s directly under the page's h1, with nothing between -
            measured as the h1 -> h3 skip on /about. Same words, same size, now
            in the outline.
          */}
          <SectionLabel>Editorial track</SectionLabel>

          <Grid as="ul" columns={3} gap={8} collapseAt="lg">
            {focusThreads.map((thread, index) => {
              const state = threadState(index, currentIndex)
              const detailId = threadDetailId(index)

              return (
                <Box as="li" key={thread.label} listStyleType="none">
                  <Stack gap={4}>
                    <Box position="relative">
                      <Divider aria-hidden="true" />
                      <SignalLine
                        tone="action"
                        drawn={state.isActive}
                        position="absolute"
                        top={0}
                        left={0}
                        height="2px"
                      />
                    </Box>

                    {/* A plain flex row: ordinal and label stay on one line at every width. */}
                    <Box
                      display="flex"
                      gap={space[3]}
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
                    </Box>

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
                  </Stack>
                </Box>
              )
            })}
          </Grid>
        </Stack>
      </ContentContainer>
    </>
  )
}

export default AboutHero

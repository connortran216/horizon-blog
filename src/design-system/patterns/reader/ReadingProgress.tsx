/**
 * Horizon Design System v2 - how far through the article you are.
 *
 * A fixed bar across the top of the viewport, driven by the prose element's own
 * geometry rather than by the document height - a page with a long footer and a
 * comments thread would otherwise show 60% at the end of the article.
 *
 * Two things are worth reading twice:
 *
 * - The indicator is a `scaleX`, so filling it never triggers layout. Under
 *   reduced motion the value still changes; only the easing stops. Progress is
 *   state, not decoration.
 * - Every measurement is coalesced into one animation frame and every
 *   subscription goes into a disposer bag, so a scroll listener cannot outlive
 *   the reader page.
 * - The percentage is published through `onChange` as well as drawn. A reading
 *   page that reports milestones to analytics therefore measures once; the bar
 *   and the events read the same number from the same listener and cannot
 *   disagree.
 */

import { useEffect, useRef, useState, type RefObject } from 'react'
import { Box, type BoxProps } from '@chakra-ui/react'

import { componentTokens } from '../../../theme/tokens'
import {
  createDisposerBag,
  scheduleFrame,
  useMotionPolicy,
  type FrameScheduler,
} from '../../motion'
import {
  readingProgress,
  readingProgressAria,
  readingProgressScale,
  readingProgressTransition,
  shouldReportProgress,
} from './reader.logic'

export interface ReadingProgressProps extends Omit<BoxProps, 'children' | 'onChange'> {
  /** The element being read. Usually the `Prose` frame. */
  contentRef: RefObject<HTMLElement>
  label?: string
  /** Re-measure when this changes - a new article in the same route. */
  resetKey?: string | number
  /**
   * The percentage, each time it changes.
   *
   * A page that reports reading milestones to a session service used to run a
   * second scroll listener over the same element to get this number, which is
   * two subscriptions, two measurements and two chances for the bar and the
   * events to disagree about how far somebody has read. The bar already knows;
   * this is it saying so.
   *
   * Called with whole percentages only, and only on a change - so a reader who
   * scrolls within one percent does not generate an event per frame. The
   * identity of the function does not matter: it is read through a ref, so an
   * inline arrow does not tear the listener down and rebuild it.
   */
  onChange?: (percent: number) => void
}

const frameScheduler: FrameScheduler = {
  request: (callback) =>
    typeof window === 'undefined' ? 0 : window.requestAnimationFrame(callback),
  cancel: (handle) => {
    if (typeof window !== 'undefined') {
      window.cancelAnimationFrame(handle)
    }
  },
}

export function ReadingProgress({
  contentRef,
  label = 'Reading progress',
  resetKey,
  onChange,
  ...rest
}: ReadingProgressProps) {
  const policy = useMotionPolicy()
  const [percent, setPercent] = useState(0)
  /*
   * The subscription is keyed on the element and the article, not on the
   * subscriber. Holding the callback in a ref is what lets a page pass an
   * inline arrow without rebuilding the scroll listener on every render.
   */
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const bag = createDisposerBag()
    let frameQueued = false
    let reported: number | null = null

    const measure = () => {
      const element = contentRef.current

      if (!element) {
        return
      }

      const rect = element.getBoundingClientRect()
      const next = readingProgress({
        contentTop: rect.top,
        contentHeight: rect.height,
        viewportHeight: window.innerHeight,
      })

      setPercent(next)

      if (shouldReportProgress(reported, next)) {
        reported = next
        onChangeRef.current?.(next)
      }
    }

    const schedule = () => {
      if (frameQueued) {
        return
      }

      frameQueued = true
      bag.add(
        scheduleFrame(frameScheduler, () => {
          frameQueued = false
          measure()
        }),
      )
    }

    window.addEventListener('scroll', schedule, { passive: true })
    bag.add(() => window.removeEventListener('scroll', schedule))
    window.addEventListener('resize', schedule)
    bag.add(() => window.removeEventListener('resize', schedule))

    // The prose grows as images decode and as an embedded editor hydrates, so
    // the element's own size has to be watched as well as the window's.
    const element = contentRef.current

    if (element && typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(schedule)
      observer.observe(element)
      bag.add(() => observer.disconnect())
    }

    measure()

    return () => bag.dispose()
  }, [contentRef, resetKey])

  return (
    <Box
      {...readingProgressAria(percent, label)}
      position="fixed"
      insetBlockStart={0}
      insetInline={0}
      height="3px"
      bg={componentTokens.reader.progressTrack}
      pointerEvents="none"
      zIndex="banner"
      {...rest}
    >
      <Box
        aria-hidden="true"
        height="100%"
        width="100%"
        bg={componentTokens.reader.progressIndicator}
        transformOrigin="left"
        transform={`scaleX(${readingProgressScale(percent)})`}
        transition={readingProgressTransition(policy)}
      />
    </Box>
  )
}

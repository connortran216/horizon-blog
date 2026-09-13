/**
 * Which heading the reader is in, and where a deep link lands.
 *
 * The arithmetic belongs to the design system - `activeHeadingId` and
 * `resolveHeadingDeepLink` in `patterns/reader/reader.logic.ts` - so this hook
 * owns only the parts that need a browser: reading the heading positions once
 * per animation frame, and putting every subscription into a disposer bag so a
 * scroll listener cannot outlive the reader page.
 *
 * The deep link is resolved here rather than left to the browser because the
 * article body arrives late. The reading surface is a lazily imported editor, so
 * at the moment the browser processes `location.hash` the heading it points at
 * does not exist yet and the jump is silently dropped. The resolution is
 * therefore retried as the content settles, and only while the reader is still
 * at the top of the document - somebody who has already started reading must
 * never be pulled somewhere else.
 */

import { useEffect, useRef, useState, type RefObject } from 'react'

import {
  activeHeadingId,
  createDisposerBag,
  resolveHeadingDeepLink,
  scheduleFrame,
  type FrameScheduler,
  type HeadingOffset,
  type ReaderHeading,
} from '../../design-system'

const frameScheduler: FrameScheduler = {
  request: (callback) =>
    typeof window === 'undefined' ? 0 : window.requestAnimationFrame(callback),
  cancel: (handle) => {
    if (typeof window !== 'undefined') {
      window.cancelAnimationFrame(handle)
    }
  },
}

export interface ReaderHeadingsInput {
  /** The headings the table of contents lists, in document order. */
  readonly headings: readonly ReaderHeading[]
  /** The element the article body renders into. Watched for late content. */
  readonly contentRef: RefObject<HTMLElement>
  /** Scroll a resolved deep link into view. Off when motion is reduced. */
  readonly smoothDeepLink?: boolean
}

function headingOffsets(headings: readonly ReaderHeading[]): HeadingOffset[] {
  const offsets: HeadingOffset[] = []

  for (const heading of headings) {
    const element = document.getElementById(heading.id)

    if (element) {
      offsets.push({ id: heading.id, top: element.getBoundingClientRect().top })
    }
  }

  return offsets
}

export const useReaderHeadings = ({
  headings,
  contentRef,
  smoothDeepLink = false,
}: ReaderHeadingsInput) => {
  const [activeId, setActiveId] = useState<string | null>(null)
  const deepLinkSettled = useRef(false)

  useEffect(() => {
    deepLinkSettled.current = false
  }, [headings])

  useEffect(() => {
    if (typeof window === 'undefined' || headings.length === 0) {
      setActiveId(null)

      return
    }

    const bag = createDisposerBag()
    let frameQueued = false

    const resolveDeepLink = () => {
      if (deepLinkSettled.current) {
        return
      }

      const target = resolveHeadingDeepLink(window.location.hash, headings)

      if (!target) {
        deepLinkSettled.current = true

        return
      }

      const element = document.getElementById(target)

      if (!element) {
        return
      }

      deepLinkSettled.current = true
      setActiveId(target)

      // Only while the reader has not moved. A jump under somebody who is
      // already three paragraphs in is worse than a link that did not resolve.
      if (window.scrollY <= 0) {
        element.scrollIntoView({
          behavior: smoothDeepLink ? 'smooth' : 'auto',
          block: 'start',
        })
      }
    }

    const measure = () => {
      resolveDeepLink()

      const offsets = headingOffsets(headings)

      if (offsets.length === 0) {
        return
      }

      setActiveId(activeHeadingId(offsets, window.innerHeight))
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
    window.addEventListener('hashchange', schedule)
    bag.add(() => window.removeEventListener('hashchange', schedule))

    // The article grows as images decode and as the editor surface hydrates,
    // which is also when the headings a deep link needs first exist.
    const element = contentRef.current

    if (element && typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(schedule)
      observer.observe(element)
      bag.add(() => observer.disconnect())
    }

    measure()

    return () => bag.dispose()
  }, [contentRef, headings, smoothDeepLink])

  return activeId
}

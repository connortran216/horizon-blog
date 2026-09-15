/**
 * Horizon Design System v2 - the Series rail.
 *
 * A real scroll container. Everything the rail can do, the browser is already
 * doing: a finger scrolls it, a trackpad scrolls it, `Tab` scrolls it as focus
 * moves through the cards, and the scrollbar is real. Nothing here translates a
 * track, because the moment a rail becomes a transform it stops being any of
 * those things.
 *
 * On top of that the rail adds four things, and each one is arithmetic that
 * lives in `rail.logic.ts` or `drag.logic.ts` rather than in this file:
 *
 * - snap and a next-item peek, so a gesture lands on a card and there is always
 *   a visible reason to swipe;
 * - overlay arrows for a mouse, which disable at the ends instead of vanishing;
 * - drag-to-scroll for a mouse, with the click after a real drag swallowed so a
 *   throw does not open whatever card the pointer happened to land on;
 * - `ArrowLeft` / `ArrowRight` / `Home` / `End`.
 *
 * Position is announced but not printed. See `railRangeDisplay`.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react'
import { Box, VisuallyHidden, type BoxProps } from '@chakra-ui/react'

import { space } from '../../../theme/tokens'
import { Button } from '../../components/actions'
import { EmptyState, InlineLoading, RetryAction } from '../../components/feedback'
import { Text } from '../../components/typography'
import {
  createDisposerBag,
  scheduleFrame,
  useMotionPolicy,
  type FrameScheduler,
} from '../../motion'
import { RailOverlayControls } from './RailOverlayControls'
import { SeriesCard, type SeriesCardOptions } from './SeriesCard'
import {
  dragBegin,
  dragCancel,
  dragClickConsumed,
  dragEnd,
  dragMove,
  dragScrollTarget,
  idleDragState,
  shouldSuppressClick,
  type DragState,
} from './drag.logic'
import {
  defaultRailVisibleItems,
  railItemBasisResponsive,
  railKeyboardAction,
  railKeyboardTarget,
  railLoadStatus,
  railPosition,
  railRangeDisplay,
  railScrollBehavior,
  railScrollTarget,
  type RailMeasurements,
  type RailPosition,
  type RailVisibleItems,
} from './rail.logic'
import type { SeriesSummary } from './series.logic'

export interface SeriesRailProps extends Omit<BoxProps, 'children' | 'onScroll'> {
  items: readonly SeriesSummary[]
  /** Landmark name. Required: two rails on one page are otherwise identical. */
  label: string
  /** How many cards sit fully in view at each width. The rest is the peek. */
  visibleItems?: RailVisibleItems
  /**
   * What the cards on this shelf say - the card's own editorial options,
   * forwarded unchanged.
   *
   * It is one object rather than a prop per option because a rail that
   * enumerated every card prop would have to grow a prop each time the card
   * did, and it is `SeriesCardOptions` - a `Pick` from the card's own props -
   * rather than a free-form object or a render prop because the rail must not
   * be able to rename a card option, invent one, or be handed something that is
   * not a `SeriesCard` at all. The item box, the snap and the peek are the
   * rail's and are not reachable from here.
   *
   * The case this exists for: the public Series API carries no cover artwork,
   * so a shelf reading from it passes `{ showCover: false }` and the cards stop
   * drawing an absent-media plate they can never fill.
   */
  cardOptions?: SeriesCardOptions
  /** More pages exist behind a cursor. */
  hasMore?: boolean
  isLoadingMore?: boolean
  /** Why the last page failed. Shown at the end of the rail, with a retry. */
  loadMoreError?: string | null
  onLoadMore?: () => void
  /** Shown when the rail has no items at all. */
  emptyNextAction?: string
}

const emptyPosition: RailPosition = {
  activeIndex: 0,
  itemCount: 0,
  atStart: true,
  atEnd: true,
  canScrollPrevious: false,
  canScrollNext: false,
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

export function SeriesRail({
  items,
  label,
  visibleItems = defaultRailVisibleItems,
  cardOptions,
  hasMore = false,
  isLoadingMore = false,
  loadMoreError = null,
  onLoadMore,
  emptyNextAction = 'New Series appear here as they are published.',
  ...rest
}: SeriesRailProps) {
  const policy = useMotionPolicy()
  const railRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragState>(idleDragState)
  const [position, setPosition] = useState<RailPosition>(emptyPosition)

  const measurements = useCallback((): RailMeasurements | null => {
    const element = railRef.current

    if (!element) {
      return null
    }

    return {
      scrollLeft: element.scrollLeft,
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
      itemCount: items.length,
    }
  }, [items.length])

  const measure = useCallback(() => {
    const current = measurements()

    if (current) {
      setPosition(railPosition(current))
    }
  }, [measurements])

  useEffect(() => {
    const element = railRef.current

    if (!element) {
      return
    }

    // Every subscription goes into the bag, so unmount is one call and a frame
    // that was already queued never lands on a detached element.
    const bag = createDisposerBag()
    let frameQueued = false

    const onScroll = () => {
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

    element.addEventListener('scroll', onScroll, { passive: true })
    bag.add(() => element.removeEventListener('scroll', onScroll))

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(onScroll)
      observer.observe(element)
      bag.add(() => observer.disconnect())
    }

    measure()

    return () => bag.dispose()
  }, [measure])

  const scrollTo = useCallback(
    (left: number) => {
      const element = railRef.current

      if (!element) {
        return
      }

      element.scrollTo({ left, behavior: railScrollBehavior(policy) })
    },
    [policy],
  )

  const page = useCallback(
    (direction: 'previous' | 'next') => {
      const current = measurements()

      if (current) {
        scrollTo(railScrollTarget(direction, current))
      }
    },
    [measurements, scrollTo],
  )

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const action = railKeyboardAction(event.key, event)

    if (!action) {
      return
    }

    const current = measurements()

    if (!current) {
      return
    }

    event.preventDefault()
    scrollTo(railKeyboardTarget(action, current))
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    // Mouse only. A finger already scrolls this natively, and a second
    // mechanism on top of that is what makes touch rails unable to open a card.
    if (event.pointerType !== 'mouse' || event.button !== 0) {
      return
    }

    const element = railRef.current

    if (!element) {
      return
    }

    dragRef.current = dragBegin({
      x: event.clientX,
      y: event.clientY,
      scrollLeft: element.scrollLeft,
    })
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const state = dragRef.current

    if (!state.isPressed) {
      return
    }

    const next = dragMove(state, { x: event.clientX, y: event.clientY })
    dragRef.current = next

    if (next.isDragging && railRef.current) {
      railRef.current.scrollLeft = dragScrollTarget(next, { x: event.clientX, y: event.clientY })
    }
  }

  const endDrag = () => {
    dragRef.current = dragEnd(dragRef.current)
  }

  const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!shouldSuppressClick(dragRef.current)) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    dragRef.current = dragClickConsumed(dragRef.current)
  }

  const range = railRangeDisplay(position.activeIndex, items.length, true, 'Series')
  const loadStatus = railLoadStatus({
    isLoading: isLoadingMore,
    error: loadMoreError,
    hasMore,
  })

  if (items.length === 0 && !isLoadingMore) {
    return <EmptyState subject="Series" nextAction={emptyNextAction} />
  }

  return (
    <Box position="relative" {...rest}>
      <Box
        ref={railRef}
        role="group"
        aria-label={label}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerLeave={() => {
          dragRef.current = dragRef.current.isDragging ? dragEnd(dragRef.current) : dragCancel()
        }}
        onPointerCancel={() => {
          dragRef.current = dragCancel()
        }}
        onClickCapture={handleClickCapture}
        display="flex"
        gap={space[6]}
        overflowX="auto"
        overflowY="hidden"
        /* Padding so a lifted card's shadow is not clipped by the scroll box. */
        paddingBlock={space[2]}
        sx={{
          scrollSnapType: 'x mandatory',
          // The scrollbar stays: it is the clearest signal that this row moves,
          // and hiding it is how a rail becomes invisible to a trackpad user.
          overscrollBehaviorX: 'contain',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {items.map((series) => (
          <Box
            key={series.id}
            flexBasis={railItemBasisResponsive(visibleItems)}
            minW={0}
            flexShrink={0}
            sx={{ scrollSnapAlign: 'start' }}
          >
            <SeriesCard series={series} {...cardOptions} />
          </Box>
        ))}

        {loadStatus !== 'complete' ? (
          <Box
            flexBasis={railItemBasisResponsive(visibleItems)}
            minW={0}
            flexShrink={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{ scrollSnapAlign: 'start' }}
          >
            {loadStatus === 'loading' ? <InlineLoading task="more Series" /> : null}
            {loadStatus === 'error' ? (
              <RetryAction
                failedAction="load more Series"
                onRetry={() => onLoadMore?.()}
                retrying={isLoadingMore}
              />
            ) : null}
            {loadStatus === 'idle' && onLoadMore ? (
              <Button tone="secondary" onClick={onLoadMore}>
                Load more Series
              </Button>
            ) : null}
          </Box>
        ) : null}
      </Box>

      <RailOverlayControls
        onPrevious={() => page('previous')}
        onNext={() => page('next')}
        canScrollPrevious={position.canScrollPrevious}
        canScrollNext={position.canScrollNext}
        itemLabel="Series"
      />

      {/*
       * The position, for anyone who cannot see the arrows or the movement.
       * `railRangeDisplay` decides that it is not painted; it never decides that
       * it is not announced. `showVisibleRange` is false here because this rail
       * always draws its controls - it is read rather than assumed so that a
       * future rail without arrows gets the visible text back automatically.
       */}
      {range.showVisibleRange ? (
        <Text as="p" recipe="metadata" textAlign="center">
          {range.screenReaderText}
        </Text>
      ) : null}
      <VisuallyHidden aria-live="polite">{range.screenReaderText}</VisuallyHidden>
    </Box>
  )
}

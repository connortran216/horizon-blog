import { Children, ReactNode, useEffect, useRef, useState } from 'react'
import { Button } from '@chakra-ui/react'
import { useReducedMotion } from 'framer-motion'

interface Props {
  children: ReactNode
  total: number
  hasMore: boolean
  loading: boolean
  error: string | null
  onMore: () => void
  onRetry: () => void
}
export default function SeriesCarousel({
  children,
  hasMore,
  loading,
  error,
  onMore,
  onRetry,
}: Props) {
  const rail = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const [position, setPosition] = useState({ start: 0, end: 2, atEnd: false, overflow: false })
  const drag = useRef({ start: 0, scroll: 0, active: false, moved: false })
  const count = Children.count(children)
  const measure = () => {
    const el = rail.current
    if (!el || !el.children.length) return
    const cards = Array.from(el.children) as HTMLElement[]
    const left = el.getBoundingClientRect().left
    const visible = cards
      .map((card, index) => ({ index, rect: card.getBoundingClientRect() }))
      .filter(({ rect }) => rect.right > left + 10 && rect.left < left + el.clientWidth - 10)
    const start = visible[0]?.index ?? 0
    const full = window.matchMedia('(max-width: 680px)').matches ? 1 : 2
    setPosition({
      start,
      end: Math.min(start + full, count),
      atEnd: el.scrollLeft >= el.scrollWidth - el.clientWidth - 4,
      overflow: el.scrollWidth > el.clientWidth + 4,
    })
  }
  useEffect(() => {
    measure()
    const observer = new ResizeObserver(measure)
    if (rail.current) observer.observe(rail.current)
    return () => observer.disconnect()
  }, [count])
  useEffect(() => {
    if (position.end >= count - 1 && hasMore && !loading && !error) onMore()
  }, [position.end, count, hasMore, loading, error, onMore])
  const move = (direction: number) => {
    const el = rail.current
    if (!el) return
    const cards = Array.from(el.children) as HTMLElement[]
    const step = window.matchMedia('(max-width: 680px)').matches ? 1 : 2
    const next = Math.max(0, Math.min(count - 1, position.start + direction * step))
    el.scrollTo({
      left: cards[next].offsetLeft - cards[0].offsetLeft,
      behavior: reduced ? 'auto' : 'smooth',
    })
  }
  return (
    <div className="signal-carousel">
      <div
        ref={rail}
        className="signal-series-rail"
        role="group"
        aria-label="Series, kéo ngang để khám phá"
        onScroll={measure}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return
          if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            e.preventDefault()
            move(e.key === 'ArrowRight' ? 1 : -1)
          }
        }}
        tabIndex={0}
        onPointerDown={(e) => {
          if (e.pointerType !== 'mouse' || e.button !== 0) return
          drag.current = {
            start: e.clientX,
            scroll: e.currentTarget.scrollLeft,
            active: true,
            moved: false,
          }
        }}
        onPointerMove={(e) => {
          const d = drag.current
          if (!d.active) return
          const delta = e.clientX - d.start
          if (Math.abs(delta) > 6) {
            d.moved = true
            e.currentTarget.setPointerCapture(e.pointerId)
            e.currentTarget.classList.add('is-dragging')
            e.currentTarget.scrollLeft = d.scroll - delta
          }
        }}
        onPointerUp={(e) => {
          drag.current.active = false
          e.currentTarget.classList.remove('is-dragging')
          if (e.currentTarget.hasPointerCapture(e.pointerId))
            e.currentTarget.releasePointerCapture(e.pointerId)
        }}
        onPointerCancel={(e) => {
          drag.current.active = false
          e.currentTarget.classList.remove('is-dragging')
        }}
        onPointerLeave={() => {
          if (!drag.current.moved) drag.current.active = false
        }}
        onDragStart={(e) => e.preventDefault()}
        onClickCapture={(e) => {
          if (drag.current.moved) {
            e.preventDefault()
            e.stopPropagation()
            drag.current.moved = false
          }
        }}
      >
        {children}
      </div>
      {(position.overflow || hasMore || error) && (
        <div className="signal-carousel-controls">
          <div>
            <Button
              className="signal-carousel-arrow signal-carousel-prev"
              variant="unstyled"
              aria-label="Series trước"
              onClick={() => move(-1)}
              isDisabled={position.start === 0}
            >
              ‹
            </Button>
            <Button
              className="signal-carousel-arrow signal-carousel-next"
              variant="unstyled"
              aria-label="Series tiếp theo"
              onClick={() => (position.atEnd && hasMore ? onMore() : move(1))}
              isDisabled={position.atEnd && (!hasMore || loading || !!error)}
            >
              ›
            </Button>
          </div>
        </div>
      )}
      {loading && <p role="status">Đang tải thêm Series…</p>}
      {error && (
        <div role="alert">
          Chưa tải được Series tiếp theo. <Button onClick={onRetry}>Thử lại</Button>
        </div>
      )}
    </div>
  )
}

import { describe, expect, it } from 'vitest'

import {
  DRAG_THRESHOLD_PX,
  dragBegin,
  dragCancel,
  dragClickConsumed,
  dragEnd,
  dragMove,
  dragScrollTarget,
  idleDragState,
  shouldSuppressClick,
} from './drag.logic'

const press = (x = 100) => dragBegin({ x, y: 40, scrollLeft: 200 })

describe('a press that is a click', () => {
  it('does not become a drag below the threshold', () => {
    const state = dragMove(press(), { x: 100 + DRAG_THRESHOLD_PX - 1, y: 40 })

    expect(state.isDragging).toBe(false)
  })

  it('lets the click through, so a card still opens', () => {
    const state = dragEnd(dragMove(press(), { x: 102, y: 40 }))

    expect(shouldSuppressClick(state)).toBe(false)
  })

  it('lets a completely still press through', () => {
    expect(shouldSuppressClick(dragEnd(press()))).toBe(false)
  })
})

describe('a press that is a drag', () => {
  it('becomes a drag at the threshold', () => {
    expect(dragMove(press(), { x: 100 + DRAG_THRESHOLD_PX, y: 40 }).isDragging).toBe(true)
  })

  it('swallows the click that follows, so a throw does not navigate', () => {
    const state = dragEnd(dragMove(press(), { x: 160, y: 40 }))

    expect(shouldSuppressClick(state)).toBe(true)
  })

  it('swallows exactly one click', () => {
    const armed = dragEnd(dragMove(press(), { x: 160, y: 40 }))
    const afterClick = dragClickConsumed(armed)

    expect(shouldSuppressClick(afterClick)).toBe(false)
  })

  it('stays a drag once it has passed the threshold, even if it comes back', () => {
    const dragged = dragMove(press(), { x: 160, y: 40 })
    const returned = dragMove(dragged, { x: 100, y: 40 })

    expect(returned.isDragging).toBe(true)
  })

  it('measures horizontally, so a vertical page scroll is not a rail drag', () => {
    const state = dragMove(press(), { x: 101, y: 400 })

    expect(state.isDragging).toBe(false)
  })

  it('counts movement in either direction', () => {
    expect(dragMove(press(), { x: 100 - DRAG_THRESHOLD_PX, y: 40 }).isDragging).toBe(true)
  })
})

describe('the rail position while dragging', () => {
  it('follows the pointer, inverted, from where the press began', () => {
    const state = dragMove(press(), { x: 60, y: 40 })

    expect(dragScrollTarget(state, { x: 60, y: 40 })).toBe(240)
  })

  it('never scrolls past the start of the rail', () => {
    const state = dragMove(press(), { x: 500, y: 40 })

    expect(dragScrollTarget(state, { x: 500, y: 40 })).toBe(0)
  })

  it('reports the original offset when no press is in progress', () => {
    expect(dragScrollTarget(idleDragState, { x: 10, y: 10 })).toBe(0)
  })
})

describe('a press that never finishes', () => {
  it('leaves no suppression armed when it is cancelled', () => {
    const dragged = dragMove(press(), { x: 200, y: 40 })

    expect(shouldSuppressClick(dragCancel())).toBe(false)
    expect(dragged.isDragging).toBe(true)
  })

  it('clears a stale suppression when the next press begins', () => {
    const armed = dragEnd(dragMove(press(), { x: 200, y: 40 }))

    expect(shouldSuppressClick(armed)).toBe(true)
    expect(shouldSuppressClick(dragBegin({ x: 10, y: 10 }))).toBe(false)
  })

  it('ignores movement that arrives without a press', () => {
    expect(dragMove(idleDragState, { x: 900, y: 40 })).toBe(idleDragState)
  })
})

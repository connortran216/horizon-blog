/**
 * `uix.2`. The shelf used to ask the API for two Series.
 *
 * `SeriesShelf` hands its items to `SeriesRail`, which shows up to three at a
 * time and adds arrows, snap and a next-item peek on top. Two items in three
 * slots leaves every one of those doing nothing, and the owner publishes ten.
 *
 * The assertion is against the rail's own default rather than against the
 * number three, so widening the rail cannot silently make the shelf short
 * again.
 */

import { describe, expect, it } from 'vitest'

import { railIsScrollable, railWidestVisibleItems } from '../../../design-system'
import { SHELF_LIMIT, SKELETON_COUNT } from './SeriesShelf'

describe('the Series shelf request', () => {
  it('asks for more Series than the rail can show at once', () => {
    expect(SHELF_LIMIT).toBeGreaterThan(railWidestVisibleItems())
    expect(railIsScrollable(SHELF_LIMIT)).toBe(true)
  })

  it('would not have been scrollable at the old limit of two', () => {
    expect(railIsScrollable(2)).toBe(false)
    expect(railIsScrollable(railWidestVisibleItems())).toBe(false)
  })

  it('reserves the rail’s widest row while it loads, not the whole request', () => {
    expect(SKELETON_COUNT).toBe(railWidestVisibleItems())
    expect(SKELETON_COUNT).toBeLessThan(SHELF_LIMIT)
  })

  it('stays inside one page of the public Series endpoint', () => {
    // `/series?page=1&limit=12` is one request and serves the whole shelf; the
    // "View all series" link beside the heading is the route past it.
    expect(SHELF_LIMIT).toBeLessThanOrEqual(50)
  })
})

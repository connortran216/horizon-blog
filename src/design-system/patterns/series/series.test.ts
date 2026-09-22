import { describe, expect, it } from 'vitest'

import { componentTokens, radii } from '../../../theme/tokens'
import {
  connectorColor,
  manageItemControls,
  moveItem,
  orderIsDirty,
  partConnector,
  partLabel,
  partOrdinal,
  removeItemAt,
  seriesContextLabel,
  seriesFacts,
  seriesIdentityLabel,
  seriesIsDistinctFromPostCard,
  seriesNavTargets,
  seriesPresentation,
  seriesSpineSegments,
  seriesTotalMinutes,
  type SeriesReadingContext,
  type SeriesSummary,
} from './series.logic'

const series: SeriesSummary = {
  id: 'sample',
  slug: 'sample',
  href: '/series/sample',
  title: 'A sample Series',
  author: { name: 'Sample Author' },
  partCount: 4,
  updatedAt: '2026-09-02T09:00:00.000Z',
}

describe('book identity', () => {
  it('draws the Series plate on a different radius from a post card', () => {
    expect(seriesIsDistinctFromPostCard()).toBe(true)
    expect(seriesPresentation().coverRadius).toBe(radii.feature)
    expect(componentTokens.card.radius).toBe(radii.card)
  })

  it('reads every value from the Series token family, never a literal', () => {
    const presentation = seriesPresentation()

    expect(presentation.cardRadius).toBe(componentTokens.series.radius)
    expect(presentation.connector).toBe(componentTokens.series.connector)
    expect(presentation.connectorActive).toBe(componentTokens.series.connectorActive)
  })

  it('names the object before the title, with the count that distinguishes it', () => {
    expect(seriesIdentityLabel(4)).toBe('Series · 4 blogs')
    expect(seriesIdentityLabel(1)).toBe('Series · 1 blog')
    expect(seriesIdentityLabel(0)).toBe('Series · 0 blogs')
  })
})

describe('book-spine trace', () => {
  it('connects every segment up to the active part and stops there', () => {
    expect([0, 1, 2, 3].map((index) => seriesSpineSegments(index, 4, 2))).toEqual([
      { above: false, below: true },
      { above: true, below: true },
      { above: true, below: false },
      { above: false, below: false },
    ])
  })

  it('draws no active trace for an absent or invalid target', () => {
    expect(seriesSpineSegments(1, 4, null)).toEqual({ above: false, below: false })
    expect(seriesSpineSegments(1, 4, 9)).toEqual({ above: false, below: false })
  })
})

describe('seriesFacts', () => {
  it('lists the count, the duration, the author and the update date', () => {
    expect(seriesFacts(series, 58).map((fact) => fact.kind)).toEqual([
      'parts',
      'duration',
      'author',
      'updated',
    ])
  })

  it('drops a duration nobody can estimate rather than claiming zero minutes', () => {
    expect(seriesFacts(series, 0).map((fact) => fact.kind)).not.toContain('duration')
    expect(seriesFacts(series, null).map((fact) => fact.kind)).not.toContain('duration')
  })

  it('drops the update date when there is not a real one', () => {
    expect(seriesFacts({ ...series, updatedAt: null }).map((fact) => fact.kind)).not.toContain(
      'updated',
    )
  })

  it('drops a blank author name', () => {
    expect(
      seriesFacts({ ...series, author: { name: '   ' } }).map((fact) => fact.kind),
    ).not.toContain('author')
  })

  it('rounds the total reading time up to a whole minute', () => {
    expect(seriesFacts(series, 57.2).find((fact) => fact.kind === 'duration')?.label).toBe(
      '58 min total',
    )
  })
})

describe('seriesTotalMinutes', () => {
  it('adds the parts up', () => {
    expect(
      seriesTotalMinutes([
        { id: '1', href: '/a', title: 'a', position: 1, readingMinutes: 4 },
        { id: '2', href: '/b', title: 'b', position: 2, readingMinutes: 6 },
      ]),
    ).toBe(10)
  })

  it('is null when no part has an estimate', () => {
    expect(
      seriesTotalMinutes([{ id: '1', href: '/a', title: 'a', position: 1, readingMinutes: null }]),
    ).toBeNull()
    expect(seriesTotalMinutes([])).toBeNull()
  })
})

describe('ordered parts', () => {
  it('pads the ordinal so the left edge of the list stays straight', () => {
    expect(partOrdinal(1)).toBe('01')
    expect(partOrdinal(12)).toBe('12')
  })

  it('uses the design contract wording', () => {
    expect(partLabel(3, 8)).toBe('Part 3 of 8')
  })

  it('gives the run a visible beginning and end', () => {
    expect(partConnector(0, 3).above).toBe(false)
    expect(partConnector(0, 3).below).toBe(true)
    expect(partConnector(2, 3).above).toBe(true)
    expect(partConnector(2, 3).below).toBe(false)
  })

  it('draws a single part with no connectors at all', () => {
    expect(partConnector(0, 1)).toMatchObject({ above: false, below: false })
  })

  it('marks everything before the reader as travelled', () => {
    expect(partConnector(0, 4, 2).state).toBe('previous')
    expect(partConnector(2, 4, 2).state).toBe('current')
    expect(partConnector(3, 4, 2).state).toBe('upcoming')
  })

  it('leaves every part upcoming when the reader is not inside the Series', () => {
    expect([0, 1, 2].map((index) => partConnector(index, 3).state)).toEqual([
      'upcoming',
      'upcoming',
      'upcoming',
    ])
  })

  it('colours the travelled connectors from the active Series role', () => {
    expect(connectorColor(partConnector(0, 4, 2))).toBe(componentTokens.series.connectorActive)
    expect(connectorColor(partConnector(3, 4, 2))).toBe(componentTokens.series.connector)
  })
})

describe('reading context', () => {
  const context: SeriesReadingContext = {
    slug: 'sample',
    href: '/series/sample',
    title: 'A sample Series',
    position: 3,
    total: 8,
    previous: { href: '/blog/2', title: 'Sample part 2' },
    next: { href: '/blog/4', title: 'Sample part 4' },
  }

  it('says where the reader is', () => {
    expect(seriesContextLabel(context)).toBe('Part 3 of 8')
  })

  it('names the destination in every navigation label', () => {
    expect(seriesNavTargets(context).map((target) => target.ariaLabel)).toEqual([
      'Previous part: Sample part 2',
      'Next part: Sample part 4',
    ])
  })

  it('offers only the moves that exist at the ends of a Series', () => {
    expect(seriesNavTargets({ ...context, previous: null }).map((t) => t.direction)).toEqual([
      'next',
    ])
    expect(seriesNavTargets({ ...context, next: null }).map((t) => t.direction)).toEqual([
      'previous',
    ])
    expect(seriesNavTargets({ ...context, previous: null, next: null })).toEqual([])
  })
})

describe('managing a Series', () => {
  const titles = ['first', 'second', 'third']

  it('names the blog each control acts on', () => {
    const controls = manageItemControls(1, 3, 'Sample part 2')

    expect(controls.moveUpLabel).toBe('Move Sample part 2 earlier in the Series')
    expect(controls.moveDownLabel).toBe('Move Sample part 2 later in the Series')
    expect(controls.removeLabel).toBe('Remove Sample part 2 from the Series')
  })

  it('disables the move that would leave the list', () => {
    expect(manageItemControls(0, 3, 'x').canMoveUp).toBe(false)
    expect(manageItemControls(2, 3, 'x').canMoveDown).toBe(false)
    expect(manageItemControls(1, 3, 'x')).toMatchObject({ canMoveUp: true, canMoveDown: true })
  })

  it('numbers the manager rows the way the reader-facing list does', () => {
    expect(manageItemControls(0, 3, 'x').ordinal).toBe('01')
  })

  it('swaps two neighbours without disturbing the rest', () => {
    expect(moveItem(titles, 1, 'up')).toEqual(['second', 'first', 'third'])
    expect(moveItem(titles, 1, 'down')).toEqual(['first', 'third', 'second'])
  })

  it('returns the same array when a move would leave the list', () => {
    expect(moveItem(titles, 0, 'up')).toBe(titles)
    expect(moveItem(titles, 2, 'down')).toBe(titles)
    expect(moveItem(titles, -1, 'down')).toBe(titles)
  })

  it('removes one row and leaves the order alone', () => {
    expect(removeItemAt(titles, 1)).toEqual(['first', 'third'])
    expect(removeItemAt(titles, 9)).toBe(titles)
  })

  it('knows when an unsaved reorder is on screen', () => {
    expect(orderIsDirty(titles, titles)).toBe(false)
    expect(orderIsDirty(titles, ['second', 'first', 'third'])).toBe(true)
    expect(orderIsDirty(titles, ['first', 'second'])).toBe(true)
  })
})

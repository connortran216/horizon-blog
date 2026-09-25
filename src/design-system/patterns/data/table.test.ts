import { describe, expect, it } from 'vitest'

import { componentTokens } from '../../../theme/tokens'
import {
  rowOverflow,
  sortHeader,
  tableAdaptation,
  tableCellStyle,
  tableScrollStyle,
} from './table.logic'

/** `horizon-blog-dsv2.6.3` acceptance 2: tables scroll within their container. */
describe('table overflow', () => {
  it('puts the horizontal scroll on the table wrapper', () => {
    expect(tableScrollStyle().overflowX).toBe('auto')
  })

  it('caps the wrapper at its parent, which is what keeps the document still', () => {
    // Without this the wrapper grows to the table and the whole page scrolls
    // sideways on a phone - header, prose and all.
    expect(tableScrollStyle().maxWidth).toBe('100%')
  })

  it('keeps native momentum scrolling on touch', () => {
    expect(tableScrollStyle().WebkitOverflowScrolling).toBe('touch')
  })

  it('borrows its border from the workspace tokens', () => {
    expect(tableScrollStyle().borderColor).toBe(componentTokens.workspace.tableBorder)
  })
})

describe('mobile adaptation', () => {
  it('lets a narrow table scroll rather than restructuring it', () => {
    const adaptation = tableAdaptation({ columnCount: 2 })

    expect(adaptation.mobile).toBe('scroll')
    expect(adaptation.needsExplicitRoles).toBe(false)
    expect(adaptation.needsCellLabels).toBe(false)
  })

  it('stacks a wide table into rows on a phone', () => {
    const adaptation = tableAdaptation({ columnCount: 7 })

    expect(adaptation.mobile).toBe('stacked')
  })

  it('restores the table roles that display:block destroys', () => {
    expect(tableAdaptation({ columnCount: 7 }).needsExplicitRoles).toBe(true)
  })

  it('attaches a column name to every cell in the stacked layout', () => {
    // Neither branch drops a column - the stacked one carries the header with
    // each value instead of leaving a grid of unlabelled numbers.
    expect(tableAdaptation({ columnCount: 7 }).needsCellLabels).toBe(true)
  })

  it('treats the threshold itself as still scrollable', () => {
    expect(tableAdaptation({ columnCount: 3, stackThreshold: 3 }).mobile).toBe('scroll')
    expect(tableAdaptation({ columnCount: 4, stackThreshold: 3 }).mobile).toBe('stacked')
  })

  it('takes a threshold from the caller', () => {
    expect(tableAdaptation({ columnCount: 5, stackThreshold: 6 }).mobile).toBe('scroll')
  })
})

describe('sortable headers', () => {
  it('marks only the sorted column with aria-sort', () => {
    expect(
      sortHeader({ columnLabel: 'Views', columnKey: 'views', activeKey: 'hearts' })['aria-sort'],
    ).toBeUndefined()

    expect(
      sortHeader({ columnLabel: 'Views', columnKey: 'views', activeKey: 'views', order: 'desc' })[
        'aria-sort'
      ],
    ).toBe('descending')
  })

  it('starts a new column descending, because every metric is a "who is biggest" question', () => {
    expect(sortHeader({ columnLabel: 'Views', columnKey: 'views' }).nextOrder).toBe('desc')
  })

  it('flips the active column', () => {
    expect(
      sortHeader({ columnLabel: 'Views', columnKey: 'views', activeKey: 'views', order: 'desc' })
        .nextOrder,
    ).toBe('asc')
  })

  it('names the current order and what a press will do', () => {
    const active = sortHeader({
      columnLabel: 'Views',
      columnKey: 'views',
      activeKey: 'views',
      order: 'asc',
    })

    expect(active.label).toContain('sorted lowest first')
    expect(active.label).toContain('Reverse the order')
  })

  it('says what an inactive column would do', () => {
    expect(sortHeader({ columnLabel: 'Hearts', columnKey: 'hearts' }).label).toBe(
      'Sort by Hearts, highest first',
    )
  })

  it('draws an indicator on the sorted column, so it is not weight alone', () => {
    expect(
      sortHeader({ columnLabel: 'Views', columnKey: 'views', activeKey: 'views' }).showsIndicator,
    ).toBe(true)
    expect(sortHeader({ columnLabel: 'Views', columnKey: 'views' }).showsIndicator).toBe(false)
  })
})

describe('row overflow', () => {
  it('says nothing when everything is on screen', () => {
    const overflow = rowOverflow({ shown: 12, total: 12 })

    expect(overflow.isTruncated).toBe(false)
    expect(overflow.summary).toBeNull()
    expect(overflow.offersMore).toBe(false)
  })

  it('states how much is missing', () => {
    const overflow = rowOverflow({ shown: 20, total: 128 })

    expect(overflow.isTruncated).toBe(true)
    expect(overflow.summary).toBe('Showing 20 of 128 rows')
    expect(overflow.offersMore).toBe(true)
  })

  it('does not claim truncation when the caller over-counts', () => {
    expect(rowOverflow({ shown: 20, total: 12 }).isTruncated).toBe(false)
  })
})

describe('cells', () => {
  it('end-aligns numbers so a column can be compared by eye', () => {
    expect(tableCellStyle(true).textAlign).toBe('end')
    expect(tableCellStyle(false).textAlign).toBe('start')
  })

  it('gives numbers a fixed digit width and leaves text proportional', () => {
    expect(tableCellStyle(true).fontVariantNumeric).toBe('tabular-nums')
    expect(tableCellStyle(false).fontVariantNumeric).toBe('normal')
  })

  it('takes its rule colour from the workspace tokens', () => {
    expect(tableCellStyle(false).borderColor).toBe(componentTokens.workspace.tableBorder)
  })
})

describe('an unframed table', () => {
  it('drops the box but keeps the overflow contract', () => {
    const style = tableScrollStyle(false)

    expect(style.borderWidth).toBe('0')
    expect(style.borderRadius).toBe('0')
    expect(style.overflowX).toBe('auto')
    expect(style.maxWidth).toBe('100%')
  })
})

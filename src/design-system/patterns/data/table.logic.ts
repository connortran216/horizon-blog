/**
 * Horizon Design System v2 - table decisions.
 *
 * `horizon-blog-dsv2.6.3` acceptance 2: tables scroll within their container.
 *
 * The failure this prevents is a real one on this site: an analytics table with
 * seven numeric columns is about 900px wide, and on a 375px phone a table that
 * is allowed to size the document turns the whole page into a horizontal
 * scroller - header, prose and all. `tableScrollStyle` puts the overflow on the
 * table's own wrapper and caps that wrapper at the width of its parent, so the
 * sideways movement is the table's and the document never moves.
 *
 * The second decision is what a wide table becomes on a phone. Scrolling a
 * seven-column table on a 375px screen is technically usable and practically
 * horrible, so past a threshold the same rows are stacked into cards. Both
 * branches show every column; neither hides data to fit.
 */

import { componentTokens, radii, space } from '../../../theme/tokens'

/* -------------------------------------------------------------------------- */
/* Overflow                                                                   */
/* -------------------------------------------------------------------------- */

export interface TableScrollStyle {
  readonly overflowX: 'auto'
  /** Never wider than the parent. This is what keeps the document still. */
  readonly maxWidth: '100%'
  /** Momentum scrolling stays native on touch. */
  readonly WebkitOverflowScrolling: 'touch'
  readonly borderRadius: string
  readonly borderWidth: string
  readonly borderColor: string
}

export function tableScrollStyle(): TableScrollStyle {
  return {
    overflowX: 'auto',
    maxWidth: '100%',
    WebkitOverflowScrolling: 'touch',
    borderRadius: radii.card,
    borderWidth: '1px',
    borderColor: componentTokens.workspace.tableBorder,
  }
}

/* -------------------------------------------------------------------------- */
/* Mobile adaptation                                                          */
/* -------------------------------------------------------------------------- */

export type MobileTableLayout = 'scroll' | 'stacked'

export interface TableAdaptationInput {
  readonly columnCount: number
  /**
   * At or below this many columns a table still fits a 375px screen, so
   * scrolling is unnecessary and stacking would be noise. Three is two data
   * columns plus a label, which is about 340px at the metadata ramp.
   */
  readonly stackThreshold?: number
}

export interface TableAdaptation {
  readonly mobile: MobileTableLayout
  /**
   * True when the stacked layout needs explicit ARIA roles. Changing a table's
   * `display` drops its implicit table semantics in most engines, so the roles
   * have to be restored by hand.
   */
  readonly needsExplicitRoles: boolean
  /** Whether each cell carries its column name for the stacked view. */
  readonly needsCellLabels: boolean
}

/**
 * What a table does on a narrow screen.
 *
 * The threshold, not a media query, is the decision: a two-column table of link
 * clicks does not need to become a stack of cards, and a seven-column blog
 * comparison does. Neither branch drops a column - `stacked` shows every cell
 * with its column name attached, and `scroll` shows the whole table inside its
 * own scroller.
 */
export function tableAdaptation({
  columnCount,
  stackThreshold = 3,
}: TableAdaptationInput): TableAdaptation {
  const stacks = columnCount > stackThreshold

  return {
    mobile: stacks ? 'stacked' : 'scroll',
    needsExplicitRoles: stacks,
    needsCellLabels: stacks,
  }
}

/* -------------------------------------------------------------------------- */
/* Sorting                                                                    */
/* -------------------------------------------------------------------------- */

export type SortOrder = 'asc' | 'desc'

export interface SortHeaderInput {
  readonly columnLabel: string
  readonly columnKey: string
  readonly activeKey?: string
  readonly order?: SortOrder
}

export interface SortHeaderOutput {
  readonly isActive: boolean
  /** The `aria-sort` value for the `th`. Only the sorted column gets one. */
  readonly 'aria-sort': 'ascending' | 'descending' | undefined
  /**
   * The button's accessible name. It says both the current state and what
   * pressing it will do, because "Views" alone tells a screen-reader user
   * nothing about why the order changed.
   */
  readonly label: string
  /** Which order a press produces. */
  readonly nextOrder: SortOrder
  /** Whether an arrow is drawn, so the sort is not carried by weight alone. */
  readonly showsIndicator: boolean
}

/**
 * A sortable column header.
 *
 * Pressing the active column flips it; pressing an inactive one starts
 * descending, because every metric on this dashboard is a "who is biggest"
 * question and ascending would put the zeroes first.
 */
export function sortHeader({
  columnLabel,
  columnKey,
  activeKey,
  order = 'desc',
}: SortHeaderInput): SortHeaderOutput {
  const isActive = activeKey === columnKey
  const nextOrder: SortOrder = isActive ? (order === 'asc' ? 'desc' : 'asc') : 'desc'

  if (!isActive) {
    return {
      isActive: false,
      'aria-sort': undefined,
      label: `Sort by ${columnLabel}, highest first`,
      nextOrder,
      showsIndicator: false,
    }
  }

  return {
    isActive: true,
    'aria-sort': order === 'asc' ? 'ascending' : 'descending',
    label: `${columnLabel}, sorted ${order === 'asc' ? 'lowest' : 'highest'} first. Reverse the order.`,
    nextOrder,
    showsIndicator: true,
  }
}

/* -------------------------------------------------------------------------- */
/* Overflow of rows                                                           */
/* -------------------------------------------------------------------------- */

export interface RowOverflowInput {
  readonly shown: number
  readonly total: number
}

export interface RowOverflowOutput {
  readonly isTruncated: boolean
  /** "Showing 20 of 128 rows", or `null` when everything is on screen. */
  readonly summary: string | null
  /** Whether a "show more" control is worth offering. */
  readonly offersMore: boolean
}

/**
 * Whether the reader is looking at all of it.
 *
 * A table that quietly shows the first twenty of a hundred and twenty rows is
 * the most common way a dashboard misleads: the author concludes their oldest
 * posts get no traffic, when in fact they were never on the page.
 */
export function rowOverflow({ shown, total }: RowOverflowInput): RowOverflowOutput {
  if (shown >= total) {
    return { isTruncated: false, summary: null, offersMore: false }
  }

  return {
    isTruncated: true,
    summary: `Showing ${shown} of ${total} rows`,
    offersMore: true,
  }
}

/* -------------------------------------------------------------------------- */
/* Cell styling                                                               */
/* -------------------------------------------------------------------------- */

export interface TableCellStyle {
  readonly paddingInline: string
  readonly paddingBlock: string
  readonly borderBottomWidth: string
  readonly borderColor: string
  readonly textAlign: 'start' | 'end'
  /** Numbers line up when they share a width per digit. */
  readonly fontVariantNumeric: 'tabular-nums' | 'normal'
}

/**
 * A cell.
 *
 * Numeric columns are end-aligned and tabular, so a column of view counts lines
 * up on the units digit and can be compared by eye. Text columns are
 * start-aligned and proportional, because tabular figures inside a title look
 * like a typo.
 */
export function tableCellStyle(isNumeric: boolean): TableCellStyle {
  return {
    paddingInline: space[3],
    paddingBlock: space[3],
    borderBottomWidth: '1px',
    borderColor: componentTokens.workspace.tableBorder,
    textAlign: isNumeric ? 'end' : 'start',
    fontVariantNumeric: isNumeric ? 'tabular-nums' : 'normal',
  }
}

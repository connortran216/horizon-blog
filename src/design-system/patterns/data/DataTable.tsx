/**
 * Horizon Design System v2 - the data table.
 *
 * A sortable, scrollable table that adapts on a phone. It replaces the legacy
 * `BlogMetricsTable`, `LinkPerformanceTable` and the table in the access
 * management page.
 *
 * `horizon-blog-dsv2.6.3` acceptance 2 - tables scroll within their container -
 * is `tableScrollStyle` on the wrapper: `overflow-x: auto` with
 * `max-width: 100%`, so the sideways movement belongs to the table and the
 * document never widens. Nothing in this component may set a `min-width` on the
 * wrapper, which is the one change that would break it.
 *
 * The mobile adaptation is `tableAdaptation`. Up to three columns a table fits
 * a 375px screen and scrolls if it must; past that, the same rows become
 * stacked cards, one card per row, every column present with its name attached.
 * Changing a table's `display` drops its implicit semantics in most engines, so
 * the stacked layout restores `role="table"`, `role="row"` and `role="cell"` by
 * hand rather than shipping a grid of unlabelled text.
 */

import type { ReactNode } from 'react'
import { Box, Flex, VisuallyHidden } from '@chakra-ui/react'
import { FiArrowDown, FiArrowUp } from 'react-icons/fi'

import { componentTokens, space } from '../../../theme/tokens'
import { Stack } from '../../components/layout'
import { Heading, Text } from '../../components/typography'
import { EmptyState, PanelLoading, PermissionState, ErrorState } from '../../components/feedback'
import {
  rowOverflow,
  sortHeader,
  tableAdaptation,
  tableCellStyle,
  tableScrollStyle,
  type SortOrder,
} from './table.logic'
import { dataPanelState, type DataPanelStateInput } from './metric.logic'

export interface DataTableColumn<Row> {
  /** Stable key. Also the sort key when the column is sortable. */
  readonly key: string
  readonly label: string
  /** End-aligned and tabular. True for every measured quantity. */
  readonly isNumeric?: boolean
  readonly isSortable?: boolean
  readonly render: (row: Row) => ReactNode
}

export interface DataTableProps<Row> extends DataPanelStateInput {
  /** The table's accessible name. Required: an unnamed table is a maze. */
  caption: string
  /** Shown above the table. Omit to keep the caption as the only heading. */
  title?: string
  detail?: string
  columns: readonly DataTableColumn<Row>[]
  rows: readonly Row[]
  /** Stable identity per row. */
  rowKey: (row: Row) => string
  sortKey?: string
  sortOrder?: SortOrder
  onSortChange?: (key: string, order: SortOrder) => void
  /** Total rows on the server, when more exist than are shown. */
  totalRows?: number
  /** The "show more" control, when there is one. */
  moreAction?: ReactNode
  /** Fewer or more columns before the phone layout stacks. */
  stackThreshold?: number
  deniedDetail?: string
  /** What the table would have listed: "posts with analytics". */
  emptySubject?: string
  emptyNextAction?: string
}

export function DataTable<Row>({
  caption,
  title,
  detail,
  columns,
  rows,
  rowKey,
  sortKey,
  sortOrder = 'desc',
  onSortChange,
  totalRows,
  moreAction,
  stackThreshold,
  deniedDetail,
  emptySubject = 'rows',
  emptyNextAction = 'Widen the range, or check back later.',
  isLoading,
  deniedAction,
  failedAction,
}: DataTableProps<Row>) {
  const adaptation = tableAdaptation({ columnCount: columns.length, stackThreshold })
  const overflow = rowOverflow({ shown: rows.length, total: totalRows ?? rows.length })
  const status = dataPanelState({ isLoading, deniedAction, failedAction, rowCount: rows.length })
  const scroll = tableScrollStyle()

  /*
   * Below the `columns` breakpoint the stacking layout turns every table
   * element into a block, which is what costs the implicit roles. `sx` rather
   * than props because these are descendant selectors, not styles on this
   * element.
   */
  const stackedSx =
    adaptation.mobile === 'stacked'
      ? {
          '@media (max-width: 800px)': {
            thead: {
              position: 'absolute',
              width: '1px',
              height: '1px',
              overflow: 'hidden',
              clip: 'rect(0 0 0 0)',
            },
            'tbody, tr, td': { display: 'block', width: '100%' },
            tr: {
              borderBottomWidth: '1px',
              borderStyle: 'solid',
              borderColor: componentTokens.workspace.tableBorder,
              paddingBlock: space[3],
            },
            td: {
              display: 'flex',
              justifyContent: 'space-between',
              gap: space[3],
              borderBottomWidth: '0',
              textAlign: 'start',
            },
            // The column name, drawn in front of the value it belongs to. The
            // header row stays in the DOM (clipped, not removed) and the roles
            // above restore the table semantics that `display: block` destroys.
            // Whether a given screen reader then announces the pairing correctly
            // is a real-AT question, and it is on the B6 accessibility matrix.
            'td::before': {
              content: 'attr(data-column)',
              color: componentTokens.field.hint,
              fontWeight: 500,
            },
          },
        }
      : undefined

  return (
    <Stack as="section" gap={4}>
      {title === undefined ? null : (
        <Heading recipe="cardTitle" as="h3">
          {title}
        </Heading>
      )}
      {detail === undefined ? null : <Text recipe="metadata">{detail}</Text>}

      {status === 'denied' ? (
        <PermissionState deniedAction={deniedAction ?? 'view this table'} detail={deniedDetail} />
      ) : status === 'error' ? (
        <ErrorState failedAction={failedAction ?? 'load this table'} />
      ) : status === 'loading' ? (
        <PanelLoading task={caption.toLowerCase()} />
      ) : status === 'empty' ? (
        <EmptyState subject={emptySubject} nextAction={emptyNextAction} />
      ) : (
        <>
          <Box
            {...scroll}
            borderStyle="solid"
            // The scroller is focusable so a keyboard user can reach the
            // columns that are off-screen. Without this the only way to scroll
            // a wide table is a pointer.
            tabIndex={0}
            role="region"
            aria-label={caption}
          >
            <Box
              as="table"
              width="100%"
              role={adaptation.needsExplicitRoles ? 'table' : undefined}
              sx={{ borderCollapse: 'collapse', ...stackedSx }}
            >
              <VisuallyHidden as="caption">{caption}</VisuallyHidden>

              <Box as="thead" bg={componentTokens.workspace.tableHeaderBg}>
                <Box as="tr">
                  {columns.map((column) => {
                    const sort = sortHeader({
                      columnLabel: column.label,
                      columnKey: column.key,
                      activeKey: sortKey,
                      order: sortOrder,
                    })
                    const cell = tableCellStyle(column.isNumeric === true)

                    return (
                      <Box
                        as="th"
                        key={column.key}
                        scope="col"
                        aria-sort={column.isSortable ? sort['aria-sort'] : undefined}
                        {...cell}
                      >
                        {column.isSortable && onSortChange !== undefined ? (
                          <Box
                            as="button"
                            type="button"
                            // The name states the current order and what a
                            // press does. "Views" alone leaves a screen-reader
                            // user guessing why the rows moved.
                            aria-label={sort.label}
                            onClick={() => onSortChange(column.key, sort.nextOrder)}
                            display="inline-flex"
                            alignItems="center"
                            gap={space[1]}
                            minH={space[8]}
                            color={
                              sort.isActive ? componentTokens.control.solidBg : 'text.secondary'
                            }
                          >
                            <Text recipe="metadata" as="span" color="inherit" fontWeight="semibold">
                              {column.label}
                            </Text>
                            {/*
                             * An arrow as well as the colour, so the sorted
                             * column is identifiable in greyscale.
                             */}
                            {sort.showsIndicator ? (
                              <Box
                                as={sortOrder === 'asc' ? FiArrowUp : FiArrowDown}
                                aria-hidden="true"
                              />
                            ) : null}
                          </Box>
                        ) : (
                          <Text
                            recipe="metadata"
                            as="span"
                            color="text.secondary"
                            fontWeight="semibold"
                          >
                            {column.label}
                          </Text>
                        )}
                      </Box>
                    )
                  })}
                </Box>
              </Box>

              <Box as="tbody">
                {rows.map((row) => (
                  <Box
                    as="tr"
                    key={rowKey(row)}
                    role={adaptation.needsExplicitRoles ? 'row' : undefined}
                  >
                    {columns.map((column) => (
                      <Box
                        as="td"
                        key={column.key}
                        role={adaptation.needsExplicitRoles ? 'cell' : undefined}
                        // Read back by the `::before` rule in the stacked
                        // layout. Harmless everywhere else.
                        data-column={adaptation.needsCellLabels ? column.label : undefined}
                        {...tableCellStyle(column.isNumeric === true)}
                      >
                        {column.render(row)}
                      </Box>
                    ))}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {overflow.summary === null ? null : (
            <Flex align="center" justify="space-between" gap={space[3]} flexWrap="wrap">
              {/*
               * A table that shows twenty of a hundred rows without saying so
               * is how a dashboard misleads quietly.
               */}
              <Text recipe="metadata" role="status" aria-live="polite">
                {overflow.summary}
              </Text>
              {moreAction}
            </Flex>
          )}
        </>
      )}
    </Stack>
  )
}

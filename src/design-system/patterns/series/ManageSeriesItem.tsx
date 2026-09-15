/**
 * Horizon Design System v2 - one row of the Series manager.
 *
 * The owner's view of a part: its position, its title, whether it is published,
 * and the three things that can be done to it. Dense and quiet - a workspace
 * row, not an editorial card - which is why it sits on the control radius and
 * not the card radius.
 *
 * Every control names the blog it acts on. Eight rows of "Move up" is a control
 * that works and a screen reader that cannot say which one is focused, so the
 * labels come from `manageItemControls` and are never written at the call site.
 */

import { Box, type BoxProps } from '@chakra-ui/react'
import { FiArrowDown, FiArrowUp, FiTrash2 } from 'react-icons/fi'

import { componentTokens, space } from '../../../theme/tokens'
import { IconButton } from '../../components/actions'
import { StatusBadge } from '../../components/status'
import { Text } from '../../components/typography'
import {
  manageItemControls,
  manageRowRadius,
  type ManagedSeriesPart,
  type MoveDirection,
} from './series.logic'

export interface ManageSeriesItemProps extends Omit<BoxProps, 'children' | 'onSelect'> {
  /**
   * The part this row manages. Named `item` rather than `part` because `part`
   * is a real HTML attribute (CSS Shadow Parts) and a prop that shadows one
   * fails the moment anything spreads `BoxProps` onto this component.
   */
  item: ManagedSeriesPart
  index: number
  count: number
  onMove: (index: number, direction: MoveDirection) => void
  onRemove: (index: number) => void
  /** A mutation is in flight for the whole Series; the row stops accepting input. */
  isBusy?: boolean
}

const statusTone = {
  published: 'success',
  scheduled: 'warning',
  draft: 'neutral',
} as const

const statusLabel = {
  published: 'Published',
  scheduled: 'Scheduled',
  draft: 'Draft',
} as const

export function ManageSeriesItem({
  item,
  index,
  count,
  onMove,
  onRemove,
  isBusy = false,
  ...rest
}: ManageSeriesItemProps) {
  const controls = manageItemControls(index, count, item.title)

  return (
    <Box
      as="li"
      display="flex"
      alignItems="center"
      gap={space[3]}
      padding={space[3]}
      borderWidth="1px"
      borderStyle="solid"
      borderColor={componentTokens.workspace.border}
      borderRadius={manageRowRadius}
      bg={componentTokens.workspace.panelBg}
      {...rest}
    >
      <Text as="span" recipe="metadata" aria-hidden="true">
        {controls.ordinal}
      </Text>

      <Box display="flex" flexDirection="column" gap={space[1]} flex="1 1 auto" minW={0}>
        <Text as="span" recipe="body" color="text.primary">
          {item.title}
        </Text>
        {/*
         * `minW={0}` overrides this wrapper's default `auto`, which otherwise
         * floors it at the badge's content width - inside a column flex
         * container a stretched child still gets an automatic minimum equal
         * to its min-content, so without this the badge's own shrink-and-
         * truncate behaviour never gets the chance to apply.
         */}
        <Box minW={0}>
          <StatusBadge tone={statusTone[item.status]}>{statusLabel[item.status]}</StatusBadge>
        </Box>
      </Box>

      <IconButton
        label={controls.moveUpLabel}
        icon={<FiArrowUp />}
        size="sm"
        isDisabled={isBusy || !controls.canMoveUp}
        onClick={() => onMove(index, 'up')}
      />
      <IconButton
        label={controls.moveDownLabel}
        icon={<FiArrowDown />}
        size="sm"
        isDisabled={isBusy || !controls.canMoveDown}
        onClick={() => onMove(index, 'down')}
      />
      <IconButton
        label={controls.removeLabel}
        icon={<FiTrash2 />}
        tone="danger"
        size="sm"
        isDisabled={isBusy}
        onClick={() => onRemove(index)}
      />
    </Box>
  )
}

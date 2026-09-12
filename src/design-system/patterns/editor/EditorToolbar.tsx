/**
 * Horizon Design System v2 - the editor toolbar.
 *
 * Two things: the mode switch (write, preview, split) and a row of formatting
 * commands. Both are chrome. The commands are `onInvoke` callbacks the feature
 * wires to whatever editor it is running - the toolbar never touches a document
 * model, and there is no prop through which it could.
 *
 * The mode switch is a real `tablist` of real `button`s with `aria-selected`,
 * driven by arrow keys, because that is what a group of mutually exclusive
 * views is. The formatting row is not a tablist: those are commands, not views,
 * and giving them `aria-selected` would tell a screen reader that "Bold" is a
 * page the reader is currently on.
 */

import { useRef, type KeyboardEvent, type ReactElement } from 'react'
import { Box, Flex } from '@chakra-ui/react'

import { componentTokens, radii, space, transitionFor } from '../../../theme/tokens'
import { IconButton } from '../../components/actions'
import { Text } from '../../components/typography'
import { workspaceModes, type WorkspaceMode } from './workspace.logic'

const modeLabels: Record<WorkspaceMode, string> = {
  write: 'Write',
  preview: 'Preview',
  split: 'Split',
}

export interface EditorCommand {
  /** Stable id, used as the React key. */
  readonly id: string
  /** The accessible name. "Bold", not "B". */
  readonly label: string
  readonly icon: ReactElement
  readonly onInvoke: () => void
  readonly isDisabled?: boolean
}

export interface EditorToolbarProps {
  mode: WorkspaceMode
  onModeChange: (mode: WorkspaceMode) => void
  /** Formatting and insertion commands. Ordered by the feature. */
  commands?: readonly EditorCommand[]
  /** Which modes are offered. Omit `split` when there is no preview. */
  availableModes?: readonly WorkspaceMode[]
  /** Names the tablist for assistive technology. */
  label?: string
}

export function EditorToolbar({
  mode,
  onModeChange,
  commands,
  availableModes = workspaceModes,
  label = 'Editor view',
}: EditorToolbarProps) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  /*
   * Arrow keys move between tabs and Home/End jump to the ends - the roving
   * focus a `tablist` promises. Without it a keyboard user has to tab through
   * three buttons that behave like radio buttons, which is the mismatch
   * `role="tab"` exists to prevent.
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End']

    if (!keys.includes(event.key)) {
      return
    }

    event.preventDefault()

    const index = availableModes.indexOf(mode)
    const last = availableModes.length - 1
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? last
          : event.key === 'ArrowLeft'
            ? (index - 1 + availableModes.length) % availableModes.length
            : (index + 1) % availableModes.length

    onModeChange(availableModes[next])
    tabRefs.current[next]?.focus()
  }

  return (
    <Flex
      align="center"
      justify="space-between"
      gap={space[3]}
      padding={space[2]}
      flexWrap="wrap"
      role="toolbar"
      aria-label="Writing tools"
      aria-orientation="horizontal"
    >
      <Flex
        role="tablist"
        aria-label={label}
        onKeyDown={handleKeyDown}
        gap={space[1]}
        padding={space[1]}
        borderRadius={radii.tag}
        bg={componentTokens.workspace.panelBg}
      >
        {availableModes.map((candidate, index) => {
          const isCurrent = candidate === mode

          return (
            <Box
              key={candidate}
              as="button"
              type="button"
              role="tab"
              ref={(element: HTMLButtonElement | null) => {
                tabRefs.current[index] = element
              }}
              aria-selected={isCurrent}
              // Only the selected tab is in the tab order; the arrow keys reach
              // the others. Three stops for one control is three too many.
              tabIndex={isCurrent ? 0 : -1}
              onClick={() => onModeChange(candidate)}
              minH={space[8]}
              px={space[3]}
              borderRadius={radii.tag}
              bg={isCurrent ? componentTokens.workspace.toolbarBg : 'transparent'}
              color={isCurrent ? 'text.primary' : componentTokens.control.quietFg}
              transition={`${transitionFor('background-color', 'fast')}, ${transitionFor('color', 'fast')}`}
            >
              <Text recipe="metadata" as="span" color="inherit" fontWeight="medium">
                {modeLabels[candidate]}
              </Text>
            </Box>
          )
        })}
      </Flex>

      {commands === undefined || commands.length === 0 ? null : (
        <Flex gap={space[1]} flexWrap="wrap">
          {commands.map((command) => (
            <IconButton
              key={command.id}
              // `sm` is deliberately below the 44px floor: a formatting row at
              // full touch size does not fit a phone, and the row itself stays
              // thumb-reachable because it wraps rather than scrolling away.
              size="sm"
              tone="quiet"
              label={command.label}
              icon={command.icon}
              isDisabled={command.isDisabled}
              onClick={command.onInvoke}
            />
          ))}
        </Flex>
      )}
    </Flex>
  )
}

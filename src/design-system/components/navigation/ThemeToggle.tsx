import { flushSync } from 'react-dom'
import { Box, useColorMode } from '@chakra-ui/react'
import { FiMoon, FiSun } from 'react-icons/fi'

import { componentTokens, radii, space, transitionFor } from '../../../theme/tokens'
import { runThemeSweep } from '../../motion/themeSweep.logic'
import { useViewTransition } from '../../motion/useViewTransition'
import { themeToggleOptions, type ThemeMode } from './navigation.logic'

export interface ThemeToggleProps {
  /** Controlled mode. Omit to read and write Chakra's colour mode directly. */
  mode?: ThemeMode
  onModeChange?: (mode: ThemeMode) => void
  /** Group label. It names the control set for assistive technology. */
  label?: string
}

const icons = { light: FiSun, dark: FiMoon } as const

/**
 * A two-button group for the light/dark choice.
 *
 * Not a switch: a switch is on or off, and neither theme is the off state. Two
 * buttons carrying `aria-pressed` say which theme is active in a way that
 * survives with no colour perception at all - the state is in the accessibility
 * tree, not only in which half of the pill looks lit.
 *
 * The buttons stay 44px targets and the group never changes size when the
 * choice changes, so the header does not reflow on theme switch.
 *
 * The change itself runs as a theme sweep (`runThemeSweep`): where the browser
 * has view transitions and the reader has not asked for less motion, the new
 * theme opens from a horizon across the middle of the viewport. `flushSync` is
 * what makes the React state change land in the DOM inside the transition's
 * update callback rather than a frame later, which is the difference between
 * the browser snapshotting the new theme and snapshotting the old one twice.
 */
export function ThemeToggle({ mode, onModeChange, label = 'Colour theme' }: ThemeToggleProps) {
  const { colorMode, setColorMode } = useColorMode()
  const runTransition = useViewTransition()
  const activeMode: ThemeMode = mode ?? (colorMode === 'dark' ? 'dark' : 'light')

  const select = (next: ThemeMode) => {
    const apply = onModeChange === undefined ? () => setColorMode(next) : () => onModeChange(next)

    runThemeSweep({
      document: typeof document === 'undefined' ? null : document,
      runTransition,
      update: () => flushSync(apply),
    })
  }

  return (
    <Box
      role="group"
      aria-label={label}
      display="inline-flex"
      p={space[1]}
      gap={space[1]}
      bg="bg.subtle"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="border.subtle"
      borderRadius={radii.tag}
    >
      {themeToggleOptions(activeMode).map((option) => {
        const Icon = icons[option.value]

        return (
          <Box
            key={option.value}
            as="button"
            type="button"
            aria-label={option.label}
            aria-pressed={option.isPressed}
            onClick={() => select(option.value)}
            display="inline-grid"
            placeItems="center"
            minW={componentTokens.control.minTouchTarget}
            minH={componentTokens.control.minTouchTarget}
            borderRadius={radii.tag}
            color={option.isPressed ? 'text.primary' : 'text.muted'}
            bg={option.isPressed ? 'bg.surface' : 'transparent'}
            boxShadow={option.isPressed ? 'card' : 'none'}
            transition={`${transitionFor('background-color', 'fast')}, ${transitionFor('color', 'fast')}`}
            _hover={{ color: 'text.primary' }}
          >
            <Box as={Icon} aria-hidden="true" />
          </Box>
        )
      })}
    </Box>
  )
}

/**
 * Horizon Design System v2 - shared gallery scaffolding.
 *
 * Chrome only. Nothing here is a design-system component or a copy of one: it
 * is the filler a layout primitive needs in order to have something to lay out,
 * plus the two icons the icon-taking components need in order to be mounted at
 * all.
 */

import type { ComponentType, ReactNode } from 'react'
import { Box } from '@chakra-ui/react'

import { radii, space } from '../../../theme/tokens'

export type EntryRenderer = ComponentType<{ readonly state: string }>

/**
 * Filler with a visible edge, so a layout primitive's gap, direction and
 * column behaviour can be seen. Deliberately unlike any real surface.
 */
export function Filler({ children }: { readonly children?: ReactNode }) {
  return (
    <Box
      bg="bg.subtle"
      color="text.secondary"
      border="1px dashed"
      borderColor="border.subtle"
      borderRadius={radii.control}
      px={space[3]}
      py={space[2]}
    >
      {children ?? 'Sample block'}
    </Box>
  )
}

/** A scrollable stand-in for an article body, for anything that tracks scroll. */
export function Scroller({ children }: { readonly children: ReactNode }) {
  return (
    <Box
      maxH={space[24]}
      overflowY="auto"
      border="1px solid"
      borderColor="border.subtle"
      borderRadius={radii.control}
      p={space[3]}
    >
      {children}
    </Box>
  )
}

/** Machine-readable output from a hook harness. Never a design-system surface. */
export function ReadOut({ children }: { readonly children: ReactNode }) {
  return (
    <Box
      as="pre"
      fontFamily="mono"
      textStyle="meta"
      whiteSpace="pre-wrap"
      bg="bg.code"
      color="text.secondary"
      borderRadius={radii.control}
      p={space[3]}
    >
      {children}
    </Box>
  )
}

/** A neutral glyph, so icon-taking components can be mounted without a new dependency. */
export function Glyph({ shape = 'dot' }: { readonly shape?: 'dot' | 'arrow' | 'bar' }) {
  return (
    <Box
      as="svg"
      viewBox="0 0 16 16"
      width="1em"
      height="1em"
      aria-hidden="true"
      fill="currentColor"
    >
      {shape === 'dot' ? <circle cx="8" cy="8" r="5" /> : null}
      {shape === 'arrow' ? <path d="M3 8h8.5L8 4.5 9 3.5 14 8l-5 4.5-1-1L11.5 9H3z" /> : null}
      {shape === 'bar' ? <rect x="2" y="6" width="12" height="4" rx="1" /> : null}
    </Box>
  )
}

/** A no-op for the many handlers a review surface has to supply but never uses. */
export function noop(): void {
  /* The gallery has no backend, so every side effect stops here. */
}

import { Box, type BoxProps } from '@chakra-ui/react'

import { space } from '../../../theme/tokens'
import { dividerStyle, type DividerOrientation } from './surface.logic'

export interface DividerProps extends Omit<BoxProps, 'as' | 'children'> {
  orientation?: DividerOrientation
  /**
   * Optional text sitting in a gap in the rule. With a label the divider is a
   * labelled `separator`; without one it is a plain `hr`.
   */
  label?: string
}

/**
 * A single hairline. It has no shadow, no radius and no background, because a
 * divider that carried any of those would be competing with the surface it sits
 * on for ownership of the same edge.
 *
 * No ref is forwarded. The two branches below render different elements - `hr`
 * and `div` - and one ref type cannot honestly describe both. Nothing measures
 * or focuses a divider, so the right answer is to not offer the handle rather
 * than to offer one with a lie in its type.
 */
export function Divider({ orientation = 'horizontal', label, ...rest }: DividerProps) {
  const style = dividerStyle(orientation)

  if (label === undefined) {
    return (
      <Box
        as="hr"
        border="0"
        borderStyle="solid"
        {...style}
        aria-orientation={orientation}
        {...rest}
      />
    )
  }

  /*
   * A labelled divider cannot be an `hr` - `hr` has no permitted content - so it
   * is a `div` with the separator role. The two rules are decorative and hidden
   * from assistive technology; the accessible name comes from the visible text.
   */
  return (
    <Box
      role="separator"
      aria-orientation={orientation}
      display="flex"
      alignItems="center"
      gap={space[3]}
      textStyle="meta"
      color="text.muted"
      {...rest}
    >
      <Box aria-hidden="true" flex="1" {...dividerStyle('horizontal')} />
      {label}
      <Box aria-hidden="true" flex="1" {...dividerStyle('horizontal')} />
    </Box>
  )
}

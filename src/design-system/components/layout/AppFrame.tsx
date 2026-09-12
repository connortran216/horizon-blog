import { forwardRef } from 'react'
import { Box, type BoxProps } from '@chakra-ui/react'

import { transitionFor } from '../../../theme/tokens'

export interface AppFrameProps extends Omit<BoxProps, 'as'> {
  /**
   * Id of the element the skip link jumps to. It must exist in the tree, and it
   * must be focusable (`tabIndex={-1}` on a landmark is the usual answer).
   */
  skipToId?: string
  /** Visible text of the skip link, once it is focused. */
  skipLabel?: string
  /** Set to false only when a host page already provides its own skip link. */
  showSkipLink?: boolean
}

/**
 * The outermost page shell. It owns exactly two things: the page canvas and the
 * minimum viewport height. Header, main and footer are composed inside it - the
 * frame does not know they exist.
 *
 * The skip link lives here because it has to be the first focusable element in
 * the document, which no lower component can guarantee. It is visually hidden
 * until focused, never `display: none`, so it stays reachable by keyboard.
 */
export const AppFrame = forwardRef<HTMLDivElement, AppFrameProps>(function AppFrame(
  {
    skipToId = 'main-content',
    skipLabel = 'Skip to content',
    showSkipLink = true,
    children,
    ...rest
  },
  ref,
) {
  return (
    <Box
      ref={ref}
      minH="100vh"
      display="flex"
      flexDirection="column"
      bg="bg.page"
      color="text.primary"
      transition={`${transitionFor('background-color')}, ${transitionFor('color')}`}
      {...rest}
    >
      {showSkipLink ? (
        <Box
          as="a"
          href={`#${skipToId}`}
          position="absolute"
          left={4}
          top={4}
          zIndex="skipLink"
          px={4}
          py={3}
          bg="bg.surface"
          color="text.primary"
          borderRadius="control"
          boxShadow="card"
          transform="translateY(-200%)"
          _focusVisible={{ transform: 'translateY(0)' }}
        >
          {skipLabel}
        </Box>
      ) : null}
      {children}
    </Box>
  )
})

/**
 * Horizon Design System v2 - the image failed.
 *
 * Fills the frame, so the failure occupies exactly the space the image would
 * have. The copy names what could not be loaded, and the retry control is
 * passed in rather than assumed - a decorative image that fails is worth
 * hiding, not worth a button.
 */

import { Box, Text, VStack, type BoxProps } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { componentTokens, space } from '../../../theme/tokens'
import { failureMessage, liveRegionFor } from '../feedback'

export interface MediaErrorProps extends Omit<BoxProps, 'children'> {
  /** A verb phrase: "load the cover image". */
  failedAction: string
  /** Typically a `MediaRetry`. */
  children?: ReactNode
}

export function MediaError({ failedAction, children, ...rest }: MediaErrorProps) {
  return (
    <Box
      {...liveRegionFor('error')}
      position="absolute"
      inset={0}
      display="flex"
      alignItems="center"
      justifyContent="center"
      padding={space[4]}
      bg={componentTokens.media.errorBg}
      {...rest}
    >
      <VStack spacing={space[3]} align="center" textAlign="center">
        <Text textStyle="meta" color={componentTokens.media.errorFg}>
          {failureMessage(failedAction)}
        </Text>
        {children}
      </VStack>
    </Box>
  )
}

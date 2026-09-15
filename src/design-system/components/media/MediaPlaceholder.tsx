/**
 * Horizon Design System v2 - what fills the frame before the image does.
 *
 * Three of the five media states land here: `absent` (there is no image and
 * there never will be), `loading`, and `retrying`. They look alike on purpose -
 * the frame is the same box in all of them - and they differ in whether they
 * pulse and what they announce.
 *
 * `absent` is silent and still. It is not a wait, so it neither breathes nor
 * gets a live region; the reader is looking at the final state of a post that
 * has no cover.
 */

import { Box, Text, type BoxProps } from '@chakra-ui/react'

import { componentTokens, space } from '../../../theme/tokens'
import { loadingPulseAnimation, useMotionPolicy } from '../../motion'
import { liveRegionFor, loadingMessage } from '../feedback'

export type MediaPlaceholderVariant = 'absent' | 'loading' | 'retrying'

export interface MediaPlaceholderProps extends Omit<BoxProps, 'children'> {
  variant: MediaPlaceholderVariant
  /** The image being waited for: "the cover image". Required while waiting. */
  task?: string
  /** Shown in the `absent` variant - an eyebrow, a title, an initial. */
  caption?: string
}

export function MediaPlaceholder({ variant, task, caption, ...rest }: MediaPlaceholderProps) {
  const policy = useMotionPolicy()
  const waiting = variant !== 'absent'
  const message = waiting ? loadingMessage(task ?? 'the image') : null

  return (
    <Box
      {...(waiting ? liveRegionFor('loading') : { 'aria-hidden': true })}
      position="absolute"
      inset={0}
      display="flex"
      alignItems="center"
      justifyContent="center"
      padding={space[4]}
      bg={componentTokens.media.placeholderBg}
      animation={waiting ? loadingPulseAnimation(policy) : undefined}
      {...rest}
    >
      {/*
       * One quiet accent band rather than an illustration. This sits under real
       * editorial imagery and must not compete with it, and a solid token beats
       * a gradient that would have to be written as a raw colour string.
       */}
      <Box
        position="absolute"
        insetInline={space[4]}
        bottom={space[4]}
        height={space[1]}
        borderRadius={componentTokens.control.radius}
        bg={componentTokens.media.placeholderAccent}
      />
      {variant === 'absent' && caption ? (
        <Text textStyle="meta" color="text.muted" noOfLines={2} textAlign="center">
          {caption}
        </Text>
      ) : null}
      {message ? (
        <Text textStyle="meta" color="text.secondary" textAlign="center">
          {message}
        </Text>
      ) : null}
    </Box>
  )
}

import type { ReactNode } from 'react'
import { Box, type BoxProps } from '@chakra-ui/react'
import { FiAlertCircle, FiAlertTriangle, FiCheckCircle, FiInfo } from 'react-icons/fi'
import type { IconType } from 'react-icons'

import { radii, space } from '../../../theme/tokens'
import { statusToneStyle, type StatusIcon, type StatusTone } from './status.logic'

const icons: Record<StatusIcon, IconType> = {
  info: FiInfo,
  check: FiCheckCircle,
  warning: FiAlertTriangle,
  error: FiAlertCircle,
}

export interface StatusBadgeProps extends Omit<BoxProps, 'children'> {
  tone?: StatusTone
  /** The status in words. Required - a coloured dot is not a status. */
  children: ReactNode
  /**
   * Announce the badge when it appears. Use it for a status that changes while
   * the page is open (a draft becoming published), not for one rendered once.
   */
  isLive?: boolean
}

/**
 * A small label stating the state of something: published, scheduled, failed.
 *
 * Three channels, always: the tone's colour, the tone's icon, and the text.
 * Removing any of them is not a prop - `children` is required and the icon is
 * not optional - because "published" and "scheduled" differ by one hue that a
 * reader with deuteranopia cannot separate.
 */
export function StatusBadge({
  tone = 'neutral',
  children,
  isLive = false,
  ...rest
}: StatusBadgeProps) {
  const style = statusToneStyle(tone)
  const Icon = icons[style.icon]

  return (
    <Box
      as="span"
      role={isLive ? 'status' : undefined}
      aria-live={isLive ? 'polite' : undefined}
      display="inline-flex"
      alignItems="center"
      gap={space[1]}
      px={space[2]}
      py={space[1]}
      borderRadius={radii.tag}
      bg={style.bg}
      color={style.color}
      textStyle="meta"
      whiteSpace="nowrap"
      /*
       * The badge itself must carry these three, not only the text inside it.
       * `minWidth={0}` overrides the flex-item default of `auto`, which would
       * otherwise floor the badge at the text's own content width regardless
       * of what its row has left. `maxWidth="100%"` is the part that actually
       * does the clamping: the badge is `inline-flex`, an auto-width atomic
       * box, and shrink-to-fit sizing alone does not reliably cap such a box
       * to its container when the container is a plain (non-flex) parent - a
       * percentage `max-width` always resolves against the containing
       * block's width, in a flex item or a plain block alike, so the badge
       * can never render wider than the space it was actually given.
       * `overflow: hidden` then keeps that clamp from spilling visibly.
       */
      minWidth={0}
      maxWidth="100%"
      overflow="hidden"
      {...rest}
    >
      <Box as={Icon} aria-hidden="true" flexShrink={0} />
      {/*
       * The status word stays on one line - "published" wrapping mid-word
       * would leave the icon and the tone colour describing a half-finished
       * label - but it must still be able to give way inside the badge's
       * `inline-flex` row. `minWidth: 0` lets it shrink instead of forcing the
       * badge (and its container) as wide as the text; the ellipsis then makes
       * that shrink a truncation instead of a silent clip, and `title` keeps
       * the full status reachable for anyone who cannot read the cut-off text.
       * A real status word ("Published", "Scheduled") never reaches this path.
       */}
      <Box
        as="span"
        minWidth={0}
        overflow="hidden"
        textOverflow="ellipsis"
        title={typeof children === 'string' ? children : undefined}
      >
        {children}
      </Box>
    </Box>
  )
}

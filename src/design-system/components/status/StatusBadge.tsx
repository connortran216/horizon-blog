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
      {...rest}
    >
      <Box as={Icon} aria-hidden="true" flexShrink={0} />
      {children}
    </Box>
  )
}

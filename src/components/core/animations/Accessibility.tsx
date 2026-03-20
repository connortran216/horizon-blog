import React, { ReactNode } from 'react'
import { Box, Button, ButtonProps, useColorModeValue } from '@chakra-ui/react'
import { motion, Transition } from 'framer-motion'

interface AnimationProps {
  animate?: Record<string, unknown>
  transition?: Transition
  whileHover?: Record<string, unknown> | string
  whileTap?: Record<string, unknown> | string
}

interface FocusRingProps {
  children: ReactNode
  showRing?: boolean
  ringColor?: string
}

export const FocusRing: React.FC<FocusRingProps> = ({ children, showRing = true, ringColor }) => {
  const defaultRingColor = useColorModeValue('blue.500', 'purple.300')

  return (
    <Box
      as={motion.div}
      whileFocus={{
        scale: 1.02,
        transition: { type: 'spring', stiffness: 400, damping: 17 },
      }}
      _focusVisible={{
        outline: '2px solid',
        outlineColor: ringColor || defaultRingColor,
        outlineOffset: '2px',
        boxShadow: showRing ? `0 0 0 2px ${ringColor || defaultRingColor}` : undefined,
      }}
      transition={undefined}
    >
      {children}
    </Box>
  )
}

interface AccessibleButtonProps extends ButtonProps {
  children: ReactNode
  motionProps?: AnimationProps
  focusRing?: boolean
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  motionProps,
  focusRing = true,
  ...buttonProps
}) => {
  const { transition: _, ...animationProps } = motionProps || {}

  return (
    <FocusRing showRing={focusRing}>
      <Button
        as={motion.button}
        transition={undefined}
        {...animationProps}
        {...buttonProps}
        _focusVisible={{
          outline: '2px solid',
          outlineColor: useColorModeValue('blue.500', 'purple.300'),
        }}
      >
        {children}
      </Button>
    </FocusRing>
  )
}

export default {
  FocusRing,
  AccessibleButton,
}

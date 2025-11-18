import React, { useState } from 'react'
import { Button, ButtonProps, Box } from '@chakra-ui/react'
import { LinkProps } from 'react-router-dom'

// ===== TYPES =====

interface RippleData {
  x: number
  y: number
  size: number
  id: number
}

interface AnimatedButtonProps extends ButtonProps {
  enableRipple?: boolean
}

// ===== MAIN COMPONENT =====

/**
 * Simplified AnimatedButton - following clean example pattern
 * - Chakra Box components for ripples (like the example)
 * - Simple onMouseDown trigger (instead of complex onClick)
 * - Pure CSS keyframes (like styled-jsx approach)
 * - Design system compliant (semantic tokens preserved)
 */
export const AnimatedButton = ({
  children,
  enableRipple = true,
  ...props
}: AnimatedButtonProps) => {
  const [ripples, setRipples] = useState<RippleData[]>([])

  const addRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!enableRipple) return

    const button = e.currentTarget
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2

    const newRipple = {
      x,
      y,
      size,
      id: Date.now(),
    }

    setRipples((prev) => [...prev, newRipple])

    // Clean up after animation completes (like example)
    setTimeout(() => {
      setRipples((prevRipples) => prevRipples.filter((ripple) => ripple.id !== newRipple.id))
    }, 600)
  }

  return (
    <Button
      position="relative"
      overflow="hidden"
      onMouseDown={addRipple} // Simple trigger like example
      _hover={{
        transform: 'translateY(-1px)', // Safe hover lift
        boxShadow: 'lg',
      }}
      {...props} // All props pass through (RouterLink compatible)
    >
      {/* Ripple effects using Chakra Box (like example) */}
      {ripples.map((ripple) => (
        <Box
          key={ripple.id}
          position="absolute"
          borderRadius="50%"
          bg="rgba(255, 255, 255, 0.6)" // More visible like example
          animation="ripple 600ms ease-out" // Chakra animation prop
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
          }}
        />
      ))}
      {children}

      {/* CSS keyframes injected globally */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes ripple {
            to {
              transform: scale(4);
              opacity: 0;
            }
          }
        `,
        }}
      />
    </Button>
  )
}

// ===== CONVENIENCE WRAPPERS =====

/**
 * Primary variant - uses design system semantic tokens
 */
export const AnimatedPrimaryButton = (props: AnimatedButtonProps & Partial<LinkProps>) => (
  <AnimatedButton
    bg="accent.primary"
    color="white"
    _hover={{ bg: 'accent.hover' }}
    _active={{ bg: 'accent.active' }}
    fontWeight="medium"
    transition="all 0.2s"
    // Explicit width control (no min-w or auto sizing that could conflict)
    minW="0"
    w="auto"
    {...props}
  />
)

/**
 * Ghost variant
 */
export const AnimatedGhostButton = (props: AnimatedButtonProps) => (
  <AnimatedButton variant="ghost" {...props} />
)

/**
 * Outline variant
 */
export const AnimatedOutlineButton = (props: AnimatedButtonProps) => (
  <AnimatedButton variant="outline" {...props} />
)

export default AnimatedButton

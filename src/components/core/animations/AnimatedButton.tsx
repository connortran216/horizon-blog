import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Button, ButtonProps, useColorModeValue } from '@chakra-ui/react'

// Create a motion-enhanced Button
const MotionButton = motion(Button)

// Ripple effect component
const Ripple = ({ x, y, size }: { x: number; y: number; size: number }) => (
  <motion.span
    className="absolute bg-white/30 rounded-full pointer-events-none"
    style={{
      width: size,
      height: size,
      left: x - size / 2,
      top: y - size / 2,
    }}
    initial={{ scale: 0, opacity: 1 }}
    animate={{ scale: 4, opacity: 0 }}
    transition={{ duration: 0.6 }}
  />
)

// Animated Button with ripple and morph effects
interface AnimatedButtonProps extends ButtonProps {
  enableRipple?: boolean
}

export const AnimatedButton = ({
  children,
  enableRipple = true,
  ...buttonProps
}: Omit<AnimatedButtonProps, 'magneticStrength' | 'enableMagnetic'>) => {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; size: number }[]>([])
  const rippleIdRef = useRef(0)

  // Create ripple effect
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (enableRipple && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect()
      const rippleX = e.clientX - rect.left
      const rippleY = e.clientY - rect.top
      const size = Math.max(rect.width, rect.height)

      const newRipple = {
        id: rippleIdRef.current++,
        x: rippleX,
        y: rippleY,
        size,
      }

      setRipples((prev) => [...prev, newRipple])

      // Remove ripple after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
      }, 600)
    }

    // Call original onClick if provided
    buttonProps.onClick?.(e)
  }

  return (
    <MotionButton
      whileHover={{
        scale: 1.02,
        boxShadow: useColorModeValue(
          '0 4px 15px rgba(139, 127, 199, 0.2)',
          '0 4px 15px rgba(139, 127, 199, 0.3)',
        ),
      }}
      whileTap={{
        scale: 0.98,
        transition: { type: 'spring', stiffness: 400, damping: 17 },
      }}
      onClick={handleClick}
      className={`relative overflow-hidden`}
      position="relative"
      {...buttonProps}
    >
      {children}

      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <Ripple key={ripple.id} x={ripple.x} y={ripple.y} size={ripple.size} />
      ))}
    </MotionButton>
  )
}

// Convenience wrappers for common button types
export const AnimatedPrimaryButton = (props: AnimatedButtonProps) => (
  <AnimatedButton variant="solid" colorScheme="purple" {...props} />
)

export const AnimatedGhostButton = (props: AnimatedButtonProps) => (
  <AnimatedButton variant="ghost" {...props} />
)

export const AnimatedOutlineButton = (props: AnimatedButtonProps) => (
  <AnimatedButton variant="outline" {...props} />
)

export default AnimatedButton

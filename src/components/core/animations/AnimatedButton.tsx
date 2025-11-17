import React, { useState, useRef, useEffect, forwardRef } from 'react'
import { motion, useMotionValue, useSpring, MotionValue } from 'framer-motion'
import { Button, ButtonProps, useColorModeValue } from '@chakra-ui/react'

// Types for magnetic effect
interface MagneticEffectReturn {
  ref: React.RefObject<HTMLButtonElement>
  x: MotionValue<number>
  y: MotionValue<number>
  onMouseEnter: () => void
  onMouseLeave: () => void
}

// Magnetic attraction effect
const useMagneticEffect = (strength: number = 0.3) => {
  const [isHovered, setIsHovered] = useState(false)
  const elementRef = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const xSpring = useSpring(x, { stiffness: 300, damping: 30 })
  const ySpring = useSpring(y, { stiffness: 300, damping: 30 })

  useEffect(() => {
    if (!elementRef.current || !isHovered) {
      x.set(0)
      y.set(0)
      return
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!elementRef.current) return

      const rect = elementRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const deltaX = (e.clientX - centerX) * strength
      const deltaY = (e.clientY - centerY) * strength

      x.set(deltaX)
      y.set(deltaY)
    }

    const handleMouseLeave = () => {
      x.set(0)
      y.set(0)
    }

    document.addEventListener('mousemove', handleMouseMove)
    elementRef.current.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      if (elementRef.current) {
        elementRef.current.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [isHovered, x, y, strength])

  return {
    ref: elementRef,
    x: xSpring,
    y: ySpring,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  }
}

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

// Animated Button with magnetic, ripple, and morph effects
interface AnimatedButtonProps extends ButtonProps {
  magneticStrength?: number
  enableRipple?: boolean
  enableMagnetic?: boolean
}

export const AnimatedButton = ({
  children,
  magneticStrength = 0.3,
  enableRipple = true,
  enableMagnetic = true,
  ...buttonProps
}: AnimatedButtonProps) => {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; size: number }[]>([])
  const rippleIdRef = useRef(0)

  // Magnetic effect only if enabled
  const magneticProps: MagneticEffectReturn | undefined = enableMagnetic ? useMagneticEffect(magneticStrength) : undefined
  const x = magneticProps?.x || 0
  const y = magneticProps?.y || 0

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

      setRipples(prev => [...prev, newRipple])

      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id))
      }, 600)
    }

    // Call original onClick if provided
    buttonProps.onClick?.(e)
  }

  return (
    <motion.button
      ref={magneticProps?.ref}
      style={{ x, y }}
      whileHover={{
        scale: 1.02,
        boxShadow: useColorModeValue(
          '0 4px 15px rgba(139, 127, 199, 0.2)',
          '0 4px 15px rgba(139, 127, 199, 0.3)'
        )
      }}
      whileTap={{
        scale: 0.98,
        transition: { type: 'spring', stiffness: 400, damping: 17 }
      }}
      onMouseEnter={magneticProps?.onMouseEnter}
      onMouseLeave={magneticProps?.onMouseLeave}
      onClick={handleClick}
      className={`relative overflow-hidden ${buttonProps.className || ''}`}
    >
      {/* Button content */}
      <Button
        {...buttonProps}
        className={buttonProps.className}
        style={{ ...buttonProps.style, pointerEvents: 'none' }} // Prevent double clicks
      >
        {children}
      </Button>

      {/* Ripple effects */}
      {ripples.map(ripple => (
        <Ripple key={ripple.id} x={ripple.x} y={ripple.y} size={ripple.size} />
      ))}
    </motion.button>
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

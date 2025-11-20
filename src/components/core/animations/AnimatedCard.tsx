import React, { useEffect, useRef, useState, ReactNode } from 'react'
import { motion, useAnimation, useInView, Variants } from 'framer-motion'
import { GlassCard } from './Glassmorphism'
import { useColorModeValue } from '@chakra-ui/react'

interface AnimatedCardProps {
  children: ReactNode
  /** Animation variant: 'fadeInUp', 'slideFromLeft', 'slideFromRight', 'scaleIn' */
  animation?: 'fadeInUp' | 'slideFromLeft' | 'slideFromRight' | 'scaleIn'
  /** Delay before animation starts (seconds) */
  delay?: number
  /** Animation duration (seconds) */
  duration?: number
  /** Enable parallax effect on scroll */
  parallax?: boolean
  /** Stagger delay for list items (seconds) */
  staggerDelay?: number
  /** Card index in list for staggered animations */
  index?: number
  /** Override hover effects */
  whileHover?: Variants
  /** Glass morphism intensity */
  intensity?: 'light' | 'medium' | 'heavy'
  /** Maximum width */
  maxW?: string | number
  /** Padding */
  p?: number
  /** Overflow behavior */
  overflow?: string
}

const animationVariants = {
  fadeInUp: {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  },
  slideFromLeft: {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  },
  slideFromRight: {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  },
}

export const AnimatedCard = ({
  children,
  animation = 'fadeInUp',
  delay = 0,
  duration = 0.6,
  parallax = false,
  staggerDelay = 0.1,
  index = 0,
  whileHover,
  ...boxProps
}: AnimatedCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const controls = useAnimation()
  const isInView = useInView(cardRef, {
    margin: '-10% 0px -10% 0px',
    once: true,
  })

  // Parallax effect
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    if (parallax) {
      const updateScrollY = () => {
        if (cardRef.current) {
          const rect = cardRef.current.getBoundingClientRect()
          const scrollValue = Math.max(0, rect.top * 0.5)
          setScrollY(scrollValue)
        }
      }

      window.addEventListener('scroll', updateScrollY, { passive: true })
      return () => window.removeEventListener('scroll', updateScrollY)
    }
  }, [parallax])

  // Start animation when in view
  useEffect(() => {
    if (isInView) {
      controls.start('visible')
    }
  }, [isInView, controls, delay, staggerDelay, index])

  // Enhanced hover effects with glow
  const hoverEffects = whileHover || {
    scale: 1.02,
    boxShadow: useColorModeValue(
      '0 4px 12px rgba(139, 127, 199, 0.5), 0 0 0 1px rgba(139, 127, 199, 0.1)',
      '0 4px 12px rgba(139, 127, 199, 0.6), 0 0 0 1px rgba(139, 127, 199, 0.2)',
    ),
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  }

  // Parallax transform
  const parallaxTransform = parallax ? `translateY(${scrollY * 0.05}px)` : 'none'

  return (
    <motion.div
      ref={cardRef}
      initial="hidden"
      animate={controls}
      variants={animationVariants[animation]}
      style={{
        transform: parallaxTransform,
        willChange: parallax ? 'transform' : 'auto',
        position: 'relative',
        zIndex: 1, // Ensure stacking context is clean

        // Negative margin + positive padding creates "invisible canvas" for shadow/scale
        margin: '-12px',
        padding: '12px',

        // Compensate for negative margin in grid/flex layouts
        width: 'calc(100% + 24px)',
      }}
      transition={{
        delay: delay + staggerDelay * index,
        duration,
      }}
    >
      <motion.div
        whileHover={hoverEffects}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        // Force initial shadow state to prevent interpolation snap
        initial={{ boxShadow: '0 0 0 0 rgba(0,0,0,0)' }}
        style={{
          width: '100%',
          borderRadius: '1rem', // Match GlassCard's xl border radius (1rem)

          // GPU Layer promotion - prevents filter/transform conflicts
          transform: 'translateZ(0)',

          // Smooth scale transitions
          backfaceVisibility: 'hidden',

          // Optimize for expected changes
          willChange: 'transform, box-shadow',

          // Fix Safari/Chrome transparency stacking
          isolation: 'isolate',

          // Prevent layer snap - force constant anti-aliasing
          outline: '1px solid transparent',
        }}
      >
        <GlassCard {...boxProps}>{children}</GlassCard>
      </motion.div>
    </motion.div>
  )
}

// Specialized variants for common card layouts

// Card that reveals on scroll from bottom
export const ScrollRevealCard = (props: AnimatedCardProps) => (
  <AnimatedCard animation="fadeInUp" {...props} />
)

// Card with slide animations for alternating layouts
export const SlideInCard = ({
  alternate,
  index = 0,
  ...props
}: AnimatedCardProps & { alternate?: boolean }) => (
  <AnimatedCard
    animation={alternate && index % 2 === 1 ? 'slideFromRight' : 'slideFromLeft'}
    {...props}
  />
)

// Card grid with staggered reveals
export const StaggeredCardGrid = ({
  children,
  staggerDelay = 0.15,
  animation = 'fadeInUp',
}: {
  children: React.ReactNode
  staggerDelay?: number
  animation?: AnimatedCardProps['animation']
}) => {
  return React.Children.map(children, (child, index) => {
    if (React.isValidElement(child) && child.type === AnimatedCard) {
      return React.cloneElement(child as React.ReactElement<AnimatedCardProps>, {
        staggerDelay,
        index,
        animation: animation,
        delay: 0,
      })
    }
    return child
  })
}

export default AnimatedCard

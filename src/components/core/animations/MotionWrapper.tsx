import { motion, Variants, TargetAndTransition } from 'framer-motion'
import { ReactNode } from 'react'

// Animation presets for consistent behavior
export const animationVariants = {
  fadeInUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
  fadeInDown: {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  },
  fadeInLeft: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  },
  fadeInRight: {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  },
  slideInFromBottom: {
    hidden: { y: '100%' },
    visible: { y: 0 },
  },
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  },
  staggerItem: {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  },
}

interface MotionWrapperProps {
  children: ReactNode
  variant?: keyof typeof animationVariants
  custom?: Variants
  className?: string
  delay?: number
  duration?: number
  once?: boolean
  whileHover?: TargetAndTransition
  whileTap?: TargetAndTransition
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initial?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  animate?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exit?: any
  viewport?: unknown
}

export const MotionWrapper = ({
  children,
  variant = 'fadeInUp',
  custom,
  className,
  delay = 0,
  duration = 0.3,
  once = true,
  whileHover,
  whileTap,
  initial = 'hidden',
  animate = 'visible',
  exit,
  viewport = { once, margin: '-10%' },
  ...props
}: MotionWrapperProps) => {
  const transition = {
    duration,
    delay,
    ease: [0.25, 0.46, 0.45, 0.94], // Custom smooth easing
  }

  return (
    <motion.div
      className={className}
      variants={custom || animationVariants[variant]}
      initial={initial}
      animate={animate}
      exit={exit}
      whileHover={whileHover}
      whileTap={whileTap}
      transition={transition}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      viewport={viewport as any}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Specialized wrapper for stagger animations
export const StaggerContainer = ({
  children,
  className,
  ...props
}: {
  children: ReactNode
  className?: string
} & MotionWrapperProps) => (
  <MotionWrapper className={className} custom={animationVariants.staggerContainer} {...props}>
    {children}
  </MotionWrapper>
)

// Specialized wrapper for stagger items
export const StaggerItem = ({
  children,
  className,
  ...props
}: {
  children: ReactNode
  className?: string
} & MotionWrapperProps) => (
  <MotionWrapper
    className={className}
    custom={animationVariants.staggerItem}
    initial="hidden"
    animate="visible"
    {...props}
  >
    {children}
  </MotionWrapper>
)

// Quick-use components for common patterns
export const FadeInWhenVisible = ({ children, ...props }: MotionWrapperProps) => (
  <MotionWrapper variant="fadeInUp" {...props}>
    {children}
  </MotionWrapper>
)

export const ScaleInWhenVisible = ({ children, ...props }: MotionWrapperProps) => (
  <MotionWrapper variant="scaleIn" {...props}>
    {children}
  </MotionWrapper>
)

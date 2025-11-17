import React, { useState, useEffect, useRef } from 'react'
import { Box } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useColorModeValue } from '@chakra-ui/react'

/**
 * Particle System Components
 * Creates animated particle effects for success feedback
 */

interface ParticleProps {
  x: number
  y: number
  size: number
  color: string
  duration: number
  delay: number
  type?: 'circle' | 'star' | 'spark' | 'heart'
}

const Particle: React.FC<ParticleProps> = ({
  x,
  y,
  size,
  color,
  duration,
  delay,
  type = 'circle',
}) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), (duration + delay) * 1000)
    return () => clearTimeout(timer)
  }, [duration, delay])

  if (!isVisible) return null

  const renderShape = () => {
    switch (type) {
      case 'star':
        return '✨'
      case 'spark':
        return '⚡'
      case 'heart':
        return '❤️'
      case 'circle':
      default:
        return '●'
    }
  }

  const randomX = Math.random() * 200 - 100 // -100 to 100
  const randomY = Math.random() * 200 - 100 // -100 to 100
  const randomScale = Math.random() * 0.5 + 0.5 // 0.5 to 1.0

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        fontSize: size,
        color: color,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
      initial={{
        opacity: 0,
        scale: 0,
        x: 0,
        y: 0,
        rotate: 0,
      }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0, randomScale, randomScale * 1.2, 0],
        x: [0, randomX * 0.3, randomX, randomX * 1.2],
        y: [0, randomY * 0.3, randomY, randomY * 1.2],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: duration,
        delay: delay,
        ease: [0.25, 0.46, 0.45, 0.94],
        opacity: { times: [0, 0.1, 0.9, 1] },
        scale: { times: [0, 0.2, 0.8, 1] },
      }}
    >
      {renderShape()}
    </motion.div>
  )
}

interface ParticleBurstProps {
  /** Position to emit particles from */
  position?: { x: number; y: number }
  /** Number of particles to create */
  count?: number
  /** Color scheme */
  colorScheme?: 'success' | 'primary' | 'accent' | 'warning'
  /** Size range for particles */
  sizeRange?: [number, number]
  /** Duration range for particles (seconds) */
  durationRange?: [number, number]
  /** Particle types to use */
  types?: ('circle' | 'star' | 'spark' | 'heart')[]
  /** Intensity/magnitude of the burst */
  intensity?: 'subtle' | 'medium' | 'intense'
}

const getColorScheme = (scheme: string) => {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  switch (scheme) {
    case 'success':
      return isDark ? '#48BB78' : '#38A169'
    case 'primary':
      return '#667eea'
    case 'accent':
      return '#764ba2'
    case 'warning':
      return isDark ? '#ED8936' : '#DD6B20'
    default:
      return '#667eea'
  }
}

const PARTICLE_CONFIGS = {
  subtle: { count: 8, sizeRange: [12, 16], durationRange: [2, 3.5] },
  medium: { count: 12, sizeRange: [14, 22], durationRange: [2.5, 4] },
  intense: { count: 16, sizeRange: [16, 28], durationRange: [3, 4.5] },
}

export const ParticleBurst: React.FC<ParticleBurstProps> = ({
  position = { x: window.innerWidth / 2, y: window.innerHeight / 2 },
  count,
  colorScheme = 'success',
  sizeRange,
  durationRange,
  types = ['star', 'circle', 'spark'],
  intensity = 'medium',
}) => {
  const [particles, setParticles] = useState<ParticleProps[]>([])
  const [isActive, setIsActive] = useState(false)

  const triggerBurst = () => {
    if (isActive) return // Prevent multiple simultaneous bursts

    setIsActive(true)

    const config = PARTICLE_CONFIGS[intensity] || PARTICLE_CONFIGS.medium
    const particleCount = count || config.count
    const [minSize, maxSize] = sizeRange || config.sizeRange
    const [minDuration, maxDuration] = durationRange || config.durationRange

    const newParticles: ParticleProps[] = Array.from({ length: particleCount }, (_, _i) => ({
      x: position.x,
      y: position.y,
      size: Math.random() * (maxSize - minSize) + minSize,
      color: getColorScheme(colorScheme),
      duration: Math.random() * (maxDuration - minDuration) + minDuration,
      delay: Math.random() * 0.3, // Stagger start times
      type: types[Math.floor(Math.random() * types.length)],
    }))

    setParticles(newParticles)

    // Clean up after longest particle duration + delay
    const cleanupTime = (Math.max(...newParticles.map((p) => p.duration + p.delay)) + 1) * 1000
    setTimeout(() => {
      setParticles([])
      setIsActive(false)
    }, cleanupTime)
  }

  useEffect(() => {
    triggerBurst()
  }, [])

  if (!isActive && particles.length === 0) return null

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      width="100vw"
      height="100vh"
      pointerEvents="none"
      zIndex={9999}
    >
      {particles.map((particle, index) => (
        <Particle key={`${particle.x}-${particle.y}-${index}`} {...particle} />
      ))}
    </Box>
  )
}

// Success celebration component for post creation/auth success
interface SuccessCelebrationProps {
  position?: { x: number; y: number }
  onComplete?: () => void
}

export const SuccessCelebration: React.FC<SuccessCelebrationProps> = ({ position, onComplete }) => {
  const [showParticles, setShowParticles] = useState(false)

  useEffect(() => {
    setShowParticles(true)

    const timer = setTimeout(() => {
      setShowParticles(false)
      onComplete?.()
    }, 5000) // Total animation time

    return () => clearTimeout(timer)
  }, [onComplete])

  if (!showParticles) return null

  return (
    <>
      {/* Main burst from center */}
      <ParticleBurst
        position={position}
        colorScheme="success"
        intensity="intense"
        types={['star', 'spark']}
      />

      {/* Secondary bursts with delay */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
        <ParticleBurst
          position={position ? { x: position.x + 20, y: position.y - 30 } : undefined}
          count={6}
          colorScheme="primary"
          intensity="medium"
          types={['circle']}
        />
      </motion.div>
    </>
  )
}

// Floating success notification with particles
interface FloatingNotificationProps {
  message: string
  onComplete?: () => void
  position?: 'top' | 'bottom'
}

export const FloatingNotification: React.FC<FloatingNotificationProps> = ({
  message,
  onComplete,
  position = 'top',
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const notificationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onComplete || (() => {}), 300)
    }, 3000) // Show for 3 seconds

    return () => clearTimeout(timer)
  }, [onComplete])

  if (!isVisible) return null

  return (
    <motion.div
      ref={notificationRef}
      initial={{
        opacity: 0,
        y: position === 'top' ? -50 : 50,
        scale: 0.8,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        y: position === 'top' ? -20 : 20,
        scale: 0.95,
      }}
      style={{
        position: 'fixed',
        [position]: '60px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10000,
      }}
    >
      <Box
        bg={useColorModeValue('white', 'gray.800')}
        color={useColorModeValue('gray.900', 'white')}
        px={6}
        py={4}
        rounded="lg"
        shadow="lg"
        border="1px"
        borderColor={useColorModeValue('gray.200', 'gray.600')}
        fontWeight="medium"
        textAlign="center"
      >
        {message}
      </Box>
    </motion.div>
  )
}

// Global particle system manager
class ParticleSystem {
  private static instance: ParticleSystem
  private container: HTMLElement | null = null

  static getInstance(): ParticleSystem {
    if (!ParticleSystem.instance) {
      ParticleSystem.instance = new ParticleSystem()
    }
    return ParticleSystem.instance
  }

  showSuccessParticles(position?: { x: number; y: number }) {
    if (!this.container) {
      this.container = document.createElement('div')
      this.container.id = 'particle-system-container'
      this.container.style.position = 'fixed'
      this.container.style.top = '0'
      this.container.style.left = '0'
      this.container.style.width = '100vw'
      this.container.style.height = '100vh'
      this.container.style.pointerEvents = 'none'
      this.container.style.zIndex = '9999'
      document.body.appendChild(this.container)
    }

    const center = position || {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    }

    // Create and append React component to DOM
    import('react-dom/client').then(({ createRoot }) => {
      const root = createRoot(this.container!)
      root.render(
        <ParticleBurst
          position={center}
          colorScheme="success"
          intensity="medium"
          types={['star', 'spark', 'circle']}
        />,
      )

      // Clean up after animation
      setTimeout(() => {
        root.unmount()
      }, 5000)
    })
  }

  showFloatingNotification(message: string, duration = 3000) {
    const container = document.createElement('div')
    document.body.appendChild(container)

    import('react-dom/client').then(({ createRoot }) => {
      const root = createRoot(container)
      root.render(
        <FloatingNotification
          message={message}
          onComplete={() => {
            setTimeout(() => {
              root.unmount()
              container.remove()
            }, 300)
          }}
        />,
      )
    })

    setTimeout(() => {
      if (container.parentNode) {
        container.style.opacity = '0'
        setTimeout(() => container.remove(), 300)
      }
    }, duration)
  }
}

// Export singleton instance for easy access
export const particleSystem = ParticleSystem.getInstance()

// Convenience hooks and utilities
export const useSuccessParticles = () => {
  const [isActive, setIsActive] = useState(false)

  const triggerSuccess = (position?: { x: number; y: number }) => {
    setIsActive(true)
    particleSystem.showSuccessParticles(position)

    setTimeout(() => setIsActive(false), 100)
  }

  return { triggerSuccess, isActive }
}

export const useFloatingNotification = () => {
  const showNotification = (message: string, duration = 3000) => {
    particleSystem.showFloatingNotification(message, duration)
  }

  return { showNotification }
}

export default {
  ParticleBurst,
  SuccessCelebration,
  FloatingNotification,
  particleSystem,
  useSuccessParticles,
  useFloatingNotification,
}

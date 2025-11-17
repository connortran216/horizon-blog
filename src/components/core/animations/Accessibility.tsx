import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import {
  Box,
  Button,
  ButtonProps,
  Switch,
  Text,
  VStack,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { motion, Transition } from 'framer-motion'

interface AnimationProps {
  animate?: Record<string, unknown>
  transition?: Transition
  whileHover?: Record<string, unknown> | string
  whileTap?: Record<string, unknown> | string
}

// Animation preference context
interface AnimationPreferences {
  reducedMotion: boolean
  showParticles: boolean
  showShimmers: boolean
  scale: number
  animationSpeed: number
}

interface AccessibilityContextType {
  preferences: AnimationPreferences
  updatePreferences: (updates: Partial<AnimationPreferences>) => void
  motionSafe: boolean // Helper for components
  animationProps: AnimationProps
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext)
  if (!context) {
    // Fallback when context not available
    return {
      preferences: {
        reducedMotion: false,
        showParticles: true,
        showShimmers: true,
        scale: 1,
        animationSpeed: 1,
      },
      updatePreferences: () => {},
      motionSafe: true,
      animationProps: {},
    }
  }
  return context
}

// Global animation settings hook that respects user preferences
export const useAnimationProps = (baseProps: AnimationProps = {}) => {
  const { motionSafe, preferences } = useAccessibility()

  if (!motionSafe) {
    // Minimal or no animations when reduced motion is preferred
    return {
      ...baseProps,
      animate: { opacity: 1 }, // Just ensure elements are visible
      transition: { duration: 0.1 } as Transition, // Very fast transition
    }
  }

  // Scale animations for user speed preference
  const scaledDuration = (duration: number) => duration * preferences.animationSpeed
  const scaledTransition =
    baseProps.transition &&
    typeof baseProps.transition === 'object' &&
    'duration' in baseProps.transition &&
    typeof baseProps.transition.duration === 'number'
      ? { ...baseProps.transition, duration: scaledDuration(baseProps.transition.duration) }
      : baseProps.transition

  return {
    ...baseProps,
    transition: scaledTransition,
    whileHover: preferences.scale > 0 ? baseProps.whileHover : undefined,
    whileTap: preferences.scale > 0 ? baseProps.whileTap : undefined,
  }
}

// Enhanced focus component with accessible animations
interface FocusRingProps {
  children: ReactNode
  showRing?: boolean
  ringColor?: string
}

export const FocusRing: React.FC<FocusRingProps> = ({ children, showRing = true, ringColor }) => {
  const { motionSafe } = useAccessibility()
  const defaultRingColor = useColorModeValue('blue.500', 'purple.300')

  return (
    <Box
      as={motion.div}
      whileFocus={{
        scale: motionSafe ? 1.02 : 1,
        transition: { type: 'spring', stiffness: 400, damping: 17 },
      }}
      _focusVisible={{
        outline: '2px solid',
        outlineColor: ringColor || defaultRingColor,
        outlineOffset: '2px',
        boxShadow: showRing ? `0 0 0 2px ${ringColor || defaultRingColor}` : undefined,
      }}
      transition={undefined} // Explicitly set to avoid conflicts
    >
      {children}
    </Box>
  )
}

// Animated button with accessibility features
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
  const { transition: _transition, ...animationProps } = useAnimationProps(motionProps)

  return (
    <FocusRing showRing={focusRing}>
      <Button
        as={motion.button}
        transition={undefined} // Explicitly set to avoid conflicts
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

// Accessibility settings panel
interface AccessibilityPanelProps {
  isOpen: boolean
  onClose: () => void
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

export const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({
  isOpen,
  onClose,
  position = 'bottom-right',
}) => {
  const { preferences, updatePreferences } = useAccessibility()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const positionStyles = {
    'top-left': { top: 4, left: 4 },
    'top-right': { top: 4, right: 4 },
    'bottom-left': { bottom: 4, left: 4 },
    'bottom-right': { bottom: 4, right: 4 },
  }

  if (!isOpen) return null

  return (
    <Box
      position="fixed"
      {...positionStyles[position]}
      zIndex={9999}
      bg={bgColor}
      p={4}
      borderRadius="lg"
      boxShadow="lg"
      border="1px"
      borderColor={borderColor}
      minW="300px"
    >
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Text fontWeight="bold" fontSize="lg">
            Animation Settings
          </Text>
          <Button size="sm" variant="ghost" onClick={onClose}>
            ✕
          </Button>
        </HStack>

        <VStack spacing={3} align="stretch">
          <HStack justify="space-between">
            <Text fontSize="sm">Reduce Motion</Text>
            <Switch
              isChecked={preferences.reducedMotion}
              onChange={(e) => updatePreferences({ reducedMotion: e.target.checked })}
              colorScheme="purple"
            />
          </HStack>

          <HStack justify="space-between">
            <Text fontSize="sm">Particle Effects</Text>
            <Switch
              isChecked={preferences.showParticles}
              onChange={(e) => updatePreferences({ showParticles: e.target.checked })}
              colorScheme="purple"
            />
          </HStack>

          <HStack justify="space-between">
            <Text fontSize="sm">Loading Shimmers</Text>
            <Switch
              isChecked={preferences.showShimmers}
              onChange={(e) => updatePreferences({ showShimmers: e.target.checked })}
              colorScheme="purple"
            />
          </HStack>

          <HStack justify="space-between">
            <Text fontSize="sm">Hover Effects</Text>
            <Switch
              isChecked={preferences.scale > 0}
              onChange={(e) => updatePreferences({ scale: e.target.checked ? 1 : 0 })}
              colorScheme="purple"
            />
          </HStack>

          <HStack justify="space-between" align="center">
            <Text fontSize="sm">Animation Speed</Text>
            <HStack>
              <Button
                size="xs"
                variant="outline"
                onClick={() =>
                  updatePreferences({
                    animationSpeed: Math.max(0.5, preferences.animationSpeed - 0.25),
                  })
                }
                isDisabled={preferences.animationSpeed <= 0.5}
              >
                -
              </Button>
              <Text fontSize="xs" minW="50px" textAlign="center">
                {preferences.animationSpeed.toFixed(1)}x
              </Text>
              <Button
                size="xs"
                variant="outline"
                onClick={() =>
                  updatePreferences({
                    animationSpeed: Math.min(2, preferences.animationSpeed + 0.25),
                  })
                }
                isDisabled={preferences.animationSpeed >= 2}
              >
                +
              </Button>
            </HStack>
          </HStack>
        </VStack>

        <Button size="sm" colorScheme="purple" onClick={onClose}>
          Done
        </Button>
      </VStack>
    </Box>
  )
}

// Accessibility settings toggle button
interface AccessibilityToggleProps {
  onToggle: () => void
  isOpen: boolean
}

export const AccessibilityToggle: React.FC<AccessibilityToggleProps> = ({ onToggle, isOpen }) => {
  const { motionSafe } = useAccessibility()

  return (
    <Box position="fixed" bottom={isOpen ? 16 : 4} right={4} zIndex={10000}>
      <FocusRing showRing={false}>
        <Button
          as={motion.button}
          onClick={onToggle}
          position="fixed"
          bottom={4}
          right={4}
          size="lg"
          rounded="full"
          bg="purple.500"
          _hover={{ bg: 'purple.600' }}
          color="white"
          boxShadow="lg"
          animate={
            motionSafe
              ? {
                  scale: isOpen ? 0.8 : 1,
                  y: isOpen ? -260 : 0, // Move up when panel is open
                }
              : undefined
          }
          transition={undefined} // Explicitly set to avoid conflicts
        >
          <Box transform={isOpen ? 'rotate(45deg)' : 'none'} transition="transform 0.2s">
            {isOpen ? '✕' : '♿'}
          </Box>
        </Button>
      </FocusRing>
    </Box>
  )
}

// Main accessibility provider
interface AccessibilityProviderProps {
  children: ReactNode
  enablePanel?: boolean // Whether to show the settings panel toggle
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({
  children,
  enablePanel = false,
}) => {
  const [preferences, setPreferences] = useState<AnimationPreferences>(() => {
    // Check for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const saved = localStorage.getItem('horizon-blog-accessibility')

    const defaultPreferences: AnimationPreferences = {
      reducedMotion: mediaQuery.matches,
      showParticles: true,
      showShimmers: true,
      scale: 1,
      animationSpeed: 1,
    }

    if (saved) {
      const parsed = JSON.parse(saved)
      return { ...defaultPreferences, ...parsed }
    }

    return defaultPreferences
  })

  const [panelOpen, setPanelOpen] = useState(false)

  // Update preferences with localStorage persistence
  const updatePreferences = (updates: Partial<AnimationPreferences>) => {
    const newPreferences = { ...preferences, ...updates }
    setPreferences(newPreferences)
    localStorage.setItem('horizon-blog-accessibility', JSON.stringify(newPreferences))
  }

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const handleChange = (e: MediaQueryListEvent) => {
      updatePreferences({ reducedMotion: e.matches })
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Derived values
  const _motionSafe = !preferences.reducedMotion
  const animationProps = useAnimationProps()

  const value: AccessibilityContextType = {
    preferences,
    updatePreferences,
    motionSafe: _motionSafe,
    animationProps,
  }

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      {enablePanel && (
        <>
          <AccessibilityToggle onToggle={() => setPanelOpen(!panelOpen)} isOpen={panelOpen} />
          <AccessibilityPanel isOpen={panelOpen} onClose={() => setPanelOpen(false)} />
        </>
      )}
    </AccessibilityContext.Provider>
  )
}

export default {
  useAccessibility,
  useAnimationProps,
  FocusRing,
  AccessibleButton,
  AccessibilityPanel,
  AccessibilityToggle,
  AccessibilityProvider,
}

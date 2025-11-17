import { Box, BoxProps, useColorModeValue } from '@chakra-ui/react'

/**
 * Glassmorphism Component - Creates frosted glass effects
 *
 * Provides a semi-transparent, blurred background similar to iOS glassmorphism
 * with subtle borders and depth. Perfect for overlays, modals, and elevated UI.
 */

interface GlassmorphismProps extends BoxProps {
  /** Glass intensity: 'light' (subtle) | 'medium' | 'heavy' (strong blur) */
  intensity?: 'light' | 'medium' | 'heavy'
  /** Optional custom backdrop blur value */
  blur?: string
}

export const Glassmorphism = ({
  children,
  intensity = 'medium',
  blur,
  ...boxProps
}: GlassmorphismProps) => {
  // Adaptive colors for light/dark modes
  const glassBgLight = {
    light: 'rgba(255, 255, 255, 0.12)',
    medium: 'rgba(255, 255, 255, 0.18)',
    heavy: 'rgba(255, 255, 255, 0.25)',
  }

  const glassBgDark = {
    light: 'rgba(30, 30, 30, 0.15)',
    medium: 'rgba(30, 30, 30, 0.25)',
    heavy: 'rgba(30, 30, 30, 0.35)',
  }

  const glassBorderLight = {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.15)',
    heavy: 'rgba(255, 255, 255, 0.2)',
  }

  const glassBorderDark = {
    light: 'rgba(0, 0, 0, 0.05)',
    medium: 'rgba(0, 0, 0, 0.1)',
    heavy: 'rgba(0, 0, 0, 0.15)',
  }

  // Blur intensity
  const blurValues = {
    light: '8px',
    medium: '12px',
    heavy: '20px',
  }

  // Get current mode values
  const bgColor = useColorModeValue(glassBgLight[intensity], glassBgDark[intensity])

  const borderColor = useColorModeValue(glassBorderLight[intensity], glassBorderDark[intensity])

  const backdropBlur = blur || blurValues[intensity]

  return (
    <Box
      backdropFilter={`blur(${backdropBlur})`}
      backgroundColor={bgColor}
      border={intensity !== 'light' ? '1px solid' : undefined}
      borderColor={borderColor}
      borderRadius="lg"
      boxShadow={intensity === 'heavy' ? 'xl' : 'lg'}
      // Safari fallback (older versions don't support backdrop-filter)
      _webkitBackdropFilter={`blur(${backdropBlur})`}
      {...boxProps}
    >
      {children}
    </Box>
  )
}

// Specialized Glass components for common use cases

interface GlassCardProps extends GlassmorphismProps {
  p?: number
}

export const GlassCard = ({ children, p = 6, ...props }: GlassCardProps) => (
  <Glassmorphism p={p} borderRadius="xl" {...props}>
    {children}
  </Glassmorphism>
)

interface GlassModalProps extends GlassmorphismProps {
  maxW?: string
}

export const GlassModal = ({ children, maxW = 'lg', p = 8, ...props }: GlassModalProps) => (
  <Glassmorphism maxW={maxW} mx="auto" p={p} intensity="heavy" {...props}>
    {children}
  </Glassmorphism>
)

interface GlassOverlayProps extends GlassmorphismProps {
  onClick?: () => void
}

export const GlassOverlay = ({
  children,
  onClick,
  position = 'fixed',
  top = 0,
  left = 0,
  right = 0,
  bottom = 0,
  zIndex = 1000,
  display = 'flex',
  alignItems = 'center',
  justifyContent = 'center',
  ...props
}: GlassOverlayProps) => (
  <Glassmorphism
    position={position}
    top={top}
    left={left}
    right={right}
    bottom={bottom}
    zIndex={zIndex}
    display={display}
    alignItems={alignItems}
    justifyContent={justifyContent}
    onClick={onClick}
    cursor={onClick ? 'pointer' : undefined}
    intensity="light"
    {...props}
  >
    {children}
  </Glassmorphism>
)

export default Glassmorphism

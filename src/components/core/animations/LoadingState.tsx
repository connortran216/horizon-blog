import { Box, BoxProps, HStack, Text, VStack, usePrefersReducedMotion } from '@chakra-ui/react'
import { motion } from 'framer-motion'

type LoadingStateVariant = 'screen' | 'page' | 'panel' | 'inline'
type LoadingSignalSize = 'sm' | 'md' | 'lg'

interface LoadingSignalProps {
  size?: LoadingSignalSize
}

interface LoadingStateProps extends Omit<BoxProps, 'children'> {
  variant?: LoadingStateVariant
  label?: string
  description?: string
  size?: LoadingSignalSize
  showGlow?: boolean
}

const signalSizes: Record<LoadingSignalSize, { barWidth: number; gap: number; heights: number[] }> =
  {
    sm: {
      barWidth: 6,
      gap: 5,
      heights: [16, 24, 18],
    },
    md: {
      barWidth: 8,
      gap: 6,
      heights: [22, 34, 24],
    },
    lg: {
      barWidth: 10,
      gap: 8,
      heights: [28, 42, 32],
    },
  }

export const LoadingSignal = ({ size = 'md' }: LoadingSignalProps) => {
  const prefersReducedMotion = usePrefersReducedMotion()
  const config = signalSizes[size]

  return (
    <HStack gap={`${config.gap}px`} align="end" justify="center" aria-hidden="true">
      {config.heights.map((height, index) => (
        <motion.span
          key={height}
          initial={prefersReducedMotion ? false : { opacity: 0.4, scaleY: 0.84, y: 6 }}
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  opacity: [0.4, 1, 0.56],
                  scaleY: [0.84, 1.08, 0.9],
                  y: [6, -4, 4],
                }
          }
          transition={
            prefersReducedMotion
              ? undefined
              : {
                  duration: 1.45,
                  delay: index * 0.14,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
          }
          style={{
            display: 'block',
            width: `${config.barWidth}px`,
            height: `${height}px`,
            borderRadius: '999px',
            transformOrigin: 'center bottom',
            background:
              'linear-gradient(180deg, var(--chakra-colors-loading-stroke) 0%, var(--chakra-colors-action-primary) 100%)',
            boxShadow:
              '0 0 0 1px var(--chakra-colors-loading-track), 0 12px 28px var(--chakra-colors-loading-glow)',
          }}
        />
      ))}
    </HStack>
  )
}

export const LoadingState = ({
  variant = 'page',
  label = 'Loading',
  description,
  size = 'md',
  showGlow = true,
  minH,
  ...rest
}: LoadingStateProps) => {
  const layoutMinHeight =
    minH ??
    ({
      screen: '100vh',
      page: '50vh',
      panel: '320px',
      inline: 'auto',
    }[variant] as BoxProps['minH'])

  const isInline = variant === 'inline'
  const isPanel = variant === 'panel'

  const copy = (
    <VStack
      spacing={description ? 2 : 0}
      align={isInline ? 'start' : 'center'}
      textAlign={isInline ? 'left' : 'center'}
      maxW="32rem"
    >
      <Text
        color="text.primary"
        fontSize={isInline ? 'sm' : { base: 'lg', md: 'xl' }}
        fontWeight="semibold"
        letterSpacing={isInline ? 'normal' : '-0.02em'}
      >
        {label}
      </Text>

      {description ? (
        <Text color="text.secondary" fontSize={isInline ? 'sm' : 'md'} lineHeight="tall">
          {description}
        </Text>
      ) : null}
    </VStack>
  )

  const indicator = (
    <Box position="relative">
      {showGlow ? (
        <Box
          position="absolute"
          inset="-20%"
          bg="loading.glow"
          filter="blur(32px)"
          opacity={0.9}
          pointerEvents="none"
        />
      ) : null}

      <Box
        position="relative"
        px={{ base: 5, md: 6 }}
        py={{ base: 4, md: 5 }}
        borderRadius="full"
        border="1px solid"
        borderColor="border.subtle"
        bg="bg.glass"
        backdropFilter="blur(18px)"
        boxShadow="0 18px 44px rgba(0, 0, 0, 0.14)"
      >
        <LoadingSignal size={size} />
      </Box>
    </Box>
  )

  if (isInline) {
    return (
      <HStack gap={4} align="center" color="text.secondary" {...rest}>
        {indicator}
        {copy}
      </HStack>
    )
  }

  return (
    <Box
      position="relative"
      minH={layoutMinHeight}
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={{ base: 6, md: 8 }}
      py={{ base: 10, md: 12 }}
      border={isPanel ? '1px solid' : undefined}
      borderColor={isPanel ? 'border.subtle' : undefined}
      borderRadius={isPanel ? '3xl' : undefined}
      bg={isPanel ? 'bg.glass' : undefined}
      backdropFilter={isPanel ? 'blur(18px)' : undefined}
      boxShadow={isPanel ? '0 20px 44px rgba(0, 0, 0, 0.22)' : undefined}
      {...rest}
    >
      <VStack spacing={6} align="center">
        {indicator}
        {copy}
      </VStack>
    </Box>
  )
}

export const LoadingScreen = (props: Omit<LoadingStateProps, 'variant'>) => (
  <LoadingState variant="screen" {...props} />
)

export const LoadingPanel = (props: Omit<LoadingStateProps, 'variant'>) => (
  <LoadingState variant="panel" {...props} />
)

export default LoadingState

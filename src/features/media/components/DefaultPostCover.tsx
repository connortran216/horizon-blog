import { useState } from 'react'
import { Box, BoxProps, HStack, Text, VStack } from '@chakra-ui/react'
import { motion, useReducedMotion } from 'framer-motion'

export type DefaultPostCoverStyle = 'editorial' | 'aurora' | 'notebook'

export const DEFAULT_POST_COVER_STYLE: DefaultPostCoverStyle = 'editorial'

export const DEFAULT_POST_COVER_STYLE_OPTIONS: Array<{
  value: DefaultPostCoverStyle
  label: string
  description: string
}> = [
  {
    value: 'editorial',
    label: 'Editorial',
    description: 'Structured graphic cover with grid lines and accent motion.',
  },
  {
    value: 'aurora',
    label: 'Aurora',
    description: 'Softer gradient cover with layered accent glows.',
  },
  {
    value: 'notebook',
    label: 'Notebook',
    description: 'Subtle ruled-paper feel with a calmer archival pulse.',
  },
]

interface DefaultPostCoverProps extends BoxProps {
  title: string
  eyebrow?: string
  styleName?: DefaultPostCoverStyle
}

const FLOATING_PARTICLES = [
  { top: '18%', left: '16%', size: '12px', opacity: 0.3 },
  { top: '28%', left: '72%', size: '10px', opacity: 0.24 },
  { top: '62%', left: '34%', size: '14px', opacity: 0.22 },
  { top: '74%', left: '82%', size: '9px', opacity: 0.26 },
]

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min)

const buildParticleDrift = () =>
  FLOATING_PARTICLES.map((particle) => ({
    ...particle,
    duration: randomBetween(5.6, 9.4),
    delay: randomBetween(0, 1.4),
    x1: randomBetween(-30, 30),
    x2: randomBetween(-22, 22),
    y1: randomBetween(-24, 24),
    y2: randomBetween(-18, 18),
    scale1: randomBetween(0.82, 1.08),
    scale2: randomBetween(1.08, 1.45),
  }))

const DefaultPostCover = ({
  title: _title,
  eyebrow = 'Horizon blog',
  styleName = DEFAULT_POST_COVER_STYLE,
  ...boxProps
}: DefaultPostCoverProps) => {
  const prefersReducedMotion = useReducedMotion()
  const [particleDrift] = useState(buildParticleDrift)
  const particleElements = particleDrift.map((particle, index) => (
    <motion.div
      key={`${styleName}-${index}`}
      style={{
        position: 'absolute',
        top: particle.top,
        left: particle.left,
        width: particle.size,
        height: particle.size,
        borderRadius: '9999px',
        background: 'rgba(139, 127, 199, 0.42)',
        filter: 'blur(0.5px)',
        boxShadow: '0 0 18px rgba(139, 127, 199, 0.32)',
      }}
      animate={
        prefersReducedMotion
          ? undefined
          : {
              x: [0, particle.x1, particle.x2, 0],
              y: [0, particle.y1, particle.y2, 0],
              scale: [particle.scale1, particle.scale2, particle.scale1 * 0.96, particle.scale1],
              opacity: [particle.opacity * 0.75, particle.opacity, particle.opacity * 0.75],
            }
      }
      transition={
        prefersReducedMotion
          ? undefined
          : {
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }
      }
      initial={{ opacity: particle.opacity }}
    />
  ))
  const sweepBeam = (
    <motion.div
      style={{
        position: 'absolute',
        top: '-18%',
        left: '-28%',
        width: '36%',
        height: '150%',
        background:
          'linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,0.08), rgba(255,255,255,0))',
        transform: 'rotate(18deg)',
        filter: 'blur(6px)',
        pointerEvents: 'none',
      }}
      animate={prefersReducedMotion ? undefined : { x: ['0%', '260%'], opacity: [0, 0.42, 0] }}
      transition={
        prefersReducedMotion ? undefined : { duration: 5.4, repeat: Infinity, ease: 'easeInOut' }
      }
    />
  )

  if (styleName === 'aurora') {
    return (
      <Box
        position="relative"
        overflow="hidden"
        bgGradient="linear(to-br, #16161d 0%, #232330 50%, #2d2440 100%)"
        {...boxProps}
      >
        <motion.div
          style={{
            position: 'absolute',
            top: '-10%',
            right: '-8%',
            width: '46%',
            height: '46%',
            borderRadius: '9999px',
            background: 'rgba(139, 127, 199, 0.28)',
            filter: 'blur(18px)',
          }}
          animate={prefersReducedMotion ? undefined : { x: [0, -18, 0], y: [0, 14, 0] }}
          transition={
            prefersReducedMotion ? undefined : { duration: 10, repeat: Infinity, ease: 'easeInOut' }
          }
        />
        <motion.div
          style={{
            position: 'absolute',
            bottom: '-12%',
            left: '-6%',
            width: '42%',
            height: '42%',
            borderRadius: '9999px',
            background: 'rgba(122, 162, 247, 0.18)',
            filter: 'blur(24px)',
          }}
          animate={prefersReducedMotion ? undefined : { x: [0, 16, 0], y: [0, -12, 0] }}
          transition={
            prefersReducedMotion ? undefined : { duration: 12, repeat: Infinity, ease: 'easeInOut' }
          }
        />
        {particleElements}
        {sweepBeam}
        <VStack
          position="relative"
          align="stretch"
          justify="space-between"
          h="full"
          px={6}
          py={6}
          spacing={5}
        >
          <Text
            fontSize="xs"
            textTransform="uppercase"
            letterSpacing="0.16em"
            color="whiteAlpha.700"
          >
            {eyebrow}
          </Text>
          <Box alignSelf="flex-end" w="40%" h="2px" bg="whiteAlpha.300" />
        </VStack>
      </Box>
    )
  }

  if (styleName === 'notebook') {
    return (
      <Box
        position="relative"
        overflow="hidden"
        bg="bg.secondary"
        backgroundImage="linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)"
        backgroundSize="100% 28px"
        {...boxProps}
      >
        <Box
          position="absolute"
          top={0}
          bottom={0}
          left="22%"
          w="1px"
          bg="rgba(139, 127, 199, 0.35)"
        />
        {sweepBeam}
        <motion.div
          style={{
            position: 'absolute',
            insetInline: 0,
            top: '12%',
            height: '36%',
            background: 'linear-gradient(180deg, rgba(139, 127, 199, 0.12), transparent)',
          }}
          animate={prefersReducedMotion ? undefined : { y: [0, 10, 0], opacity: [0.22, 0.3, 0.22] }}
          transition={
            prefersReducedMotion ? undefined : { duration: 9, repeat: Infinity, ease: 'easeInOut' }
          }
        />
        {particleElements}
        <VStack
          position="relative"
          align="stretch"
          justify="space-between"
          h="full"
          px={6}
          py={6}
          spacing={5}
        >
          <HStack justify="space-between">
            <Text
              fontSize="xs"
              textTransform="uppercase"
              letterSpacing="0.16em"
              color="text.tertiary"
            >
              {eyebrow}
            </Text>
            <Box w="28px" h="2px" bg="action.primary" borderRadius="full" />
          </HStack>
          <Box alignSelf="flex-end" w="34%" h="2px" bg="rgba(255,255,255,0.12)" />
        </VStack>
      </Box>
    )
  }

  return (
    <Box
      position="relative"
      overflow="hidden"
      bgGradient="linear(to-br, #1f2026 0%, #25262d 55%, #2f313b 100%)"
      {...boxProps}
    >
      <motion.div
        style={{
          position: 'absolute',
          top: '22px',
          left: '22px',
          width: '74px',
          height: '74px',
          borderRadius: '9999px',
          border: '1px solid rgba(139, 127, 199, 0.2)',
          background: 'rgba(139, 127, 199, 0.08)',
          boxShadow: '0 0 28px rgba(139, 127, 199, 0.14)',
          pointerEvents: 'none',
        }}
        animate={
          prefersReducedMotion
            ? undefined
            : {
                x: [0, 18, 6, 0],
                y: [0, 10, -8, 0],
                scale: [1, 1.08, 0.96, 1],
                opacity: [0.85, 1, 0.78, 0.85],
              }
        }
        transition={
          prefersReducedMotion
            ? undefined
            : {
                duration: 8.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }
        }
      />
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.16,
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
        animate={prefersReducedMotion ? undefined : { x: [0, 12, 0], y: [0, -8, 0] }}
        transition={
          prefersReducedMotion ? undefined : { duration: 9, repeat: Infinity, ease: 'easeInOut' }
        }
      />
      <motion.div
        style={{
          position: 'absolute',
          left: '-10%',
          right: '-10%',
          bottom: '-18%',
          height: '42%',
          background: 'rgba(139, 127, 199, 0.12)',
          filter: 'blur(22px)',
        }}
        animate={prefersReducedMotion ? undefined : { x: [0, 18, 0], y: [0, -10, 0] }}
        transition={
          prefersReducedMotion ? undefined : { duration: 11, repeat: Infinity, ease: 'easeInOut' }
        }
      />
      {particleElements}
      {sweepBeam}
      <Box
        position="absolute"
        top={5}
        right={5}
        px={3}
        py={1.5}
        borderRadius="full"
        bg="rgba(255,255,255,0.08)"
        border="1px solid rgba(255,255,255,0.08)"
      >
        <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="whiteAlpha.700">
          {eyebrow}
        </Text>
      </Box>
      <VStack
        position="relative"
        align="stretch"
        justify="space-between"
        h="full"
        px={6}
        py={6}
        spacing={5}
      >
        <Box />
        <Box alignSelf="flex-end" w="42%" h="2px" bg="whiteAlpha.300" />
      </VStack>
    </Box>
  )
}

export default DefaultPostCover

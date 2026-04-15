import { Box, Button, Grid, HStack, Link, Stack, Text, useColorModeValue } from '@chakra-ui/react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { useEffect, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import { MotionWrapper } from '../../../core'
import { AboutFocusThread } from '../about.types'

interface AboutHeroProps {
  focusThreads: AboutFocusThread[]
}

const AUTO_ADVANCE_MS = 4600
const USER_PAUSE_MS = 5200

const headlineLines = ['A personal blog', 'shaped by engineering', 'and a quieter interface.']

const trajectoryLines = [
  { top: '16%', left: '18%', width: '40%', rotation: -5 },
  { top: '35%', left: '27%', width: '52%', rotation: -2 },
  { top: '61%', left: '22%', width: '46%', rotation: 4 },
] as const

const ambientProfiles = [
  {
    leftGlowOpacity: 0.76,
    leftGlowScale: 1.06,
    rightGlowOpacity: 0.34,
    rightGlowScale: 1.02,
    floorGlowOpacity: 0.2,
    floorGlowScale: 0.98,
    sweepOpacity: 0.48,
    ringOpacity: [0.5, 0.18],
  },
  {
    leftGlowOpacity: 0.62,
    leftGlowScale: 0.98,
    rightGlowOpacity: 0.46,
    rightGlowScale: 1.08,
    floorGlowOpacity: 0.26,
    floorGlowScale: 1.06,
    sweepOpacity: 0.38,
    ringOpacity: [0.34, 0.24],
  },
  {
    leftGlowOpacity: 0.54,
    leftGlowScale: 0.94,
    rightGlowOpacity: 0.58,
    rightGlowScale: 1.12,
    floorGlowOpacity: 0.32,
    floorGlowScale: 1.1,
    sweepOpacity: 0.34,
    ringOpacity: [0.26, 0.32],
  },
] as const

const AboutHero = ({ focusThreads }: AboutHeroProps) => {
  const prefersReducedMotion = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isUserPaused, setIsUserPaused] = useState(false)

  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const smoothPointerX = useSpring(pointerX, { stiffness: 120, damping: 24, mass: 0.75 })
  const smoothPointerY = useSpring(pointerY, { stiffness: 120, damping: 24, mass: 0.75 })

  const glowOffsetX = useTransform(smoothPointerX, [-1, 1], [-18, 18])
  const glowOffsetY = useTransform(smoothPointerY, [-1, 1], [12, -12])
  const lineOffsetX = useTransform(smoothPointerX, [-1, 1], [-8, 8])
  const lineOffsetY = useTransform(smoothPointerY, [-1, 1], [6, -6])

  const accentPalette = useColorModeValue(
    ['#5f7294', '#7280a2', '#6a86bc'],
    ['#7aa2f7', '#9aa3ff', '#8fc2ff'],
  ) as string[]
  const activeAccent = accentPalette[activeIndex] ?? accentPalette[0]
  const activeProfile = ambientProfiles[activeIndex] ?? ambientProfiles[0]

  const heroShellBg = useColorModeValue('rgba(255, 255, 255, 0.88)', 'rgba(35, 35, 38, 0.94)')
  const heroShellShadow = useColorModeValue(
    '0 26px 80px rgba(44, 62, 80, 0.08)',
    '0 26px 80px rgba(0, 0, 0, 0.28)',
  )
  const heroAmbientGradient = useColorModeValue(
    'linear(to-br, rgba(95, 114, 148, 0.05), transparent 30%, rgba(44, 62, 80, 0.04))',
    'linear(to-br, rgba(255, 255, 255, 0.03), transparent 30%, rgba(122, 162, 247, 0.04))',
  )
  const heroVignette = useColorModeValue(
    'linear-gradient(180deg, rgba(255, 255, 255, 0), rgba(250, 251, 255, 0.02) 48%, rgba(44, 62, 80, 0.05) 100%)',
    'linear-gradient(180deg, rgba(6, 10, 16, 0.02), rgba(6, 10, 16, 0.08) 48%, rgba(6, 10, 16, 0.2) 100%)',
  )
  const eyebrowColor = useColorModeValue('obsidian.text.lightTertiary', 'obsidian.text.tertiary')

  const leftGlowGradient = useColorModeValue(
    'radial-gradient(circle at center, rgba(122, 162, 247, 0.28), transparent 64%)',
    'radial-gradient(circle at center, rgba(122, 162, 247, 0.22), transparent 64%)',
  )
  const rightGlowGradient = useColorModeValue(
    'radial-gradient(circle at center, rgba(255, 255, 255, 0.16), transparent 62%)',
    'radial-gradient(circle at center, rgba(111, 140, 199, 0.18), transparent 62%)',
  )
  const floorGlowGradient = useColorModeValue(
    'radial-gradient(circle at center, rgba(95, 114, 148, 0.14), transparent 68%)',
    'radial-gradient(circle at center, rgba(71, 91, 130, 0.18), transparent 68%)',
  )
  const sceneSweep = useColorModeValue(
    'linear-gradient(106deg, transparent 22%, rgba(255, 255, 255, 0.12) 46%, transparent 68%)',
    'linear-gradient(106deg, transparent 22%, rgba(255, 255, 255, 0.08) 46%, transparent 68%)',
  )
  const sceneRingColor = useColorModeValue('rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.06)')
  const sceneLineBase = useColorModeValue('rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.08)')
  const sceneDustGradient = useColorModeValue(
    'radial-gradient(circle at center, rgba(255, 255, 255, 0.12) 0, rgba(255, 255, 255, 0) 56%)',
    'radial-gradient(circle at center, rgba(255, 255, 255, 0.08) 0, rgba(255, 255, 255, 0) 56%)',
  )
  const trackRuleBase = useColorModeValue('rgba(44, 62, 80, 0.08)', 'rgba(255, 255, 255, 0.08)')
  const trackMutedColor = useColorModeValue(
    'obsidian.text.lightSecondary',
    'obsidian.text.secondary',
  )
  const trackTitleMuted = useColorModeValue('rgba(44, 62, 80, 0.74)', 'rgba(255, 255, 255, 0.7)')

  useEffect(() => {
    if (!isUserPaused) return

    const timer = window.setTimeout(() => {
      setIsUserPaused(false)
    }, USER_PAUSE_MS)

    return () => window.clearTimeout(timer)
  }, [isUserPaused])

  useEffect(() => {
    if (prefersReducedMotion || isUserPaused || focusThreads.length <= 1) return

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % focusThreads.length)
    }, AUTO_ADVANCE_MS)

    return () => window.clearInterval(timer)
  }, [focusThreads.length, isUserPaused, prefersReducedMotion])

  const handlePointerMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return

    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2

    pointerX.set(x)
    pointerY.set(y)
  }

  const handlePointerLeave = () => {
    pointerX.set(0)
    pointerY.set(0)
  }

  const activateThread = (index: number) => {
    setActiveIndex(index)

    if (!prefersReducedMotion) {
      setIsUserPaused(true)
    }
  }

  const revealProps = prefersReducedMotion
    ? {
        initial: { opacity: 1, y: 0 },
        animate: { opacity: 1, y: 0 },
        duration: 0,
      }
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        duration: 0.55,
      }

  return (
    <MotionWrapper {...revealProps}>
      <Box
        position="relative"
        overflow="hidden"
        border="1px solid"
        borderColor="border.subtle"
        borderRadius={{ base: '3xl', lg: '36px' }}
        bg={heroShellBg}
        boxShadow={heroShellShadow}
        px={{ base: 5, md: 7, xl: 8 }}
        py={{ base: 5, md: 6, xl: 6 }}
        onMouseMove={handlePointerMove}
        onMouseLeave={handlePointerLeave}
      >
        <Box position="absolute" inset={0} bgGradient={heroAmbientGradient} pointerEvents="none" />
        <Box position="absolute" inset={0} background={heroVignette} pointerEvents="none" />

        <motion.div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: '-8%',
            x: glowOffsetX,
            y: glowOffsetY,
            pointerEvents: 'none',
          }}
        >
          <motion.div
            animate={{
              opacity: activeProfile.leftGlowOpacity,
              scale: activeProfile.leftGlowScale,
            }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute',
              top: '-16%',
              left: '-10%',
              width: '46%',
              height: '76%',
            }}
          >
            <Box position="absolute" inset={0} background={leftGlowGradient} />
          </motion.div>

          <motion.div
            animate={{
              opacity: activeProfile.rightGlowOpacity,
              scale: activeProfile.rightGlowScale,
            }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute',
              top: '-8%',
              right: '-4%',
              width: '36%',
              height: '62%',
            }}
          >
            <Box position="absolute" inset={0} background={rightGlowGradient} />
          </motion.div>

          <motion.div
            animate={{
              opacity: activeProfile.floorGlowOpacity,
              scale: activeProfile.floorGlowScale,
            }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute',
              bottom: '-22%',
              left: '18%',
              width: '54%',
              height: '44%',
            }}
          >
            <Box position="absolute" inset={0} background={floorGlowGradient} />
          </motion.div>

          <motion.div
            animate={{ opacity: activeProfile.ringOpacity[0], scale: activeProfile.rightGlowScale }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute',
              top: '-18%',
              right: '-6%',
              width: '30%',
              height: '56%',
            }}
          >
            <Box
              position="absolute"
              inset={0}
              border="1px solid"
              borderColor={sceneRingColor}
              borderRadius="full"
            />
          </motion.div>

          <motion.div
            animate={{ opacity: activeProfile.ringOpacity[1], scale: activeProfile.floorGlowScale }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute',
              top: '36%',
              left: '-10%',
              width: '34%',
              height: '54%',
            }}
          >
            <Box
              position="absolute"
              inset={0}
              border="1px solid"
              borderColor={sceneRingColor}
              borderRadius="full"
            />
          </motion.div>

          <Box
            position="absolute"
            top="8%"
            left="32%"
            w="18%"
            h="18%"
            background={sceneDustGradient}
            opacity={0.2}
            filter="blur(26px)"
          />
        </motion.div>

        {!prefersReducedMotion ? (
          <motion.div
            aria-hidden="true"
            animate={{ x: ['-120%', '128%'], opacity: [0, activeProfile.sweepOpacity, 0] }}
            transition={{
              duration: 10.5,
              repeat: Infinity,
              repeatDelay: 4,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              top: '-12%',
              left: '16%',
              width: '62%',
              height: '84%',
              background: sceneSweep,
              transform: 'skewX(-14deg)',
              pointerEvents: 'none',
            }}
          />
        ) : null}

        <motion.div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            x: lineOffsetX,
            y: lineOffsetY,
            pointerEvents: 'none',
          }}
        >
          {trajectoryLines.map((line, index) => {
            const isActive = index === activeIndex

            return (
              <motion.div
                key={line.top}
                style={{
                  position: 'absolute',
                  top: line.top,
                  left: line.left,
                  width: line.width,
                  transform: `rotate(${line.rotation}deg)`,
                  transformOrigin: 'left center',
                }}
              >
                <Box h="1px" w="100%" bg={sceneLineBase} opacity={isActive ? 0.32 : 0.14} />
                <Box
                  position="absolute"
                  inset={0}
                  h="2px"
                  background={`linear-gradient(90deg, ${activeAccent}, rgba(255, 255, 255, 0))`}
                  opacity={isActive ? 0.82 : 0.22}
                />
                <motion.div
                  animate={
                    prefersReducedMotion
                      ? { x: 0, opacity: isActive ? 0.9 : 0.22 }
                      : {
                          x: isActive ? ['0%', '72%', '0%'] : ['0%', '16%', '0%'],
                          opacity: isActive ? [0.42, 1, 0.42] : [0.12, 0.26, 0.12],
                        }
                  }
                  transition={{
                    duration: isActive ? 5.2 : 7.4,
                    repeat: prefersReducedMotion ? 0 : Infinity,
                    ease: 'easeInOut',
                    delay: index * 0.2,
                  }}
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    left: 0,
                    width: '18%',
                    height: '10px',
                    borderRadius: '999px',
                    background: `radial-gradient(circle at center, ${activeAccent}, rgba(255, 255, 255, 0))`,
                    filter: 'blur(4px)',
                  }}
                />
              </motion.div>
            )
          })}
        </motion.div>

        <Stack position="relative" spacing={{ base: 6, md: 7 }}>
          <Stack spacing={{ base: 5, md: 6 }} maxW={{ base: '100%', xl: '780px' }}>
            <Stack spacing={3}>
              <Text
                fontSize="xs"
                fontWeight="semibold"
                color={eyebrowColor}
                letterSpacing="0.2em"
                textTransform="uppercase"
              >
                About Horizon
              </Text>
              <Text
                fontSize={{ base: '4xl', md: '5xl', xl: '6xl' }}
                lineHeight={{ base: 1.02, md: 0.98 }}
                letterSpacing="-0.065em"
                fontWeight="bold"
                color="text.primary"
              >
                {headlineLines.map((line, index) => (
                  <Box
                    key={line}
                    as="span"
                    display="block"
                    overflow="hidden"
                    whiteSpace={{ base: 'normal', md: 'nowrap' }}
                  >
                    <motion.span
                      initial={
                        prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: '110%' }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.58,
                        delay: prefersReducedMotion ? 0 : 0.08 * index,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      style={{ display: 'block' }}
                    >
                      {line}
                    </motion.span>
                  </Box>
                ))}
              </Text>
            </Stack>

            <Stack spacing={4} maxW="2xl">
              <Text fontSize={{ base: 'lg', md: 'xl' }} color="text.secondary" lineHeight="tall">
                Horizon is where personal writing, backend experience, and interface craft meet. It
                is both a publishing space and a deliberate product surface for ideas that come from
                real work.
              </Text>
              <Text color="text.secondary" lineHeight="tall" maxW="31rem">
                The ambition is simple: make the writing worth returning to, then build an interface
                precise enough to hold it without noise.
              </Text>
            </Stack>

            <HStack spacing={5} flexWrap="wrap">
              <Button as={RouterLink} to="/blog" rightIcon={<FiArrowRight />}>
                Read the blog
              </Button>
              <Link
                as={RouterLink}
                to="/contact"
                color="link.default"
                fontWeight="semibold"
                _hover={{ color: 'link.hover', textDecoration: 'none' }}
              >
                Get in touch
              </Link>
            </HStack>
          </Stack>

          <Stack
            spacing={0}
            pt={{ base: 5, md: 6 }}
            borderTop="1px solid"
            borderColor="border.subtle"
          >
            <Text
              mb={{ base: 2, md: 3 }}
              fontSize="xs"
              fontWeight="semibold"
              color={eyebrowColor}
              letterSpacing="0.2em"
              textTransform="uppercase"
            >
              Editorial track
            </Text>

            <Grid
              templateColumns={{ base: '1fr', lg: 'repeat(3, minmax(0, 1fr))' }}
              gap={{ base: 0, lg: 6 }}
            >
              {focusThreads.map((thread, index) => {
                const isActive = index === activeIndex

                return (
                  <Box
                    key={thread.label}
                    as="button"
                    type="button"
                    position="relative"
                    width="100%"
                    textAlign="left"
                    cursor="pointer"
                    bg="transparent"
                    border="none"
                    px={0}
                    py={0}
                    aria-pressed={isActive}
                    onClick={() => activateThread(index)}
                    onMouseEnter={() => activateThread(index)}
                    onFocus={() => activateThread(index)}
                    _focusVisible={{
                      outline: '2px solid',
                      outlineColor: activeAccent,
                      outlineOffset: '4px',
                      borderRadius: '12px',
                    }}
                  >
                    <Stack
                      spacing={3}
                      py={{ base: 4, md: 5 }}
                      borderBottom={{
                        base: index === focusThreads.length - 1 ? 'none' : '1px solid',
                        lg: 'none',
                      }}
                      borderColor="border.subtle"
                    >
                      <HStack spacing={3} align="baseline">
                        <Text
                          fontSize="sm"
                          fontWeight="semibold"
                          letterSpacing="0.16em"
                          color={isActive ? activeAccent : eyebrowColor}
                        >
                          {String(index + 1).padStart(2, '0')}
                        </Text>
                        <Text
                          fontSize="xs"
                          fontWeight="semibold"
                          color={isActive ? activeAccent : eyebrowColor}
                          letterSpacing="0.16em"
                          textTransform="uppercase"
                        >
                          {thread.label}
                        </Text>
                      </HStack>

                      <Text
                        fontSize={{ base: 'xl', md: '2xl' }}
                        fontWeight="semibold"
                        lineHeight="1.12"
                        color={isActive ? 'text.primary' : trackTitleMuted}
                        transition="color 0.2s ease"
                        maxW="14ch"
                      >
                        {thread.title}
                      </Text>

                      <Text color={trackMutedColor} lineHeight="tall" maxW="32rem">
                        {thread.description}
                      </Text>

                      <Box position="relative" h="1px" w="100%" bg={trackRuleBase}>
                        {isActive ? (
                          <motion.div
                            layoutId="about-hero-active-rule"
                            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                            style={{
                              position: 'absolute',
                              inset: 0,
                              height: '2px',
                              background: activeAccent,
                              transformOrigin: 'left center',
                            }}
                          />
                        ) : null}
                      </Box>
                    </Stack>
                  </Box>
                )
              })}
            </Grid>
          </Stack>
        </Stack>
      </Box>
    </MotionWrapper>
  )
}

export default AboutHero

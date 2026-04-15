import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Image,
  Link,
  SimpleGrid,
  Stack,
  Text,
  VStack,
  Wrap,
  WrapItem,
  useColorModeValue,
} from '@chakra-ui/react'
import { useReducedMotion } from 'framer-motion'
import { Link as RouterLink } from 'react-router-dom'
import { FaCode, FaGithub, FaLinkedin, FaRegCompass, FaUsers } from 'react-icons/fa'
import { FiArrowRight, FiBookOpen, FiFeather, FiLayers, FiMessageSquare } from 'react-icons/fi'
import { MotionWrapper } from '../../../core'
import AboutHero from '../components/AboutHero'
import AboutStatCard from '../components/AboutStatCard'
import { AboutFocusThread, AboutPrinciple, AboutStatItem } from '../about.types'

const stats: AboutStatItem[] = [
  {
    label: 'Experience across backend work',
    value: '5+ years',
    description: 'Grounded in real delivery work across systems, APIs, and product surfaces.',
    icon: FaUsers,
  },
  {
    label: 'Primary craft',
    value: 'Python + Django',
    description:
      'The stack behind most of the day-to-day engineering practice that feeds the blog.',
    icon: FaCode,
  },
  {
    label: 'Working lane',
    value: 'Backend systems',
    description:
      'Daily work centered on APIs, event flows, reliability, and product infrastructure.',
    icon: FaRegCompass,
  },
  {
    label: 'Writing direction',
    value: 'Engineering + life',
    description: 'Notes about technical work, product craft, and the human side of building.',
    icon: FiBookOpen,
  },
]

const principles: AboutPrinciple[] = [
  {
    icon: FiFeather,
    title: 'Stay curious',
    description:
      'Horizon starts from curiosity, not certainty. It is a place to follow questions, notice patterns, and keep learning in public.',
  },
  {
    icon: FiLayers,
    title: 'Write down what helps',
    description:
      'I write about ideas, lessons, and technical details that have helped me think better or work better, hoping they stay useful to someone else too.',
  },
  {
    icon: FiMessageSquare,
    title: 'Leave room for the unknown',
    description:
      'Knowledge does not end. The more we learn, the more clearly we see how much is still missing, and the page should stay open to that.',
  },
]

const focusThreads: AboutFocusThread[] = [
  {
    label: 'Build',
    title: 'Backend systems with real constraints',
    description: 'Most of the daily work lives in APIs, event flows, and product infrastructure.',
  },
  {
    label: 'Write',
    title: 'Notes that come from practice',
    description: 'The writing focuses on lessons that hold up better after doing the work.',
  },
  {
    label: 'Shape',
    title: 'Interfaces that stay quiet',
    description:
      'Layout, motion, and hierarchy should support the writing instead of competing with it.',
  },
]

const AboutPage = () => {
  const prefersReducedMotion = useReducedMotion()
  const founderBadgeBg = useColorModeValue('rgba(255, 255, 255, 0.82)', 'rgba(37, 37, 37, 0.82)')
  const founderBadgeColor = useColorModeValue(
    'obsidian.text.lightSecondary',
    'obsidian.text.primary',
  )
  const portraitOverlay = useColorModeValue(
    'linear(to-t, rgba(248, 249, 250, 0.08), rgba(248, 249, 250, 0.01) 42%, transparent 72%)',
    'linear(to-t, rgba(30, 30, 30, 0.16), rgba(30, 30, 30, 0.04) 42%, transparent 72%)',
  )
  const sectionRevealProps = prefersReducedMotion
    ? {
        initial: { opacity: 1, y: 0 },
        animate: { opacity: 1, y: 0 },
        duration: 0,
      }
    : {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
        duration: 0.6,
      }

  return (
    <Box position="relative" overflow="hidden" pb={{ base: 10, md: 14 }}>
      <Box
        position="absolute"
        top={{ base: 12, md: 16 }}
        left={{ base: '-12%', md: '6%' }}
        w={{ base: '220px', md: '360px' }}
        h={{ base: '220px', md: '360px' }}
        bg="action.glow"
        filter="blur(130px)"
        opacity={0.7}
        pointerEvents="none"
      />
      <Box
        position="absolute"
        top={{ base: '42%', md: '38%' }}
        right={{ base: '-14%', md: '2%' }}
        w={{ base: '240px', md: '340px' }}
        h={{ base: '240px', md: '340px' }}
        bg="accent.glow"
        filter="blur(150px)"
        opacity={0.42}
        pointerEvents="none"
      />

      <Container maxW="container.xl" py={{ base: 8, md: 10 }} position="relative">
        <VStack spacing={{ base: 8, md: 10 }} align="stretch">
          <AboutHero focusThreads={focusThreads} />

          <MotionWrapper {...sectionRevealProps}>
            <Stack spacing={4}>
              <Stack spacing={2}>
                <Text
                  fontSize="sm"
                  textTransform="uppercase"
                  letterSpacing="0.14em"
                  color="text.tertiary"
                >
                  Signals
                </Text>
                <Text maxW="2xl" color="text.secondary" lineHeight="tall">
                  Enough context to understand the background behind the writing without turning the
                  page into a resume.
                </Text>
              </Stack>
              <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={5}>
                {stats.map((stat) => (
                  <AboutStatCard key={stat.label} {...stat} />
                ))}
              </SimpleGrid>
            </Stack>
          </MotionWrapper>

          <MotionWrapper {...sectionRevealProps}>
            <Stack spacing={5}>
              <Stack spacing={2}>
                <Text
                  fontSize="sm"
                  textTransform="uppercase"
                  letterSpacing="0.14em"
                  color="text.tertiary"
                >
                  Approach
                </Text>
                <Heading size="lg" letterSpacing="-0.03em" color="text.primary">
                  Why Horizon stays open
                </Heading>
              </Stack>

              <Grid templateColumns={{ base: '1fr', xl: '1.05fr 0.95fr' }} gap={6}>
                <Box
                  border="1px solid"
                  borderColor="border.subtle"
                  borderRadius="3xl"
                  bg="bg.secondary"
                  px={{ base: 6, md: 8 }}
                  py={{ base: 7, md: 8 }}
                >
                  <Stack spacing={6}>
                    <Heading
                      fontSize={{ base: '2xl', md: '3xl' }}
                      lineHeight="1.12"
                      letterSpacing="-0.04em"
                      color="text.primary"
                    >
                      The more I learn, the more I realize how much I still do not know.
                    </Heading>
                    <Text color="text.secondary" lineHeight="tall">
                      Horizon is a place to stay curious, follow ideas that keep pulling at me, and
                      write down the things that have helped me a lot. Some of them come from
                      backend systems, some from writing, and some from those small moments where a
                      confusing piece of work suddenly becomes a little clearer.
                    </Text>
                    <Text color="text.secondary" lineHeight="tall">
                      Knowledge feels endless. The more we learn, the more aware we become of how
                      much is still missing, and Horizon should feel open enough to keep making room
                      for that. I do not want this page to sound final. I want it to feel like an
                      honest record of things I am still learning, revisiting, and understanding
                      more slowly over time.
                    </Text>
                    <Wrap spacing={3}>
                      {principles.map((principle) => (
                        <WrapItem key={principle.title}>
                          <Badge
                            px={3}
                            py={1}
                            borderRadius="full"
                            bg="action.subtle"
                            color="action.primary"
                          >
                            {principle.title}
                          </Badge>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Stack>
                </Box>

                <Stack spacing={5}>
                  {principles.map((principle) => (
                    <Box
                      key={principle.title}
                      border="1px solid"
                      borderColor="border.subtle"
                      borderRadius="2xl"
                      bg="bg.secondary"
                      px={5}
                      py={6}
                    >
                      <Stack spacing={4}>
                        <Flex
                          w={11}
                          h={11}
                          align="center"
                          justify="center"
                          borderRadius="2xl"
                          bg="bg.tertiary"
                          color="action.primary"
                        >
                          <Icon as={principle.icon} boxSize={4.5} />
                        </Flex>
                        <Heading size="md" color="text.primary" letterSpacing="-0.02em">
                          {principle.title}
                        </Heading>
                        <Text color="text.secondary" lineHeight="tall">
                          {principle.description}
                        </Text>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Grid>
            </Stack>
          </MotionWrapper>

          <MotionWrapper {...sectionRevealProps}>
            <Box
              border="1px solid"
              borderColor="border.subtle"
              borderRadius="3xl"
              bg="bg.secondary"
              overflow="hidden"
            >
              <Grid templateColumns={{ base: '1fr', lg: '0.72fr 1.28fr' }} gap={0}>
                <Box
                  position="relative"
                  px={{ base: 6, md: 8 }}
                  pt={{ base: 6, md: 8 }}
                  pb={{ base: 0, lg: 7 }}
                >
                  <Box
                    position="relative"
                    minH={{ base: '320px', md: '420px', lg: '100%' }}
                    borderRadius="2xl"
                    overflow="hidden"
                    bg="bg.tertiary"
                  >
                    <Image
                      src="https://minio.connortran.io.vn/horizon-blog-public-bucket/connortran-avatar.jpg"
                      alt="Portrait of Tran Tuan Canh, founder of Horizon Blog"
                      position="absolute"
                      inset={0}
                      w="100%"
                      h="100%"
                      objectFit="cover"
                      objectPosition="center top"
                    />
                    <Box
                      position="absolute"
                      inset={0}
                      bgGradient={portraitOverlay}
                      pointerEvents="none"
                    />
                    <Badge
                      position="absolute"
                      top={5}
                      left={5}
                      px={3}
                      py={1}
                      borderRadius="full"
                      bg={founderBadgeBg}
                      color={founderBadgeColor}
                      border="1px solid"
                      borderColor="border.subtle"
                      backdropFilter="blur(8px)"
                      textTransform="uppercase"
                      letterSpacing="0.14em"
                      fontSize="10px"
                    >
                      Founder note
                    </Badge>
                  </Box>
                </Box>

                <Stack
                  spacing={5}
                  px={{ base: 6, md: 8, lg: 10 }}
                  py={{ base: 7, md: 8 }}
                  justify="center"
                >
                  <Stack spacing={3}>
                    <Heading size="xl" color="text.primary" letterSpacing="-0.03em">
                      Tran Tuan Canh
                    </Heading>
                    <Text
                      color="action.primary"
                      fontWeight="semibold"
                      letterSpacing="0.08em"
                      textTransform="uppercase"
                    >
                      Founder and Engineer
                    </Text>
                  </Stack>

                  <Text color="text.secondary" lineHeight="tall">
                    I built Horizon as a place to think in public, write with more intent, and keep
                    the product surface honest. If a page cannot support the writing or the person
                    behind it, it is not done yet.
                  </Text>
                  <Text color="text.secondary" lineHeight="tall">
                    Most of my day-to-day work lives in backend systems, APIs, event flows, and
                    product infrastructure. The dedicated CV page pulls that professional side into
                    the same editorial world as the writing.
                  </Text>

                  <Wrap spacing={3}>
                    <WrapItem>
                      <Badge
                        px={3}
                        py={1}
                        borderRadius="full"
                        bg="bg.tertiary"
                        color="text.secondary"
                      >
                        Backend systems
                      </Badge>
                    </WrapItem>
                    <WrapItem>
                      <Badge
                        px={3}
                        py={1}
                        borderRadius="full"
                        bg="bg.tertiary"
                        color="text.secondary"
                      >
                        Product infrastructure
                      </Badge>
                    </WrapItem>
                    <WrapItem>
                      <Badge
                        px={3}
                        py={1}
                        borderRadius="full"
                        bg="bg.tertiary"
                        color="text.secondary"
                      >
                        Writing in public
                      </Badge>
                    </WrapItem>
                  </Wrap>

                  <HStack spacing={4} flexWrap="wrap">
                    <Button as={RouterLink} to="/cv" rightIcon={<FiArrowRight />}>
                      View CV
                    </Button>
                    <Button
                      as={Link}
                      href="https://github.com/connortran216"
                      isExternal
                      leftIcon={<FaGithub />}
                      variant="ghost"
                      color="text.primary"
                    >
                      GitHub
                    </Button>
                    <Button
                      as={Link}
                      href="https://www.linkedin.com/in/c%E1%BA%A3nh-tr%E1%BA%A7n-tu%E1%BA%A5n-b57564162/"
                      isExternal
                      leftIcon={<FaLinkedin />}
                      variant="ghost"
                      color="text.primary"
                    >
                      LinkedIn
                    </Button>
                  </HStack>
                </Stack>
              </Grid>
            </Box>
          </MotionWrapper>
        </VStack>
      </Container>
    </Box>
  )
}

export default AboutPage

import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
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
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FaBook, FaCode, FaGithub, FaHeart, FaLinkedin, FaUsers } from 'react-icons/fa'
import { FiArrowRight, FiFeather, FiLayers, FiMessageSquare } from 'react-icons/fi'
import { AnimatedCard, MotionWrapper } from '../../../core'
import AboutStatCard from '../components/AboutStatCard'
import { AboutPrinciple, AboutStatItem } from '../about.types'

const stats: AboutStatItem[] = [
  { label: 'Articles published', value: '47+', icon: FaBook },
  { label: 'Readers reached', value: '2.5K+', icon: FaUsers },
  { label: 'Lines shipped', value: '8.9K+', icon: FaCode },
  { label: 'Moments that resonated', value: '1.2K+', icon: FaHeart },
]

const principles: AboutPrinciple[] = [
  {
    icon: FiFeather,
    title: 'Write with a point of view',
    description:
      'Every post should feel deliberate. Strong titles, clear structure, and useful takeaways matter more than volume.',
  },
  {
    icon: FiLayers,
    title: 'Build the system carefully',
    description:
      'Horizon is also a frontend playground, so design, code structure, and content presentation evolve together.',
  },
  {
    icon: FiMessageSquare,
    title: 'Keep the tone human',
    description:
      'The product should feel personal and readable, not corporate. It should support thoughtful publishing and slow reading.',
  },
]

const AboutPage = () => {
  return (
    <Box position="relative" pb={12}>
      <Box
        position="absolute"
        top={0}
        left="50%"
        transform="translateX(-50%)"
        w={{ base: '92%', md: '78%' }}
        h="320px"
        bg="accent.glow"
        filter="blur(130px)"
        opacity={0.72}
        pointerEvents="none"
      />

      <Container maxW="container.xl" py={{ base: 8, md: 12 }} position="relative">
        <VStack spacing={{ base: 8, md: 10 }} align="stretch">
          <MotionWrapper
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            duration={0.7}
          >
            <Box
              border="1px solid"
              borderColor="border.subtle"
              borderRadius="3xl"
              bg="bg.glass"
              backdropFilter="blur(18px)"
              px={{ base: 6, md: 10 }}
              py={{ base: 8, md: 10 }}
              boxShadow="md"
            >
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10}>
                <Stack spacing={6}>
                  <Badge
                    alignSelf="flex-start"
                    px={3}
                    py={1}
                    borderRadius="full"
                    bg="bg.tertiary"
                    color="text.secondary"
                    textTransform="uppercase"
                    letterSpacing="0.14em"
                    fontSize="10px"
                  >
                    About Horizon
                  </Badge>

                  <Heading
                    fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
                    lineHeight={{ base: 1.06, md: 0.98 }}
                    letterSpacing="-0.06em"
                    color="text.primary"
                  >
                    A personal blog shaped like an intentional product.
                  </Heading>

                  <Text
                    maxW="2xl"
                    fontSize={{ base: 'md', md: 'lg' }}
                    color="text.secondary"
                    lineHeight="tall"
                  >
                    Horizon exists to hold writing about life, experience, and technology inside a
                    frontend system that is equally thoughtful. It is both a publishing space and a
                    craft exercise in building clear interfaces.
                  </Text>

                  <HStack spacing={4} flexWrap="wrap">
                    <Button
                      as={RouterLink}
                      to="/blog"
                      bg="accent.primary"
                      color="white"
                      _hover={{ bg: 'accent.hover' }}
                      rightIcon={<FiArrowRight />}
                    >
                      Read the archive
                    </Button>
                    <Button
                      as={RouterLink}
                      to="/contact"
                      variant="ghost"
                      color="text.primary"
                      _hover={{ bg: 'bg.tertiary' }}
                    >
                      Get in touch
                    </Button>
                  </HStack>
                </Stack>

                <AnimatedCard intensity="light" maxW="100%" animation="fadeInUp">
                  <Stack spacing={5} p={6}>
                    <Text
                      fontSize="sm"
                      textTransform="uppercase"
                      letterSpacing="0.14em"
                      color="text.tertiary"
                    >
                      What drives the project
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
                          Writing with clarity
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
                          Building with intention
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
                          Reading without noise
                        </Badge>
                      </WrapItem>
                    </Wrap>
                    <Text color="text.secondary" lineHeight="tall">
                      The ambition is simple: make the content worth reading, then make the
                      interface worthy of holding it.
                    </Text>
                    <Text color="text.secondary" lineHeight="tall">
                      That means strong hierarchy, calm spacing, clean architecture, and a product
                      that never forgets the reader is the main character.
                    </Text>
                  </Stack>
                </AnimatedCard>
              </SimpleGrid>
            </Box>
          </MotionWrapper>

          <Stack spacing={4}>
            <Text
              fontSize="sm"
              textTransform="uppercase"
              letterSpacing="0.14em"
              color="text.tertiary"
            >
              Signals
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={6}>
              {stats.map((stat) => (
                <AboutStatCard key={stat.label} {...stat} />
              ))}
            </SimpleGrid>
          </Stack>

          <Stack spacing={4}>
            <Text
              fontSize="sm"
              textTransform="uppercase"
              letterSpacing="0.14em"
              color="text.tertiary"
            >
              Principles
            </Text>
            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
              {principles.map((principle) => (
                <AnimatedCard
                  key={principle.title}
                  intensity="light"
                  maxW="100%"
                  animation="fadeInUp"
                >
                  <Stack spacing={4} p={6}>
                    <Flex
                      w={12}
                      h={12}
                      align="center"
                      justify="center"
                      borderRadius="2xl"
                      bg="bg.tertiary"
                      color="accent.primary"
                    >
                      <Icon as={principle.icon} boxSize={5} />
                    </Flex>
                    <Heading size="md" color="text.primary" letterSpacing="-0.02em">
                      {principle.title}
                    </Heading>
                    <Text color="text.secondary" lineHeight="tall">
                      {principle.description}
                    </Text>
                  </Stack>
                </AnimatedCard>
              ))}
            </SimpleGrid>
          </Stack>

          <MotionWrapper
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            duration={0.6}
          >
            <Box
              border="1px solid"
              borderColor="border.subtle"
              borderRadius="3xl"
              bg="bg.secondary"
              overflow="hidden"
            >
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={0}>
                <Box minH={{ base: '320px', lg: '100%' }}>
                  <Image
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=60"
                    alt="Connor Tran"
                    w="full"
                    h="full"
                    objectFit="cover"
                  />
                </Box>
                <Stack
                  spacing={6}
                  px={{ base: 6, md: 8 }}
                  py={{ base: 8, md: 10 }}
                  justify="center"
                >
                  <Badge
                    alignSelf="flex-start"
                    px={3}
                    py={1}
                    borderRadius="full"
                    bg="bg.tertiary"
                    color="text.secondary"
                    textTransform="uppercase"
                    letterSpacing="0.14em"
                    fontSize="10px"
                  >
                    Founder note
                  </Badge>
                  <Stack spacing={2}>
                    <Heading size="xl" color="text.primary" letterSpacing="-0.03em">
                      Connor Tran
                    </Heading>
                    <Text
                      color="accent.primary"
                      fontWeight="semibold"
                      letterSpacing="0.08em"
                      textTransform="uppercase"
                    >
                      Founder and Lead Developer
                    </Text>
                  </Stack>
                  <Text color="text.secondary" lineHeight="tall">
                    I built Horizon as a place to think in public, sharpen my frontend craft, and
                    keep the product honest. If a page cannot support the writing, it is not done
                    yet.
                  </Text>
                  <Text color="text.secondary" lineHeight="tall">
                    The long-term goal is a blog that feels both personal and rigorously designed:
                    useful to read, satisfying to write in, and clean to maintain.
                  </Text>
                  <HStack spacing={4} flexWrap="wrap">
                    <Button
                      as={Link}
                      href="https://github.com/connortran216"
                      isExternal
                      leftIcon={<FaGithub />}
                      variant="ghost"
                      color="text.primary"
                      _hover={{ bg: 'bg.tertiary' }}
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
                      _hover={{ bg: 'bg.tertiary' }}
                    >
                      LinkedIn
                    </Button>
                  </HStack>
                </Stack>
              </SimpleGrid>
            </Box>
          </MotionWrapper>
        </VStack>
      </Container>
    </Box>
  )
}

export default AboutPage

import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Image,
  VStack,
  HStack,
  Icon,
} from '@chakra-ui/react'
import { FaGithub, FaLinkedin, FaUsers, FaBook, FaCode, FaHeart } from 'react-icons/fa'
import { IconType } from 'react-icons/lib'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Glassmorphism, FocusRing, MotionWrapper } from '../core'

interface StatCounterProps {
  icon: IconType
  number: number
  label: string
  index: number
}

interface TeamMember {
  name: string
  role: string
  bio: string
  image: string
  social: {
    github?: string
    twitter?: string
    linkedin?: string
  }
}

const teamMembers: TeamMember[] = [
  {
    name: 'Connor Tran',
    role: 'Founder & Lead Developer',
    bio: 'Passionate about web development and creating meaningful content.',
    image:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=60',
    social: {
      github: 'https://github.com/connortran216',
      linkedin: 'https://www.linkedin.com/in/c%E1%BA%A3nh-tr%E1%BA%A7n-tu%E1%BA%A5n-b57564162/',
    },
  },
]

const About = () => {
  // Using design system semantic tokens instead of useColorModeValue
  const missionText = 'text.secondary'
  const valueHeading = 'text.primary'
  const roleText = 'accent.primary'
  const bioText = 'text.secondary'
  const statNumberColor = 'accent.primary'
  const iconHoverColor = 'accent.hover'

  const stats = [
    { icon: FaBook, number: 47, label: 'Articles Published' },
    { icon: FaUsers, number: 2500, label: 'Community Members' },
    { icon: FaCode, number: 8900, label: 'Lines of Code Written' },
    { icon: FaHeart, number: 1200, label: 'Happy Readers' },
  ]

  const StatCounter = ({ icon: IconComponent, number, label, index }: StatCounterProps) => {
    const [count, setCount] = useState(0)

    useEffect(() => {
      const timer = setTimeout(() => {
        const increment = number / 50
        const counter = setInterval(() => {
          setCount((prev) => {
            const next = prev + increment
            if (next >= number) {
              clearInterval(counter)
              return number
            }
            return next
          })
        }, 30)
        return () => clearInterval(counter)
      }, index * 200)

      return () => clearTimeout(timer)
    }, [number, index])

    return (
      <MotionWrapper>
        <VStack spacing={3} p={6} textAlign="center">
          <motion.div whileHover={{ scale: 1.1 }}>
            <Icon as={IconComponent} w={12} h={12} color={statNumberColor} />
          </motion.div>
          <Text fontSize="3xl" fontWeight="bold" color={statNumberColor}>
            {Math.floor(count)}+
          </Text>
          <Text fontSize="sm" fontWeight="medium" color={valueHeading}>
            {label}
          </Text>
        </VStack>
      </MotionWrapper>
    )
  }

  return (
    <Container maxW="container.xl" py={16}>
      <VStack spacing={20}>
        <Box textAlign="center" position="relative" py={12}>
          <MotionWrapper>
            <Heading size="2xl" mb={6}>
              Our Mission
            </Heading>
          </MotionWrapper>

          <MotionWrapper>
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              color={missionText}
              maxW="3xl"
              mx="auto"
              lineHeight="tall"
            >
              We are dedicated to providing high-quality content about web development, programming,
              and technology. Our goal is to help developers stay up-to-date with the latest trends
              and best practices while building a supportive community.
            </Text>
          </MotionWrapper>
        </Box>

        <MotionWrapper>
          <Box width="100%">
            <Heading textAlign="center" mb={12} size="xl">
              Our Impact
            </Heading>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8}>
              {stats.map((stat, index) => (
                <StatCounter key={index} {...stat} index={index} />
              ))}
            </SimpleGrid>
          </Box>
        </MotionWrapper>

        <MotionWrapper>
          <Box width="100%">
            <Heading textAlign="center" mb={12} size="xl">
              Our Values
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
              {[
                {
                  icon: FaCode,
                  title: 'Quality',
                  description:
                    'We strive to deliver the highest quality content and maintain rigorous standards in our writing.',
                },
                {
                  icon: FaUsers,
                  title: 'Community',
                  description:
                    'We believe in fostering a supportive and inclusive community for developers of all skill levels.',
                },
                {
                  icon: FaHeart,
                  title: 'Innovation',
                  description:
                    'We stay at the forefront of technology and share cutting-edge insights with our readers.',
                },
              ].map((value, index) => (
                <Glassmorphism
                  key={index}
                  backdropBlur="10px"
                  bg="rgba(255, 255, 255, 0.1)"
                  borderRadius="2xl"
                >
                  <MotionWrapper>
                    <VStack p={8} spacing={4}>
                      <motion.div whileHover={{ scale: 1.1 }}>
                        <Icon as={value.icon} w={12} h={12} color={statNumberColor} />
                      </motion.div>
                      <Heading size="lg" color={valueHeading}>
                        {value.title}
                      </Heading>
                      <Text textAlign="center" color={bioText} lineHeight="tall">
                        {value.description}
                      </Text>
                    </VStack>
                  </MotionWrapper>
                </Glassmorphism>
              ))}
            </SimpleGrid>
          </Box>
        </MotionWrapper>

        <MotionWrapper>
          <Box width="100%">
            <Heading textAlign="center" mb={12} size="xl">
              Our Team
            </Heading>
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 1 }} spacing={8} justifyItems="center">
              {teamMembers.map((member, index) => (
                <Glassmorphism
                  key={index}
                  backdropBlur="15px"
                  bg="rgba(255, 255, 255, 0.1)"
                  borderRadius="3xl"
                  maxW="400px"
                >
                  <MotionWrapper>
                    <VStack p={8} spacing={6} align="center">
                      <motion.div whileHover={{ scale: 1.1 }}>
                        <Image
                          src={member.image}
                          alt={member.name}
                          borderRadius="full"
                          boxSize="180px"
                          objectFit="cover"
                          border="3px solid rgba(255, 255, 255, 0.3)"
                        />
                      </motion.div>

                      <VStack spacing={2} textAlign="center">
                        <Heading size="lg" color="text.primary">
                          {member.name}
                        </Heading>
                        <Text
                          color={roleText}
                          fontWeight="medium"
                          fontSize="md"
                          textTransform="uppercase"
                          letterSpacing="wide"
                        >
                          {member.role}
                        </Text>
                      </VStack>

                      <Text textAlign="center" color={bioText} lineHeight="tall" maxW="280px">
                        {member.bio}
                      </Text>

                      <HStack spacing={4}>
                        {member.social.github && (
                          <FocusRing>
                            <motion.div whileHover={{ scale: 1.2 }}>
                              <Icon
                                as={FaGithub}
                                w={7}
                                h={7}
                                cursor="pointer"
                                color="text.secondary"
                                _hover={{ color: iconHoverColor }}
                                onClick={() => window.open(member.social.github, '_blank')}
                              />
                            </motion.div>
                          </FocusRing>
                        )}
                        {member.social.linkedin && (
                          <FocusRing>
                            <motion.div whileHover={{ scale: 1.2 }}>
                              <Icon
                                as={FaLinkedin}
                                w={7}
                                h={7}
                                cursor="pointer"
                                color="text.secondary"
                                _hover={{ color: iconHoverColor }}
                                onClick={() => window.open(member.social.linkedin, '_blank')}
                              />
                            </motion.div>
                          </FocusRing>
                        )}
                      </HStack>
                    </VStack>
                  </MotionWrapper>
                </Glassmorphism>
              ))}
            </SimpleGrid>
          </Box>
        </MotionWrapper>
      </VStack>
    </Container>
  )
}

export default About

import {
  Badge,
  Box,
  Button,
  Container,
  Grid,
  GridItem,
  Heading,
  HStack,
  Link,
  SimpleGrid,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { FaEnvelope, FaMapMarkerAlt, FaPhone } from 'react-icons/fa'
import { FiArrowRight, FiClock, FiMessageSquare, FiPenTool } from 'react-icons/fi'
import ContactInfoCard from '../components/ContactInfoCard'
import ContactPromptCard from '../components/ContactPromptCard'
import { ContactInfoItem, ContactPromptItem } from '../contact.types'

const contactInfo: ContactInfoItem[] = [
  {
    icon: FaMapMarkerAlt,
    title: 'Location',
    content: '10 Lam Van Ben, Tan Hung ward, HCM City, Vietnam',
    description: 'Useful when a conversation needs timezone or local context.',
    variant: 'secondary',
  },
  {
    icon: FaPhone,
    title: 'Phone',
    content: '+84 96 345 2909',
    href: 'tel:+84963452909',
    description: 'Best for time-sensitive conversations after a short heads-up.',
    actionLabel: 'Call',
    variant: 'secondary',
  },
  {
    icon: FaEnvelope,
    title: 'Email',
    content: 'canhtran210699@gmail.com',
    href: 'mailto:canhtran210699@gmail.com',
    description: 'Best for blog feedback, frontend discussion, and thoughtful async context.',
    actionLabel: 'Email directly',
    variant: 'primary',
  },
]

const prompts: ContactPromptItem[] = [
  {
    icon: FiPenTool,
    title: 'Writing and editorial feedback',
    description: 'Reach out with ideas, feedback on the blog, or topics you want to see explored.',
  },
  {
    icon: FiMessageSquare,
    title: 'Frontend and product conversations',
    description:
      'The project is also a design and engineering playground, so thoughtful product discussions are always welcome.',
  },
  {
    icon: FiClock,
    title: 'Clear expectations',
    description:
      'Messages should feel as intentional as the product. Short context and a concrete ask work best.',
  },
]

const ContactPage = () => {
  const primaryContact = contactInfo.find((info) => info.variant === 'primary')
  const secondaryContacts = contactInfo.filter((info) => info.variant !== 'primary')

  return (
    <Box position="relative" pb={12}>
      <Box
        position="absolute"
        top={0}
        left="50%"
        transform="translateX(-50%)"
        w={{ base: '92%', md: '78%' }}
        h="320px"
        bg="action.glow"
        filter="blur(130px)"
        opacity={0.72}
        pointerEvents="none"
      />

      <Container maxW="container.xl" py={{ base: 8, md: 12 }} position="relative">
        <VStack spacing={{ base: 8, md: 12 }} align="stretch">
          <Grid templateColumns={{ base: '1fr', lg: '1.05fr 0.95fr' }} gap={{ base: 8, lg: 10 }}>
            <GridItem>
              <Stack spacing={6} pt={{ lg: 6 }}>
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
                  Contact Horizon
                </Badge>

                <Heading
                  fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
                  lineHeight={{ base: 1.08, md: 1 }}
                  color="text.primary"
                >
                  Reach out directly, with no form in the middle.
                </Heading>

                <Text
                  maxW="2xl"
                  fontSize={{ base: 'md', md: 'lg' }}
                  color="text.secondary"
                  lineHeight="tall"
                >
                  Email is the best place for thoughtful notes about writing, frontend architecture,
                  or the direction of Horizon. A little context makes the reply more useful.
                </Text>

                <HStack spacing={4} flexWrap="wrap">
                  <Button
                    as={Link}
                    href="mailto:canhtran210699@gmail.com"
                    rightIcon={<FiArrowRight />}
                    _hover={{ textDecoration: 'none' }}
                  >
                    Email directly
                  </Button>
                  <Button
                    as={Link}
                    href="tel:+84963452909"
                    variant="outline"
                    _hover={{ textDecoration: 'none' }}
                  >
                    Call instead
                  </Button>
                </HStack>
              </Stack>
            </GridItem>

            <GridItem>
              <Stack spacing={4}>
                {primaryContact && <ContactInfoCard info={primaryContact} />}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 1 }} spacing={4}>
                  {secondaryContacts.map((info) => (
                    <ContactInfoCard key={info.title} info={info} />
                  ))}
                </SimpleGrid>
              </Stack>
            </GridItem>
          </Grid>

          <Box>
            <Stack spacing={4} mb={5}>
              <Text
                fontSize="sm"
                textTransform="uppercase"
                letterSpacing="0.14em"
                color="text.tertiary"
              >
                Good conversations start with clarity
              </Text>
              <Heading size="lg" color="text.primary">
                A few helpful reasons to reach out.
              </Heading>
            </Stack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
              {prompts.map((prompt) => (
                <ContactPromptCard key={prompt.title} prompt={prompt} />
              ))}
            </SimpleGrid>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
}

export default ContactPage

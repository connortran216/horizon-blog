import { useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  Link,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  Input,
  useToast,
  VStack,
} from '@chakra-ui/react'
import { FaEnvelope, FaMapMarkerAlt, FaPhone } from 'react-icons/fa'
import { FiArrowRight, FiClock, FiMessageSquare, FiPenTool } from 'react-icons/fi'
import { AnimatedCard, MotionWrapper } from '../../../core'
import { AnimatedPrimaryButton } from '../../../components/core/animations/AnimatedButton'
import ContactInfoCard from '../components/ContactInfoCard'
import ContactPromptCard from '../components/ContactPromptCard'
import { ContactInfoItem, ContactPromptItem } from '../contact.types'

const contactInfo: ContactInfoItem[] = [
  {
    icon: FaMapMarkerAlt,
    title: 'Location',
    content: '10 Lam Van Ben, Tan Hung ward, HCM City, Vietnam',
  },
  {
    icon: FaPhone,
    title: 'Phone',
    content: '+84 96 345 2909',
    href: 'tel:+84963452909',
  },
  {
    icon: FaEnvelope,
    title: 'Email',
    content: 'canhtran210699@gmail.com',
    href: 'mailto:canhtran210699@gmail.com',
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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: 'Message sent',
        description: 'Thanks for reaching out. I will get back to you soon.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

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
              <Grid templateColumns={{ base: '1fr', lg: '1.2fr 0.8fr' }} gap={10}>
                <GridItem>
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
                      Contact Horizon
                    </Badge>

                    <Heading
                      fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
                      lineHeight={{ base: 1.06, md: 0.98 }}
                      letterSpacing="-0.06em"
                      color="text.primary"
                    >
                      Send a thoughtful message about the blog, not just a form submission.
                    </Heading>

                    <Text
                      maxW="2xl"
                      fontSize={{ base: 'md', md: 'lg' }}
                      color="text.secondary"
                      lineHeight="tall"
                    >
                      Whether you want to talk about writing, frontend architecture, or the
                      direction of Horizon, this page is meant to feel direct and personal.
                    </Text>

                    <HStack spacing={4} flexWrap="wrap">
                      <Button
                        as={Link}
                        href="mailto:canhtran210699@gmail.com"
                        bg="action.primary"
                        color="white"
                        _hover={{ bg: 'action.hover' }}
                        rightIcon={<FiArrowRight />}
                      >
                        Email directly
                      </Button>
                      <Button
                        as={Link}
                        href="tel:+84963452909"
                        variant="ghost"
                        color="text.primary"
                        _hover={{ bg: 'bg.tertiary' }}
                      >
                        Call instead
                      </Button>
                    </HStack>
                  </Stack>
                </GridItem>

                <GridItem>
                  <AnimatedCard intensity="light" maxW="100%" animation="fadeInUp">
                    <Stack spacing={5} p={6}>
                      <Text
                        fontSize="sm"
                        textTransform="uppercase"
                        letterSpacing="0.14em"
                        color="text.tertiary"
                      >
                        Response rhythm
                      </Text>
                      <Text color="text.secondary" lineHeight="tall">
                        Short messages with clear context are easiest to reply to. If you are asking
                        about the product, include the page or issue you are referring to.
                      </Text>
                      <SimpleGrid columns={1} spacing={3}>
                        <Box
                          border="1px solid"
                          borderColor="border.subtle"
                          borderRadius="2xl"
                          p={4}
                          bg="bg.page"
                        >
                          <Text fontWeight="semibold" color="text.primary">
                            Best for
                          </Text>
                          <Text mt={1} color="text.secondary">
                            design feedback, engineering discussion, writing topics
                          </Text>
                        </Box>
                        <Box
                          border="1px solid"
                          borderColor="border.subtle"
                          borderRadius="2xl"
                          p={4}
                          bg="bg.page"
                        >
                          <Text fontWeight="semibold" color="text.primary">
                            Expectation
                          </Text>
                          <Text mt={1} color="text.secondary">
                            a concise reply, not an automated support script
                          </Text>
                        </Box>
                      </SimpleGrid>
                    </Stack>
                  </AnimatedCard>
                </GridItem>
              </Grid>
            </Box>
          </MotionWrapper>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            {contactInfo.map((info) => (
              <ContactInfoCard key={info.title} info={info} />
            ))}
          </SimpleGrid>

          <Grid templateColumns={{ base: '1fr', lg: '0.8fr 1.2fr' }} gap={8}>
            <GridItem>
              <Stack spacing={4}>
                <Text
                  fontSize="sm"
                  textTransform="uppercase"
                  letterSpacing="0.14em"
                  color="text.tertiary"
                >
                  Good conversations start with clarity
                </Text>
                <SimpleGrid columns={1} spacing={4}>
                  {prompts.map((prompt) => (
                    <ContactPromptCard key={prompt.title} prompt={prompt} />
                  ))}
                </SimpleGrid>
              </Stack>
            </GridItem>

            <GridItem>
              <Box
                border="1px solid"
                borderColor="border.subtle"
                borderRadius="3xl"
                bg="bg.secondary"
                px={{ base: 6, md: 8 }}
                py={{ base: 8, md: 10 }}
              >
                <Stack as="form" spacing={6} onSubmit={handleSubmit}>
                  <Stack spacing={2}>
                    <Text
                      fontSize="sm"
                      textTransform="uppercase"
                      letterSpacing="0.14em"
                      color="text.tertiary"
                    >
                      Send a message
                    </Text>
                    <Heading size="lg" color="text.primary" letterSpacing="-0.03em">
                      Write with enough context to make the reply useful.
                    </Heading>
                  </Stack>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <FormControl isRequired>
                      <FormLabel>Name</FormLabel>
                      <Input name="name" value={formData.name} onChange={handleChange} />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Email</FormLabel>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </FormControl>
                  </SimpleGrid>

                  <FormControl isRequired>
                    <FormLabel>Subject</FormLabel>
                    <Input name="subject" value={formData.subject} onChange={handleChange} />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Message</FormLabel>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      minH="220px"
                      resize="vertical"
                    />
                  </FormControl>

                  <HStack
                    justify="space-between"
                    align={{ base: 'flex-start', md: 'center' }}
                    flexWrap="wrap"
                    gap={4}
                  >
                    <Text fontSize="sm" color="text.secondary">
                      Thoughtful messages beat long generic ones.
                    </Text>
                    <AnimatedPrimaryButton type="submit" isLoading={isLoading}>
                      Send message
                    </AnimatedPrimaryButton>
                  </HStack>
                </Stack>
              </Box>
            </GridItem>
          </Grid>
        </VStack>
      </Container>
    </Box>
  )
}

export default ContactPage

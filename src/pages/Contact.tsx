import { useState } from 'react'
import {
  Box,
  Container,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Textarea,
  useToast,
  Heading,
  Text,
  SimpleGrid,
  Icon,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa'
import { MotionWrapper, Glassmorphism } from '../core'
import { AnimatedPrimaryButton } from '../components/core/animations/AnimatedButton'

interface ContactInfo {
  icon: typeof FaMapMarkerAlt
  title: string
  content: string
}

const contactInfo: ContactInfo[] = [
  {
    icon: FaMapMarkerAlt,
    title: 'Our Address',
    content: '10 Lam Van Ben, Tan Hung ward, HCM City, Vietnam',
  },
  {
    icon: FaPhone,
    title: 'Phone',
    content: '+84 96 345 2909',
  },
  {
    icon: FaEnvelope,
    title: 'Email',
    content: 'canhtran210699@gmail.com',
  },
]

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // This will be replaced with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: 'Message sent',
        description: 'We will get back to you soon!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      // Clear form
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

  const headingColor = useColorModeValue('gray.900', 'text.primary')
  const subtitleColor = useColorModeValue('gray.600', 'text.secondary')
  const iconColor = useColorModeValue('purple.600', 'purple.400')
  const infoText = useColorModeValue('gray.600', 'text.secondary')

  return (
    <MotionWrapper>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8}>
          <MotionWrapper
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            duration={0.8}
          >
            <Box textAlign="center">
              <Heading color={headingColor}>Contact Us</Heading>
              <Text mt={4} color={subtitleColor}>
                Have questions? We'd love to hear from you.
              </Text>
            </Box>
          </MotionWrapper>

          <MotionWrapper
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            duration={0.6}
            delay={0.2}
          >
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
              {contactInfo.map((info, index) => (
                <MotionWrapper
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  duration={0.5}
                  delay={0.3 + index * 0.1}
                >
                  <Glassmorphism
                    backdropBlur="10px"
                    bg="rgba(255, 255, 255, 0.1)"
                    borderRadius="2xl"
                    height="200px"
                  >
                    <VStack p={6} spacing={4} align="center" justify="center" height="100%">
                      <Icon as={info.icon} w={12} h={12} color={iconColor} />
                      <Text fontWeight="bold" fontSize="lg" color={headingColor}>
                        {info.title}
                      </Text>
                      <Text color={infoText} textAlign="center">
                        {info.content}
                      </Text>
                    </VStack>
                  </Glassmorphism>
                </MotionWrapper>
              ))}
            </SimpleGrid>
          </MotionWrapper>

          <MotionWrapper
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            duration={0.6}
            delay={0.4}
          >
            <Glassmorphism backdropBlur="15px" bg="rgba(255, 255, 255, 0.1)" borderRadius="3xl">
              <Box p={8}>
                <form onSubmit={handleSubmit}>
                  <Stack spacing={6}>
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
                        minH="200px"
                      />
                    </FormControl>

                    <AnimatedPrimaryButton type="submit" isLoading={isLoading}>
                      Send Message
                    </AnimatedPrimaryButton>
                  </Stack>
                </form>
              </Box>
            </Glassmorphism>
          </MotionWrapper>
        </VStack>
      </Container>
    </MotionWrapper>
  )
}

export default Contact

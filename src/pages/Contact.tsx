import { useState } from 'react'
import {
  Box,
  Button,
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

interface ContactInfo {
  icon: typeof FaMapMarkerAlt
  title: string
  content: string
}

const contactInfo: ContactInfo[] = [
  {
    icon: FaMapMarkerAlt,
    title: 'Our Address',
    content: '123 Blog Street, Digital City, 12345',
  },
  {
    icon: FaPhone,
    title: 'Phone',
    content: '+1 (555) 123-4567',
  },
  {
    icon: FaEnvelope,
    title: 'Email',
    content: 'contact@personalblog.com',
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

  const headerText = useColorModeValue('gray.600', 'text.secondary')
  const cardBg = useColorModeValue('white', 'bg.secondary')
  const iconColor = useColorModeValue('black', 'accent.primary')
  const infoText = useColorModeValue('gray.600', 'text.secondary')
  const buttonBg = useColorModeValue('black', 'accent.primary')
  const buttonHoverBg = useColorModeValue('gray.800', 'accent.hover')

  return (
    <Container maxW="container.xl" py={8}>
      <Stack spacing={8}>
        <Box textAlign="center">
          <Heading>Contact Us</Heading>
          <Text mt={4} color={headerText}>
            Have questions? We'd love to hear from you.
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
          {contactInfo.map((info, index) => (
            <VStack
              key={index}
              p={5}
              bg={cardBg}
              rounded="lg"
              shadow="md"
              spacing={4}
              align="center"
            >
              <Icon as={info.icon} w={10} h={10} color={iconColor} />
              <Text fontWeight="bold" fontSize="lg">
                {info.title}
              </Text>
              <Text color={infoText} textAlign="center">
                {info.content}
              </Text>
            </VStack>
          ))}
        </SimpleGrid>

        <Box p={8} bg={cardBg} rounded="lg" shadow="md">
          <form onSubmit={handleSubmit}>
            <Stack spacing={6}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input name="name" value={formData.name} onChange={handleChange} />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input name="email" type="email" value={formData.email} onChange={handleChange} />
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

              <Button
                type="submit"
                bg={buttonBg}
                color="white"
                _hover={{
                  bg: buttonHoverBg,
                }}
                isLoading={isLoading}
              >
                Send Message
              </Button>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Container>
  )
}

export default Contact

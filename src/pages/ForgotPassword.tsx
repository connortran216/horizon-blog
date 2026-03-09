import { FormEvent, useState } from 'react'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Link,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { AnimatedPrimaryButton } from '../components/core/animations/AnimatedButton'
import { authService } from '../core/services/auth.service'
import { AuthError } from '../core/types/auth.types'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const headingColor = useColorModeValue('gray.900', 'text.primary')
  const textColor = useColorModeValue('gray.600', 'text.secondary')
  const linkColor = useColorModeValue('black', 'link.default')

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    const trimmedEmail = email.trim()

    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await authService.requestPasswordReset(trimmedEmail)
      setEmail(trimmedEmail)
      setIsSubmitted(true)
    } catch (requestError) {
      if (requestError instanceof AuthError && requestError.statusCode === 400) {
        setError(requestError.message)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Container maxW="lg" py={{ base: '12', md: '24' }}>
      <Stack spacing="8">
        <Stack spacing="6" textAlign="center">
          <Heading color={headingColor}>Forgot your password?</Heading>
          <Text color={textColor}>
            Enter your email address and we'll send reset instructions if the account exists.
          </Text>
        </Stack>

        <Box
          py={{ base: '0', sm: '8' }}
          px={{ base: '4', sm: '10' }}
          bg={{ base: 'transparent', sm: 'bg-surface' }}
          boxShadow={{ base: 'none', sm: 'md' }}
          borderRadius={{ base: 'none', sm: 'xl' }}
        >
          {isSubmitted ? (
            <Stack spacing="6">
              <Alert status="info" borderRadius="lg" alignItems="flex-start">
                <AlertIcon mt="1" />
                <AlertDescription>
                  If the email exists, we sent password reset instructions.
                </AlertDescription>
              </Alert>

              <Text color={textColor}>
                Check the inbox for{' '}
                <Text as="span" fontWeight="semibold">
                  {email}
                </Text>{' '}
                and follow the link to continue.
              </Text>

              <Stack spacing="3">
                <AnimatedPrimaryButton as={RouterLink} to="/login" size="lg" fontSize="md">
                  Back to login
                </AnimatedPrimaryButton>
                <Link
                  as="button"
                  type="button"
                  color={linkColor}
                  onClick={() => {
                    setEmail('')
                    setError('')
                    setIsSubmitted(false)
                  }}
                >
                  Try another email
                </Link>
              </Stack>
            </Stack>
          ) : (
            <form onSubmit={handleSubmit}>
              <Stack spacing="6">
                <FormControl isInvalid={!!error} isRequired>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value)
                      if (error) {
                        setError('')
                      }
                    }}
                  />
                  <FormErrorMessage>{error}</FormErrorMessage>
                </FormControl>

                <AnimatedPrimaryButton
                  type="submit"
                  size="lg"
                  fontSize="md"
                  isLoading={isSubmitting}
                >
                  Send reset link
                </AnimatedPrimaryButton>

                <Text color={textColor} textAlign="center">
                  Remembered your password?{' '}
                  <Link as={RouterLink} to="/login" color={linkColor}>
                    Back to login
                  </Link>
                </Text>
              </Stack>
            </form>
          )}
        </Box>
      </Stack>
    </Container>
  )
}

export default ForgotPassword

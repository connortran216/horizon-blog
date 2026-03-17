import { FormEvent, useState } from 'react'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { AnimatedPrimaryButton } from '../../../components/core/animations/AnimatedButton'
import { authService } from '../../../core/services/auth.service'
import { AuthError } from '../../../core/types/auth.types'
import AuthShell, { AuthInlineLink } from '../components/AuthShell'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

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
    <AuthShell
      title="Forgot your password?"
      description="Enter your email address and we'll send reset instructions if the account exists."
    >
      {isSubmitted ? (
        <Stack spacing="6">
          <Alert status="info" borderRadius="lg" alignItems="flex-start">
            <AlertIcon mt="1" />
            <AlertDescription>
              If the email exists, we sent password reset instructions.
            </AlertDescription>
          </Alert>

          <Text color="text.secondary">
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
              color="link.default"
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

            <AnimatedPrimaryButton type="submit" size="lg" fontSize="md" isLoading={isSubmitting}>
              Send reset link
            </AnimatedPrimaryButton>

            <Text color="text.secondary" textAlign="center">
              Remembered your password? <AuthInlineLink to="/login">Back to login</AuthInlineLink>
            </Text>
          </Stack>
        </form>
      )}
    </AuthShell>
  )
}

export default ForgotPasswordPage

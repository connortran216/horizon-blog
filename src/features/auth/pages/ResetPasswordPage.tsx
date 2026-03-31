import { FormEvent, useEffect, useState } from 'react'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { AnimatedPrimaryButton } from '../../../components/core/animations/AnimatedButton'
import { authService } from '../../../core/services/auth.service'
import { AuthError } from '../../../core/types/auth.types'
import AuthShell, { AuthInlineLink } from '../components/AuthShell'

const ResetPasswordPage = () => {
  const [token, setToken] = useState<string | null>(null)
  const [tokenChecked, setTokenChecked] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isExpiredLink, setIsExpiredLink] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()
  const locationState = location.state as { from?: string } | null

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const tokenParam = searchParams.get('token')

    if (tokenParam) {
      setToken(tokenParam)
      navigate(location.pathname, { replace: true, state: location.state })
    }

    setTokenChecked(true)
  }, [location.pathname, location.search, location.state, navigate])

  const validateForm = () => {
    const nextErrors: Record<string, string> = {}

    if (!newPassword) {
      nextErrors.newPassword = 'New password is required'
    } else if (newPassword.length < 6) {
      nextErrors.newPassword = 'Password must be at least 6 characters'
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your new password'
    } else if (newPassword !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (!token || !validateForm()) {
      return
    }

    setIsSubmitting(true)
    setFormError('')

    try {
      await authService.resetPassword({
        token,
        newPassword,
        confirmPassword,
      })

      navigate('/login', {
        replace: true,
        state: {
          resetPasswordSuccess: true,
          ...(locationState?.from ? { from: locationState.from } : {}),
        },
      })
    } catch (resetError) {
      if (
        resetError instanceof AuthError &&
        resetError.statusCode === 400 &&
        resetError.message === 'Invalid or expired reset token'
      ) {
        setIsExpiredLink(true)
      } else if (resetError instanceof AuthError && resetError.statusCode === 400) {
        setFormError(resetError.message)
      } else {
        setFormError('Something went wrong. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const showInvalidLinkState = tokenChecked && (!token || isExpiredLink)

  return (
    <AuthShell title="Reset your password" description="Create a new password for your account.">
      {showInvalidLinkState ? (
        <Stack spacing="6">
          <Alert status="error" borderRadius="lg" alignItems="flex-start">
            <AlertIcon mt="1" />
            <AlertDescription>
              This reset link is invalid or has expired. Please request a new one.
            </AlertDescription>
          </Alert>

          <Stack spacing="3">
            <AnimatedPrimaryButton
              as={RouterLink}
              to="/forgot-password"
              size="lg"
              fontSize="md"
              w="full"
            >
              Request a new link
            </AnimatedPrimaryButton>
            <Text>
              <AuthInlineLink
                to="/login"
                state={locationState?.from ? { from: locationState.from } : undefined}
              >
                Back to login
              </AuthInlineLink>
            </Text>
          </Stack>
        </Stack>
      ) : (
        <form onSubmit={handleSubmit}>
          <Stack spacing="6">
            {formError ? (
              <Alert status="error" borderRadius="lg">
                <AlertIcon />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ) : null}

            <FormControl isInvalid={!!errors.newPassword} isRequired>
              <FormLabel htmlFor="newPassword">New password</FormLabel>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(event) => {
                  setNewPassword(event.target.value)
                  if (formError) {
                    setFormError('')
                  }
                  if (errors.newPassword || errors.confirmPassword) {
                    setErrors((current) => ({
                      ...current,
                      newPassword: '',
                      confirmPassword: '',
                    }))
                  }
                }}
              />
              <FormErrorMessage>{errors.newPassword}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.confirmPassword} isRequired>
              <FormLabel htmlFor="confirmPassword">Confirm password</FormLabel>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value)
                  if (formError) {
                    setFormError('')
                  }
                  if (errors.confirmPassword) {
                    setErrors((current) => ({
                      ...current,
                      confirmPassword: '',
                    }))
                  }
                }}
              />
              <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
            </FormControl>

            <AnimatedPrimaryButton type="submit" size="lg" fontSize="md" isLoading={isSubmitting}>
              Reset password
            </AnimatedPrimaryButton>

            <Text color="text.secondary" textAlign="center">
              Need a fresh link?{' '}
              <AuthInlineLink to="/forgot-password">Request a new one</AuthInlineLink>
            </Text>
          </Stack>
        </form>
      )}
    </AuthShell>
  )
}

export default ResetPasswordPage

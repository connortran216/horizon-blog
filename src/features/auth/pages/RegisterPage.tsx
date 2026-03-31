import { useState } from 'react'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatedPrimaryButton } from '../../../components/core/animations/AnimatedButton'
import { useAuth } from '../../../context/AuthContext'
import AuthMethodDivider from '../components/AuthMethodDivider'
import AuthShell, { AuthInlineLink } from '../components/AuthShell'
import GoogleAuthButton from '../components/GoogleAuthButton'

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const { register, isLoading } = useAuth()
  const locationState = location.state as { from?: string } | null
  const redirectTo = locationState?.from || '/'
  const providerDescription =
    redirectTo !== '/'
      ? 'Continue in one step and go back to the page you opened.'
      : 'Continue in one step without filling the full form first.'

  const validateForm = () => {
    const nextErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      nextErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nextErrors.email = 'Email is invalid'
    }

    if (!formData.password) {
      nextErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name] || (name === 'password' && errors.confirmPassword)) {
      setErrors((current) => ({
        ...current,
        [name]: '',
        ...(name === 'password' ? { confirmPassword: '' } : {}),
      }))
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const trimmedName = formData.name.trim()
      const trimmedEmail = formData.email.trim()

      await register({
        username: trimmedName,
        email: trimmedEmail,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      })

      toast({
        title: 'Registration successful',
        description: 'Welcome to Horizon.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      navigate(redirectTo, { replace: true })
    } catch {
      toast({
        title: 'Registration failed',
        description: 'Please try again later.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  return (
    <AuthShell
      title="Create an account"
      description={
        <>
          Already have an account?{' '}
          <AuthInlineLink
            to="/login"
            state={locationState?.from ? { from: locationState.from } : undefined}
          >
            Login here
          </AuthInlineLink>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <Stack spacing="6">
          <Stack spacing="3">
            <GoogleAuthButton redirectTo={redirectTo} isDisabled={isLoading} />
            <Text color="text.tertiary" fontSize="sm" textAlign="center">
              {providerDescription}
            </Text>
          </Stack>

          <AuthMethodDivider label="Or continue with email" />

          <FormControl isInvalid={!!errors.name} isRequired>
            <FormLabel htmlFor="name">Name</FormLabel>
            <Input
              id="name"
              name="name"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
            />
            <FormErrorMessage>{errors.name}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.email} isRequired>
            <FormLabel htmlFor="email">Email</FormLabel>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={formData.email}
              onChange={handleChange}
            />
            <FormErrorMessage>{errors.email}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.password} isRequired>
            <FormLabel htmlFor="password">Password</FormLabel>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
            />
            <FormErrorMessage>{errors.password}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.confirmPassword} isRequired>
            <FormLabel htmlFor="confirmPassword">Confirm password</FormLabel>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
          </FormControl>

          <AnimatedPrimaryButton
            type="submit"
            size="lg"
            fontSize="md"
            isLoading={isLoading}
            w="full"
          >
            Create account
          </AnimatedPrimaryButton>
        </Stack>
      </form>
    </AuthShell>
  )
}

export default RegisterPage

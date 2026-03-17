import { useState } from 'react'
import { FormControl, FormErrorMessage, FormLabel, Input, Stack, useToast } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { AnimatedPrimaryButton } from '../../../components/core/animations/AnimatedButton'
import { useAuth } from '../../../context/AuthContext'
import AuthShell, { AuthInlineLink } from '../components/AuthShell'

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
  const { register, isLoading } = useAuth()

  const validateForm = () => {
    const nextErrors: Record<string, string> = {}

    if (!formData.name) {
      nextErrors.name = 'Name is required'
    }

    if (!formData.email) {
      nextErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nextErrors.email = 'Email is invalid'
    }

    if (!formData.password) {
      nextErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters'
    }

    if (formData.password !== formData.confirmPassword) {
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
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await register({
        username: formData.name,
        email: formData.email,
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

      navigate('/')
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
          Already have an account? <AuthInlineLink to="/login">Login here</AuthInlineLink>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <Stack spacing="6">
          <FormControl isInvalid={!!errors.name} isRequired>
            <FormLabel>Name</FormLabel>
            <Input name="name" value={formData.name} onChange={handleChange} />
            <FormErrorMessage>{errors.name}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.email} isRequired>
            <FormLabel>Email</FormLabel>
            <Input name="email" type="email" value={formData.email} onChange={handleChange} />
            <FormErrorMessage>{errors.email}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.password} isRequired>
            <FormLabel>Password</FormLabel>
            <Input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
            />
            <FormErrorMessage>{errors.password}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.confirmPassword} isRequired>
            <FormLabel>Confirm Password</FormLabel>
            <Input
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
          </FormControl>

          <AnimatedPrimaryButton type="submit" isLoading={isLoading}>
            Register
          </AnimatedPrimaryButton>
        </Stack>
      </form>
    </AuthShell>
  )
}

export default RegisterPage

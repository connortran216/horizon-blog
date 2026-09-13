/**
 * Register - migrated onto Horizon Design System v2 (release M5).
 *
 * Presentation only. The same four values go to `useAuth().register` under the
 * same keys, the pending-verification branch still redirects to `/verify-email`
 * carrying the address and the return path, and the password rule is still
 * `getPasswordPolicyError` rather than anything restated here.
 *
 * Composed from `AuthPanel`, `AuthMethod` / `AuthMethodSeparator`, `Field` +
 * `Input`, `AuthAlert` and `Button`. Every validation message keeps its wording
 * and is now wired to its own control through `Field`, so an invalid field is
 * announced and marked `aria-invalid` instead of only turning red.
 */

import { useState } from 'react'
import { useToast } from '@chakra-ui/react'
import { FcGoogle } from 'react-icons/fc'
import { useLocation, useNavigate } from 'react-router-dom'

import {
  ActionLink,
  AuthAlert,
  AuthMethod,
  AuthMethodSeparator,
  AuthPanel,
  Button,
  Field,
  Input,
  Stack,
  Text,
} from '../../../design-system'
import { useAuth } from '../../../context/AuthContext'
import { getPasswordPolicyError } from '../../../core/utils/passwordPolicy'
import { buildGoogleSsoStartUrl } from '../utils/googleSso'

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isRedirectingToProvider, setIsRedirectingToProvider] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const { register, isLoading } = useAuth()
  const locationState = location.state as { from?: string } | null
  const redirectTo = locationState?.from || '/'
  const siblingState = locationState?.from ? { from: locationState.from } : undefined
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

    const passwordError = getPasswordPolicyError(formData.password)
    if (!formData.password) {
      nextErrors.password = 'Password is required'
    } else if (passwordError) {
      nextErrors.password = passwordError
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

    // Enter in any field submits the form without touching the button, so the
    // in-flight guard has to live here as well as on the control.
    if (isLoading) {
      return
    }

    setSubmitError(null)

    if (!validateForm()) {
      return
    }

    try {
      const trimmedName = formData.name.trim()
      const trimmedEmail = formData.email.trim()

      const result = await register({
        username: trimmedName,
        email: trimmedEmail,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      })

      if (result.pending) {
        toast({
          title: 'Check your email',
          description: 'Use the verification link before signing in.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })

        navigate('/verify-email', {
          replace: true,
          state: {
            email: trimmedEmail,
            ...(locationState?.from ? { from: locationState.from } : {}),
          },
        })
        return
      }

      toast({
        title: 'Registration successful',
        description: 'Welcome to Horizon.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      navigate(redirectTo, { replace: true })
    } catch {
      setSubmitError('Please try again later.')
    }
  }

  /**
   * The message the field-level errors are summarised by. `AuthPanel` uses its
   * presence to move the panel into its invalid state; the per-field messages
   * are what a reader actually corrects against, so nothing is restated here.
   */
  const firstFieldError = Object.values(errors).find((message) => message.length > 0)

  return (
    <AuthPanel
      title="Create an account"
      description={
        <>
          Already have an account?{' '}
          <ActionLink to="/login" state={siblingState}>
            Login here
          </ActionLink>
        </>
      }
      isSubmitting={isLoading}
      validationError={firstFieldError}
      feedback={
        submitError === null ? undefined : (
          <AuthAlert tone="error" title="Registration failed" detail={submitError} />
        )
      }
    >
      <form onSubmit={handleSubmit}>
        <Stack gap={6}>
          <Stack gap={3}>
            <AuthMethod
              provider="Google"
              startUrl={buildGoogleSsoStartUrl(redirectTo)}
              onStart={() => setIsRedirectingToProvider(true)}
              icon={<FcGoogle aria-hidden="true" />}
              isDisabled={isLoading}
              isRedirecting={isRedirectingToProvider}
            />
            <Text recipe="metadata" textAlign="center">
              {providerDescription}
            </Text>
          </Stack>

          <AuthMethodSeparator label="Or continue with email" />

          <Field label="Name" id="name" isRequired error={errors.name || undefined}>
            <Input name="name" autoComplete="name" value={formData.name} onChange={handleChange} />
          </Field>

          <Field label="Email" id="email" isRequired error={errors.email || undefined}>
            <Input
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={formData.email}
              onChange={handleChange}
            />
          </Field>

          <Field label="Password" id="password" isRequired error={errors.password || undefined}>
            <Input
              name="password"
              type="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
            />
          </Field>

          <Field
            label="Confirm password"
            id="confirmPassword"
            isRequired
            error={errors.confirmPassword || undefined}
          >
            <Input
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </Field>

          <Button
            type="submit"
            tone="primary"
            width="100%"
            isLoading={isLoading}
            loadingLabel="Creating your account"
          >
            Create account
          </Button>
        </Stack>
      </form>
    </AuthPanel>
  )
}

export default RegisterPage

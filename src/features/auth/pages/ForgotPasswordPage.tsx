/**
 * Forgot password - migrated onto Horizon Design System v2 (release M5).
 *
 * Presentation only. The same address validation runs before the request, the
 * same `authService.requestPasswordReset` is called with the trimmed address,
 * and the same two error branches survive: a 400 shows the message the service
 * returned, anything else shows the generic sentence. The confirmation is still
 * conditional - "if the email exists" - because the endpoint deliberately does
 * not say whether it did, and the screen must not say more than the endpoint.
 *
 * Composed from `AuthPanel`, `Field` + `Input`, `AuthAlert` and `Button`.
 */

import { FormEvent, useState } from 'react'

import {
  ActionLink,
  AuthAlert,
  AuthPanel,
  Button,
  Field,
  Input,
  Stack,
  Text,
} from '../../../design-system'
import { useLocation } from 'react-router-dom'
import { authService } from '../../../core/services/auth.service'
import { AuthError } from '../../../core/types/auth.types'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const location = useLocation()
  const locationState = location.state as { from?: string } | null
  const siblingState = locationState?.from ? { from: locationState.from } : undefined

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    // The submit button swallows its own clicks while busy; Enter bypasses it.
    if (isSubmitting) {
      return
    }

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
    <AuthPanel
      title="Forgot your password?"
      description="Enter your email address and we'll send reset instructions if the account exists."
      isSubmitting={isSubmitting}
      validationError={isSubmitted ? undefined : error || undefined}
    >
      {isSubmitted ? (
        <Stack gap={6}>
          {/*
           * Deliberately not a claim that the address exists. The title names
           * what the reader should do next and the detail is the endpoint's own
           * conditional sentence, unchanged - and the tone matches it: `info`
           * draws a neutral surface and a neutral mark, where `success` drew a
           * tick that said the address had been found.
           */}
          <AuthAlert
            tone="info"
            title="Check your inbox"
            detail="If the email exists, we sent password reset instructions."
          />

          <Text recipe="body">
            Check the inbox for{' '}
            <Text as="span" recipe="body" fontWeight="semibold" overflowWrap="anywhere">
              {email}
            </Text>{' '}
            and follow the link to continue.
          </Text>

          <Stack gap={3}>
            <ActionLink to="/login" state={siblingState} weight="primary" width="100%">
              Back to login
            </ActionLink>
            <Button
              tone="link"
              onClick={() => {
                setEmail('')
                setError('')
                setIsSubmitted(false)
              }}
            >
              Try another email
            </Button>
          </Stack>
        </Stack>
      ) : (
        <form onSubmit={handleSubmit}>
          <Stack gap={6}>
            <Field label="Email" id="email" isRequired error={error || undefined}>
              <Input
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  if (error) {
                    setError('')
                  }
                }}
              />
            </Field>

            <Button
              type="submit"
              tone="primary"
              width="100%"
              isLoading={isSubmitting}
              loadingLabel="Sending the reset link"
            >
              Send reset link
            </Button>

            <Text recipe="metadata" textAlign="center">
              Remembered your password?{' '}
              <ActionLink to="/login" state={siblingState}>
                Back to login
              </ActionLink>
            </Text>
          </Stack>
        </form>
      )}
    </AuthPanel>
  )
}

export default ForgotPasswordPage

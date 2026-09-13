/**
 * Reset password - migrated onto Horizon Design System v2 (release M5).
 *
 * Presentation only. The token is still lifted out of the query string and
 * removed from the URL on arrival, `authService.resetPassword` receives the same
 * three values, and success still lands on `/login` with `resetPasswordSuccess`
 * so the sign-in screen can confirm it. The expired-link branch still keys on
 * the service's exact 400 message; that string is the contract with the backend
 * and is reproduced character for character.
 *
 * Composed from `AuthPanel`, `Field` + `Input`, `AuthAlert`, `Button` and a
 * router link for the two ways out of an unusable link.
 */

import { FormEvent, useEffect, useState } from 'react'

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
import { useLocation, useNavigate } from 'react-router-dom'
import { authService } from '../../../core/services/auth.service'
import { AuthError } from '../../../core/types/auth.types'
import { getPasswordPolicyError } from '../../../core/utils/passwordPolicy'

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
  const siblingState = locationState?.from ? { from: locationState.from } : undefined

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

    const passwordError = getPasswordPolicyError(newPassword)
    if (!newPassword) {
      nextErrors.newPassword = 'New password is required'
    } else if (passwordError) {
      nextErrors.newPassword = passwordError
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

    // Enter in either password field submits without going through the button.
    if (isSubmitting) {
      return
    }

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
  const firstFieldError = Object.values(errors).find((message) => message.length > 0)

  return (
    <AuthPanel
      title="Reset your password"
      description="Create a new password for your account."
      isSubmitting={isSubmitting}
      validationError={showInvalidLinkState ? undefined : firstFieldError}
    >
      {showInvalidLinkState ? (
        <Stack gap={6}>
          <AuthAlert
            tone="error"
            title="This reset link cannot be used"
            detail="This reset link is invalid or has expired. Please request a new one."
          />

          <Stack gap={3}>
            <ActionLink to="/forgot-password" weight="primary" width="100%">
              Request a new link
            </ActionLink>
            <Text recipe="metadata" textAlign="center">
              <ActionLink to="/login" state={siblingState}>
                Back to login
              </ActionLink>
            </Text>
          </Stack>
        </Stack>
      ) : (
        <form onSubmit={handleSubmit}>
          <Stack gap={6}>
            {/*
             * The title names our side of the failure only. The reason, when the
             * backend was willing to give one, is `formError` and is unchanged.
             */}
            {formError === '' ? null : (
              <AuthAlert tone="error" title="We could not reset your password" detail={formError} />
            )}

            <Field
              label="New password"
              id="newPassword"
              isRequired
              error={errors.newPassword || undefined}
            >
              <Input
                type="password"
                autoComplete="new-password"
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
            </Field>

            <Field
              label="Confirm password"
              id="confirmPassword"
              isRequired
              error={errors.confirmPassword || undefined}
            >
              <Input
                type="password"
                autoComplete="new-password"
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
            </Field>

            <Button
              type="submit"
              tone="primary"
              width="100%"
              isLoading={isSubmitting}
              loadingLabel="Saving your new password"
            >
              Reset password
            </Button>

            <Text recipe="metadata" textAlign="center">
              Need a fresh link? <ActionLink to="/forgot-password">Request a new one</ActionLink>
            </Text>
          </Stack>
        </form>
      )}
    </AuthPanel>
  )
}

export default ResetPasswordPage

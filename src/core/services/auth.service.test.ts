import { describe, expect, it, vi } from 'vitest'

import { AuthSessionService } from './auth-session.service'
import { AuthService } from './auth.service'
import { AuthTransport, AuthTransportError } from './auth.transport'

const registration = {
  username: 'Example',
  email: 'user@example.com',
  password: 'correct-horse-battery',
  confirmPassword: 'correct-horse-battery',
}

const createDependencies = () => {
  const sessions = {
    login: vi.fn(),
    installLegacyRegistrationResponse: vi.fn((response: unknown) => response),
  } as unknown as AuthSessionService
  const transport = {
    register: vi.fn(),
    verifyEmail: vi.fn(),
    resendVerification: vi.fn(),
  } as unknown as AuthTransport
  return { sessions, transport, service: new AuthService(sessions, transport) }
}

describe('AuthService verified registration', () => {
  it('returns the pending result without installing a session', async () => {
    const { sessions, transport, service } = createDependencies()
    vi.mocked(transport.register).mockResolvedValue({ message: 'Check your email.' })

    await expect(service.register(registration)).resolves.toEqual({
      pending: true,
      message: 'Check your email.',
    })
    expect(sessions.login).not.toHaveBeenCalled()
  })

  it('temporarily accepts the legacy registration session during staged rollout', async () => {
    const { sessions, transport, service } = createDependencies()
    const legacyResponse = {
      access_token: 'legacy-access',
      token_type: 'Bearer' as const,
      expires_in: 900,
      data: { id: 1, email: 'user@example.com', name: 'Example' },
      message: 'Registered',
    }
    vi.mocked(transport.register).mockResolvedValue(legacyResponse)

    await expect(service.register(registration)).resolves.toEqual({
      pending: false,
      message: 'Registered',
      user: { id: 1, email: 'user@example.com', username: 'Example' },
    })
    expect(sessions.installLegacyRegistrationResponse).toHaveBeenCalledWith(legacyResponse)
  })

  it('preserves the stable unverified login error code', async () => {
    const { sessions, service } = createDependencies()
    vi.mocked(sessions.login).mockRejectedValue(
      new AuthTransportError('Verify your email to continue.', 403, 'EMAIL_VERIFICATION_REQUIRED'),
    )

    await expect(
      service.login({ email: 'user@example.com', password: 'correct-horse-battery' }),
    ).rejects.toEqual(
      expect.objectContaining({
        code: 'EMAIL_VERIFICATION_REQUIRED',
        message: 'Verify your email to continue.',
        statusCode: 403,
      }),
    )
  })

  it('validates and delegates verify and resend operations', async () => {
    const { transport, service } = createDependencies()
    vi.mocked(transport.verifyEmail).mockResolvedValue(undefined)
    vi.mocked(transport.resendVerification).mockResolvedValue({ message: 'Check your email.' })

    await expect(service.verifyEmail('selector.secret')).resolves.toBeUndefined()
    await expect(service.resendVerification('user@example.com')).resolves.toBe('Check your email.')
    await expect(service.verifyEmail('')).rejects.toMatchObject({
      code: 'INVALID_VERIFICATION_TOKEN',
    })
  })
})

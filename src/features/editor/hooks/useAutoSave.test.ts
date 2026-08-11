import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../../core/services/api.service'
import { recoverFromPermissionLoss } from './useAutoSave'

describe('autosave permission-loss recovery', () => {
  it('preserves the draft, stops backend writes, and refreshes authorization on 403', async () => {
    const preserveDraft = vi.fn()
    const stopBackendSave = vi.fn()
    const refreshAuthorization = vi.fn().mockResolvedValue(undefined)

    await expect(
      recoverFromPermissionLoss(new ApiError('Access denied', 403), {
        preserveDraft,
        stopBackendSave,
        refreshAuthorization,
      }),
    ).resolves.toBe(true)

    expect(preserveDraft).toHaveBeenCalledOnce()
    expect(stopBackendSave).toHaveBeenCalledOnce()
    expect(refreshAuthorization).toHaveBeenCalledOnce()
    expect(preserveDraft.mock.invocationCallOrder[0]).toBeLessThan(
      stopBackendSave.mock.invocationCallOrder[0],
    )
  })

  it('does not treat ordinary save failures as a permission change', async () => {
    const preserveDraft = vi.fn()
    const stopBackendSave = vi.fn()
    const refreshAuthorization = vi.fn()

    await expect(
      recoverFromPermissionLoss(new ApiError('Temporary failure', 503), {
        preserveDraft,
        stopBackendSave,
        refreshAuthorization,
      }),
    ).resolves.toBe(false)

    expect(preserveDraft).not.toHaveBeenCalled()
    expect(stopBackendSave).not.toHaveBeenCalled()
    expect(refreshAuthorization).not.toHaveBeenCalled()
  })
})

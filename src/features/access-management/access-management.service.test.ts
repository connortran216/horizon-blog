import { describe, expect, it, vi } from 'vitest'
import { AccessManagementApi } from './access-management.api'
import { AccessManagementService } from './access-management.service'
import { ApiError } from '../../core/services/api.service'
import { accessManagementErrorMessage } from './useAccessManagement'

describe('AccessManagementService', () => {
  it('delegates list and role assignment to the API adapter', async () => {
    const api = {
      listUsers: vi.fn().mockResolvedValue({ data: [], page: 1, limit: 20, total: 0 }),
      assignRole: vi.fn().mockResolvedValue({
        data: { id: 7, name: 'Author', email: 'author@example.com', role: 'author' },
        changed: true,
      }),
    } as unknown as AccessManagementApi
    const service = new AccessManagementService(api)

    await expect(service.listUsers()).resolves.toMatchObject({ total: 0 })
    await expect(service.assignRole(7, 'author')).resolves.toMatchObject({ changed: true })
    expect(api.assignRole).toHaveBeenCalledWith(7, 'author')
  })

  it.each([
    [400, 'Choose a supported role.'],
    [403, 'Your account can no longer assign roles.'],
    [404, 'This user no longer exists.'],
    [409, 'At least one administrator must remain.'],
  ])('maps API status %s to a stable admin message', (status, expected) => {
    expect(accessManagementErrorMessage(new ApiError('transport detail', status))).toBe(expected)
  })

  it('preserves the backend no-change result for idempotent assignments', async () => {
    const api = {
      assignRole: vi.fn().mockResolvedValue({
        data: { id: 7, name: 'Author', email: 'author@example.com', role: 'author' },
        changed: false,
      }),
    } as unknown as AccessManagementApi

    await expect(new AccessManagementService(api).assignRole(7, 'author')).resolves.toMatchObject({
      changed: false,
    })
  })
})

import { useCallback, useEffect, useState } from 'react'
import { Role } from '../../core/authorization/authorization'
import { ApiError } from '../../core/services/api.service'
import { getAccessManagementService } from './access-management.service'
import { RoleAssignment } from './access-management.types'

export const accessManagementErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.status === 409) return 'At least one administrator must remain.'
    if (error.status === 403) return 'Your account can no longer assign roles.'
    if (error.status === 404) return 'This user no longer exists.'
    if (error.status === 400) return 'Choose a supported role.'
  }
  return error instanceof Error ? error.message : 'Access management is temporarily unavailable.'
}

export const useAccessManagement = () => {
  const [users, setUsers] = useState<RoleAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const service = getAccessManagementService()

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await service.listUsers()
      setUsers(response.data)
    } catch (caught) {
      setError(accessManagementErrorMessage(caught))
    } finally {
      setLoading(false)
    }
  }, [service])

  useEffect(() => {
    void load()
  }, [load])

  const assignRole = async (userId: number, role: Role) => {
    setUpdatingUserId(userId)
    setError(null)
    setNotice(null)
    try {
      const response = await service.assignRole(userId, role)
      setUsers((current) => current.map((user) => (user.id === userId ? response.data : user)))
      setNotice(response.changed ? 'Role updated.' : 'This user already has that role.')
    } catch (caught) {
      setError(accessManagementErrorMessage(caught))
    } finally {
      setUpdatingUserId(null)
    }
  }

  return { users, loading, updatingUserId, error, notice, assignRole, reload: load }
}

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
  // The list itself failing is a different state from a role change failing:
  // one blocks the whole page, the other blocks one row. `listDenied` lets the
  // page choose `PermissionState` over a generic `ErrorState` when the reason
  // is a 403 specifically.
  const [listError, setListError] = useState<string | null>(null)
  const [listDenied, setListDenied] = useState(false)
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null)
  const [assignError, setAssignError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  // Which user's last confirmed assignment the server reported as a no-op.
  // Kept separate from `notice` so the access table can show it beside that
  // one row instead of as a page-wide banner nobody can tie to a person.
  const [unchangedUserId, setUnchangedUserId] = useState<number | null>(null)
  const service = getAccessManagementService()

  const load = useCallback(async () => {
    setLoading(true)
    setListError(null)
    setListDenied(false)
    try {
      const response = await service.listUsers()
      setUsers(response.data)
    } catch (caught) {
      setListDenied(caught instanceof ApiError && caught.status === 403)
      setListError(accessManagementErrorMessage(caught))
    } finally {
      setLoading(false)
    }
  }, [service])

  useEffect(() => {
    void load()
  }, [load])

  /**
   * Asks the server to change a role and reports whether it succeeded.
   *
   * The caller decides what a `false` result means for its own UI - a
   * confirmation dialog stays open, a row keeps its "failed" message - this
   * function's job ends at reflecting the server's own answer: `users` is
   * only ever updated from `response.data`, never from `role` itself, so a
   * rejected or still-pending request can never show as applied.
   */
  const assignRole = async (userId: number, role: Role): Promise<boolean> => {
    setUpdatingUserId(userId)
    setAssignError(null)
    setNotice(null)
    setUnchangedUserId(null)
    try {
      const response = await service.assignRole(userId, role)
      setUsers((current) => current.map((user) => (user.id === userId ? response.data : user)))
      if (response.changed) {
        setNotice('Role updated.')
      } else {
        setNotice('This user already has that role.')
        setUnchangedUserId(userId)
      }
      return true
    } catch (caught) {
      setAssignError(accessManagementErrorMessage(caught))
      return false
    } finally {
      setUpdatingUserId(null)
    }
  }

  return {
    users,
    loading,
    listError,
    listDenied,
    updatingUserId,
    assignError,
    notice,
    unchangedUserId,
    assignRole,
    reload: load,
  }
}

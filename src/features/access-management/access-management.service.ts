import { Role } from '../../core/authorization/authorization'
import { AccessManagementApi } from './access-management.api'
import { RoleAssignmentPage, RoleAssignmentUpdate } from './access-management.types'

export class AccessManagementService {
  constructor(private readonly api: AccessManagementApi = new AccessManagementApi()) {}

  listUsers(): Promise<RoleAssignmentPage> {
    return this.api.listUsers()
  }

  assignRole(userId: number, role: Role): Promise<RoleAssignmentUpdate> {
    return this.api.assignRole(userId, role)
  }
}

let singleton: AccessManagementService | undefined

export const getAccessManagementService = (): AccessManagementService => {
  singleton ??= new AccessManagementService()
  return singleton
}

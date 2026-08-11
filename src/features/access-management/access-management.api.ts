import { apiService } from '../../core/services/api.service'
import { RoleAssignmentPage, RoleAssignmentUpdate } from './access-management.types'
import { Role } from '../../core/authorization/authorization'

export class AccessManagementApi {
  listUsers(): Promise<RoleAssignmentPage> {
    return apiService.get<RoleAssignmentPage>('/admin/users')
  }

  assignRole(userId: number, role: Role): Promise<RoleAssignmentUpdate> {
    return apiService.patch<RoleAssignmentUpdate>(`/admin/users/${userId}/role`, { role })
  }
}

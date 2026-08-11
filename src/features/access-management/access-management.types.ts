import { Role } from '../../core/authorization/authorization'

export interface RoleAssignment {
  id: number
  name: string
  email: string
  role: Role
}

export interface RoleAssignmentPage {
  data: RoleAssignment[]
  page: number
  limit: number
  total: number
}

export interface RoleAssignmentUpdate {
  data: RoleAssignment
  changed: boolean
}

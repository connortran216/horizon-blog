export const ROLES = ['member', 'author', 'admin'] as const
export type Role = (typeof ROLES)[number]

export const PERMISSIONS = [
  'profile:manage:self',
  'comments:participate',
  'content:manage:own',
  'analytics:read:own',
  'comments:moderate:own',
  'content:manage:any',
  'taxonomy:manage',
  'roles:assign',
] as const

export type Permission = (typeof PERMISSIONS)[number]

export interface AuthorizationContext {
  role: Role
  permissions: Permission[]
}

const permissionSet = new Set<string>(PERMISSIONS)
const roleSet = new Set<string>(ROLES)

export const isAuthorizationContext = (value: unknown): value is AuthorizationContext => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as { role?: unknown; permissions?: unknown }
  return (
    typeof candidate.role === 'string' &&
    roleSet.has(candidate.role) &&
    Array.isArray(candidate.permissions) &&
    candidate.permissions.every(
      (permission) => typeof permission === 'string' && permissionSet.has(permission),
    )
  )
}

export const can = (
  authorization: AuthorizationContext | null | undefined,
  permission: Permission,
): boolean => authorization?.permissions.includes(permission) ?? false

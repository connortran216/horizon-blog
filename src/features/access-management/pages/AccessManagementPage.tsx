/**
 * Access management - migrated onto Horizon Design System v2.
 *
 * The table is `PermissionTable`: the select always shows `serverRole`, never
 * the role an administrator just picked, in every one of its states. Picking a
 * different role does not call the server - it stages a `DestructiveAction`
 * confirmation, because a role change is exactly the "revoke access" case that
 * pattern exists for, and only `onConfirm` calls `assignRole`. The dialogue
 * stays open on failure, with the server's own message on it, so a refusal is
 * never quietly swallowed - closing it happens only after a request the server
 * actually accepted.
 *
 * `horizon-blog-dsv2.6.3` acceptance 3 is the whole point of this page: no
 * branch here decides authorisation, and no branch shows a change as applied
 * before the response that says so.
 */

import { useMemo, useState } from 'react'

import {
  ContentContainer,
  DestructiveAction,
  EmptyState,
  ErrorState,
  Eyebrow,
  Heading,
  PageLoading,
  PermissionState,
  PermissionTable,
  RetryAction,
  Section,
  Stack,
  Text,
  roleChangeConfirmation,
  type PermissionSubject,
  type RoleOption,
} from '../../../design-system'
import { ROLES, type Role } from '../../../core/authorization/authorization'
import { useAccessManagement } from '../useAccessManagement'

const ROLE_CAPABILITIES: Record<Role, string> = {
  member: 'Read blogs, join discussions, and manage their own profile.',
  author:
    'Everything a member can do, plus write and publish blogs and see analytics for their own writing.',
  admin: 'Manage any blog, the taxonomy, and who holds which role.',
}

const roleOptions: RoleOption[] = ROLES.map((role) => ({
  value: role,
  label: role,
  capabilities: ROLE_CAPABILITIES[role],
}))

interface PendingRoleChange {
  userId: number
  role: Role
}

const AccessManagementPage = () => {
  const {
    users,
    loading,
    listError,
    listDenied,
    updatingUserId,
    assignError,
    unchangedUserId,
    assignRole,
    reload,
  } = useAccessManagement()
  const [pendingChange, setPendingChange] = useState<PendingRoleChange | null>(null)

  const pendingUser = useMemo(
    () => (pendingChange ? (users.find((user) => user.id === pendingChange.userId) ?? null) : null),
    [pendingChange, users],
  )

  // At most one administrator's worth of protection: the server already
  // refuses to demote the last admin (a 409, surfaced through the same
  // `assignError` this page already shows), so this only saves that round
  // trip by disabling the control the server would have refused anyway.
  const adminCount = users.filter((user) => user.role === 'admin').length

  const handleRequestRole = (subjectId: string, role: string) => {
    const userId = Number(subjectId)
    const user = users.find((candidate) => candidate.id === userId)

    if (!user || !isRole(role)) return
    // Picking the role a person already has confirms nothing, so it opens no
    // dialogue - `roleChangeConfirmation` returning `null` is the check.
    if (roleChangeConfirmation(user.name, user.role, role) === null) return

    setPendingChange({ userId, role })
  }

  const handleConfirmRoleChange = async () => {
    if (!pendingChange) return

    const succeeded = await assignRole(pendingChange.userId, pendingChange.role)
    if (succeeded) {
      setPendingChange(null)
    }
    // On failure the dialogue stays open; `assignError` below carries the
    // server's reason onto it.
  }

  if (loading) {
    return <PageLoading task="access and role assignments" />
  }

  if (listError !== null && users.length === 0) {
    return (
      <ContentContainer>
        <Section density="comfortable">
          {listDenied ? (
            <PermissionState
              deniedAction="view access management"
              detail="Ask an administrator to grant the roles:assign permission."
            />
          ) : (
            <ErrorState failedAction="load the access list" detail={listError}>
              <RetryAction failedAction="load the access list" onRetry={() => void reload()} />
            </ErrorState>
          )}
        </Section>
      </ContentContainer>
    )
  }

  const subjects: PermissionSubject[] = users.map((user) => {
    const isPending = pendingChange?.userId === user.id
    const isLastAdmin = user.role === 'admin' && adminCount <= 1

    return {
      id: String(user.id),
      name: user.name,
      email: user.email,
      serverRole: user.role,
      requestedRole: isPending ? pendingChange.role : undefined,
      isSaving: updatingUserId === user.id,
      error: isPending && assignError !== null ? assignError : undefined,
      reportedUnchanged: unchangedUserId === user.id,
      isLocked: isLastAdmin,
      lockReason: isLastAdmin
        ? 'This is the last administrator. The server keeps at least one.'
        : undefined,
    }
  })

  return (
    <ContentContainer>
      <Section density="comfortable">
        <Stack gap={4} maxW="3xl">
          <Eyebrow as="p">Administration</Eyebrow>
          <Heading as="h1" recipe="pageTitle">
            Access management
          </Heading>
          <Text recipe="body" color="text.secondary">
            Assign the fixed member, author, and admin roles. Permission changes apply on the next
            protected request each person makes to the server.
          </Text>
        </Stack>
      </Section>

      <Section density="compact">
        <Stack gap={6}>
          {users.length === 0 ? (
            <EmptyState subject="people with an account" nextAction="Nobody has signed up yet." />
          ) : (
            <PermissionTable
              subjects={subjects}
              roles={roleOptions}
              onRequestRole={handleRequestRole}
            />
          )}

          {pendingChange && pendingUser ? (
            <DestructiveAction
              action={`Change ${pendingUser.name} to ${pendingChange.role}`}
              subject={`${pendingUser.name} is currently ${pendingUser.role}`}
              consequence={`${ROLE_CAPABILITIES[pendingChange.role]} This applies on their next request and can be changed back.`}
              isReversible
              isSubmitting={updatingUserId === pendingChange.userId}
              error={assignError ?? undefined}
              onConfirm={() => void handleConfirmRoleChange()}
              onCancel={() => setPendingChange(null)}
            />
          ) : null}
        </Stack>
      </Section>
    </ContentContainer>
  )
}

const isRole = (value: string): value is Role => (ROLES as readonly string[]).includes(value)

export default AccessManagementPage

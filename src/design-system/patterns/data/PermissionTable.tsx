/**
 * Horizon Design System v2 - the access-management table.
 *
 * People, the role the server holds for each of them, and what that role can
 * do. It replaces the table in the legacy `AccessManagementPage`.
 *
 * `horizon-blog-dsv2.6.3` acceptance 3 is the whole design of this component.
 * The select shows `serverRole` in every state - while a change is being
 * confirmed, while the request is in flight, and after it has failed. Choosing a
 * role raises `onRequestRole`; it does not change what the table displays.
 * Nothing here decides authorisation, and nothing here shows a permission
 * change as done before the server has said it is.
 *
 * The consequence column is the second half of that. "admin" is a word; "Manage
 * content, taxonomy and role assignments" is what the administrator is actually
 * granting, and it belongs next to the control rather than in a legend below
 * the fold.
 */

import { Box, Flex } from '@chakra-ui/react'

import { componentTokens, space } from '../../../theme/tokens'
import { Field, Select } from '../../components/forms'
import { Stack } from '../../components/layout'
import { Text } from '../../components/typography'
import { DataTable } from './DataTable'
import { Avatar } from '../account/AvatarEditor'
import { permissionRowState, type PermissionRowInput } from './permission.logic'
import type { DataPanelStateInput } from './metric.logic'

export interface PermissionSubject {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly avatarUrl?: string | null
  /** The role the server last confirmed. The only role ever displayed. */
  readonly serverRole: string
  /** Chosen but not yet confirmed by the server. */
  readonly requestedRole?: string
  readonly isSaving?: boolean
  readonly error?: string
  readonly reportedUnchanged?: boolean
  /** This row cannot be changed - the last administrator, or the viewer. */
  readonly isLocked?: boolean
  readonly lockReason?: string
}

export interface RoleOption {
  readonly value: string
  readonly label: string
  /** What the role can do, in the administrator's words. */
  readonly capabilities: string
}

export interface PermissionTableProps extends Omit<DataPanelStateInput, 'rowCount'> {
  subjects: readonly PermissionSubject[]
  roles: readonly RoleOption[]
  /** Raised when a role is chosen. The caller confirms and calls the server. */
  onRequestRole: (subjectId: string, role: string) => void
  caption?: string
  title?: string
  detail?: string
  deniedDetail?: string
}

export function PermissionTable({
  subjects,
  roles,
  onRequestRole,
  caption = 'People and their roles',
  title = 'Access',
  detail = 'Roles apply on the next request each person makes to the server.',
  deniedDetail,
  isLoading,
  deniedAction,
  failedAction,
}: PermissionTableProps) {
  const capabilitiesFor = (role: string) =>
    roles.find((option) => option.value === role)?.capabilities ?? 'Capabilities unavailable'

  return (
    <DataTable<PermissionSubject>
      caption={caption}
      title={title}
      detail={detail}
      rows={subjects}
      rowKey={(subject) => subject.id}
      isLoading={isLoading}
      deniedAction={deniedAction}
      deniedDetail={deniedDetail}
      failedAction={failedAction}
      emptySubject="people with an account"
      emptyNextAction="Nobody has signed up yet, or the search matched nothing."
      columns={[
        {
          key: 'person',
          label: 'Person',
          render: (subject) => (
            <Flex align="center" gap={space[3]} minW="0">
              <Avatar name={subject.name} src={subject.avatarUrl} size="sm" />
              <Box minW="0">
                <Text recipe="body" as="span" color="text.primary" display="block">
                  {subject.name}
                </Text>
                <Text recipe="metadata">{subject.email}</Text>
              </Box>
            </Flex>
          ),
        },
        {
          key: 'role',
          label: 'Role',
          render: (subject) => {
            const state = permissionRowState(subject as PermissionRowInput)

            return (
              <Stack gap={1} minW="0">
                {/*
                 * A real `Field`, with the label hidden rather than absent.
                 * The column header names the column, not this control, and a
                 * select announced only as "combobox" in a table of four rows
                 * is four identical controls.
                 */}
                <Field label={`Role for ${subject.name}`} labelHidden isDisabled={!state.canEdit}>
                  <Select
                    /*
                     * `state.displayedRole`, which is always the server's
                     * answer. Binding this to `requestedRole` would show the
                     * change as applied before the server had accepted it -
                     * the exact optimism this pattern must not have.
                     */
                    value={state.displayedRole}
                    onChange={(event) => onRequestRole(subject.id, event.target.value)}
                  >
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </Select>
                </Field>

                {state.message === null ? null : (
                  <Text
                    recipe="metadata"
                    role={state.interrupts ? 'alert' : 'status'}
                    aria-live={state.interrupts ? 'assertive' : 'polite'}
                    color={
                      state.status === 'failed' ? componentTokens.field.invalidText : 'text.muted'
                    }
                  >
                    {state.message}
                  </Text>
                )}
              </Stack>
            )
          },
        },
        {
          key: 'capabilities',
          label: 'What this role can do',
          render: (subject) => (
            // Reads the confirmed role, not the requested one, so the sentence
            // never describes access somebody does not yet have.
            <Text recipe="metadata">{capabilitiesFor(subject.serverRole)}</Text>
          ),
        },
      ]}
    />
  )
}

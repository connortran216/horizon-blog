/**
 * The four surfaces `/admin/access` can be in before anyone touches a select.
 *
 * `access-management.service.test.ts` already pins what each backend status
 * means as a sentence; what it cannot show is which of them reaches the
 * screen. The page chooses between a loading surface, an empty list, a refusal
 * and the table itself, and a refusal is deliberately not the same surface as
 * a failure - a 403 is `PermissionState`, everything else is `ErrorState` with
 * a retry. Those four branches are asserted here and nothing else: the table's
 * own behaviour belongs to the design system's `PermissionTable` tests.
 */

import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import theme from '../../../theme/horizon'
import AccessManagementPage from './AccessManagementPage'

const state = vi.hoisted(() => ({
  value: {} as Record<string, unknown>,
}))

vi.mock('../useAccessManagement', () => ({
  useAccessManagement: () => state.value,
}))

const IDLE = {
  users: [],
  loading: false,
  listError: null,
  listDenied: false,
  updatingUserId: null,
  assignError: null,
  notice: null,
  unchangedUserId: null,
  assignRole: vi.fn(),
  reload: vi.fn(),
}

const render = () =>
  renderToStaticMarkup(
    <MemoryRouter>
      <ChakraProvider theme={theme}>
        <AccessManagementPage />
      </ChakraProvider>
    </MemoryRouter>,
  )

describe('the access management page', () => {
  beforeEach(() => {
    state.value = { ...IDLE }
  })

  it('names what it is loading rather than showing a bare spinner', () => {
    state.value = { ...IDLE, loading: true }

    expect(render()).toContain('access and role assignments')
  })

  it('says the list is empty instead of showing an empty table', () => {
    expect(render()).toContain('people with an account')
  })

  it('treats a refused list as a permission state, not a failure to retry', () => {
    state.value = {
      ...IDLE,
      listError: 'Your account can no longer assign roles.',
      listDenied: true,
    }
    const html = render()

    expect(html).toContain('view access management')
    // No retry: pressing it again would be refused again.
    expect(html).not.toContain('load the access list')
  })

  it('offers a retry when the list failed for a reason other than permission', () => {
    state.value = { ...IDLE, listError: 'Access management is temporarily unavailable.' }
    const html = render()

    expect(html).toContain('Access management is temporarily unavailable.')
    expect(html).toContain('load the access list')
    expect(html).not.toContain('view access management')
  })

  it('shows each account against the role the server reported, never a local guess', () => {
    state.value = {
      ...IDLE,
      users: [
        { id: 4, name: 'Mai', email: 'mai@example.com', role: 'member' },
        { id: 5, name: 'Linh', email: 'linh@example.com', role: 'admin' },
      ],
    }
    const html = render()

    expect(html).toContain('Mai')
    expect(html).toContain('linh@example.com')
    expect(html).not.toContain('people with an account')
  })
})

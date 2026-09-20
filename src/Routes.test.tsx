/**
 * The route permission matrix, as markup.
 *
 * `ProtectedRoute` has its own tests for how one gate behaves. What those
 * cannot catch is a gate attached to the wrong address, which is exactly what
 * happened here: `analytics:read:own` was declared on the two `/profile`
 * routes while `/analytics` carried no permission at all, so a member who
 * typed `/analytics` walked straight in and a member who opened their own
 * profile was refused. FR-004 names the three permissions and the routes they
 * belong to, and this file pins each pairing to an address.
 *
 * Only the denial surface is asserted, in both directions. A permitted route
 * renders a `lazy` page that suspends under `renderToStaticMarkup`, so the
 * fallback is what comes back - the absence of the denial panel is the signal
 * that the gate let the render through, and the page's own contents are not
 * this file's business.
 */

import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import theme from './theme/horizon'
import { AuthStatus } from './core/types/auth.types'
import type { Permission } from './core/authorization/authorization'
import Routes from './Routes'

const auth = vi.hoisted(() => ({
  status: 'authenticated' as string,
  user: null as unknown,
}))

vi.mock('./context/AuthContext', () => ({
  useAuth: () => auth,
}))

const DENIAL = 'This workspace is not available to your account'

const MEMBER: Permission[] = ['profile:manage:self', 'comments:participate']
const AUTHOR: Permission[] = [...MEMBER, 'content:manage:own', 'analytics:read:own']
const ADMIN: Permission[] = [...AUTHOR, 'roles:assign']

const renderAt = (path: string, permissions: Permission[] | null) => {
  auth.status = permissions === null ? AuthStatus.UNAUTHENTICATED : AuthStatus.AUTHENTICATED
  auth.user =
    permissions === null
      ? null
      : {
          id: 3,
          username: 'reader',
          authorization: { role: 'member', permissions },
        }

  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <ChakraProvider theme={theme}>
        <Routes />
      </ChakraProvider>
    </MemoryRouter>,
  )
}

describe('route permission matrix', () => {
  it.each([
    ['/blog-editor', MEMBER],
    ['/blog-editor/publish', MEMBER],
    ['/analytics', MEMBER],
    ['/analytics/blog/7', MEMBER],
    ['/admin/access', AUTHOR],
  ])('refuses %s without the permission it requires', (path, permissions) => {
    expect(renderAt(path, permissions)).toContain(DENIAL)
  })

  it.each([
    ['/blog-editor', AUTHOR],
    ['/analytics', AUTHOR],
    ['/analytics/blog/7', AUTHOR],
    ['/admin/access', ADMIN],
  ])('admits %s once the backend returns its permission', (path, permissions) => {
    expect(renderAt(path, permissions)).not.toContain(DENIAL)
  })

  it.each(['/profile/reader', '/profile/reader/blog/7'])(
    'keeps %s available to a member, whose profile is their own',
    (path) => {
      expect(renderAt(path, MEMBER)).not.toContain(DENIAL)
    },
  )

  it.each(['/', '/blog', '/series', '/about'])(
    'renders the public route %s with no authorization context at all',
    (path) => {
      expect(renderAt(path, null)).not.toContain(DENIAL)
    },
  )
})

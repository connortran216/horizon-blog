import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import theme from '../theme'
import { AuthStatus } from '../core/types/auth.types'
import ProtectedRoute from './ProtectedRoute'

const auth = vi.hoisted(() => ({
  status: 'authenticated',
  user: {
    id: 7,
    username: 'Author',
    authorization: {
      role: 'author',
      permissions: ['content:manage:own'],
    },
  } as unknown,
}))

vi.mock('../context/AuthContext', () => ({
  useAuth: () => auth,
}))

const renderRoute = () =>
  renderToStaticMarkup(
    <MemoryRouter>
      <ChakraProvider theme={theme}>
        <ProtectedRoute requiredPermission="content:manage:own">
          <div>editor workspace</div>
        </ProtectedRoute>
      </ChakraProvider>
    </MemoryRouter>,
  )

describe('ProtectedRoute authorization', () => {
  beforeEach(() => {
    auth.status = AuthStatus.AUTHENTICATED
    auth.user = {
      id: 7,
      username: 'Author',
      authorization: {
        role: 'author',
        permissions: ['content:manage:own'],
      },
    }
  })

  it('renders a workspace when the private context grants its permission', () => {
    expect(renderRoute()).toContain('editor workspace')
  })

  it('uses effective admin permissions instead of inferring access from the role name', () => {
    auth.user = {
      id: 1,
      username: 'Admin',
      authorization: { role: 'admin', permissions: ['content:manage:own', 'roles:assign'] },
    }

    expect(renderRoute()).toContain('editor workspace')
  })

  it('fails closed without the permission and keeps the signed-in denial surface', () => {
    auth.user = {
      id: 8,
      username: 'Member',
      authorization: { role: 'member', permissions: ['profile:manage:self'] },
    }

    const markup = renderRoute()
    expect(markup).not.toContain('editor workspace')
    expect(markup).toContain('You are still signed in')
  })

  it('fails closed when the private authorization context is absent', () => {
    auth.user = { id: 9, username: 'Legacy user' }

    expect(renderRoute()).toContain('This workspace is not available')
  })
})

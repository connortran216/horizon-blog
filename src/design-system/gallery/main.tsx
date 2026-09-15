/**
 * Horizon Design System v2 - gallery entry point.
 *
 * The second Vite entry (`ui-kit.html`). It mounts `horizonTheme` and nothing
 * else from the application: no `Routes`, no auth context, no API client, no
 * service. The router here is an in-memory one, because `ActionLink` and
 * `NavItem` render React Router's `Link` and `NavLink` and would throw without a
 * router above them - it resolves no application route and issues no request.
 *
 * The whole page therefore works with the backend switched off, which is
 * acceptance criterion 2.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import { MemoryRouter } from 'react-router-dom'

import { horizonTheme } from '../../theme/horizon'
import { GalleryApp } from './GalleryApp'
import { installMotionOverride } from './motionOverride'

// Before the first render, so the very first motion snapshot already reads the
// gallery's control rather than the reviewer's operating system.
installMotionOverride()

const container = document.getElementById('gallery-root')

if (!container) {
  throw new Error('ui-kit.html is missing its #gallery-root element.')
}

createRoot(container).render(
  <StrictMode>
    <ChakraProvider theme={horizonTheme}>
      <MemoryRouter initialEntries={['/gallery']}>
        <GalleryApp />
      </MemoryRouter>
    </ChakraProvider>
  </StrictMode>,
)

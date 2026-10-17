// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import theme from '../../theme/horizon'
import Navbar from './Navbar'

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: null, logout: vi.fn() }),
}))

let root: Root
let container: HTMLDivElement
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
  act(() =>
    root.render(
      <ChakraProvider theme={theme}>
        <MemoryRouter>
          <Navbar />
          <main>
            <button>Page content</button>
          </main>
        </MemoryRouter>
      </ChakraProvider>,
    ),
  )
})
afterEach(() => {
  act(() => root.unmount())
  container.remove()
  vi.unstubAllGlobals()
})
const trigger = () =>
  container.querySelector<HTMLButtonElement>('[aria-controls="site-navigation-mobile"]')!
const panel = () => container.querySelector<HTMLElement>('#site-navigation-mobile')

it('opens outside document flow and closes with Escape, returning focus', () => {
  act(() => trigger().click())
  expect(getComputedStyle(panel()!).position).toBe('absolute')
  expect(getComputedStyle(panel()!).top).toBe('100%')
  expect(trigger().getAttribute('aria-expanded')).toBe('true')
  act(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })))
  expect(panel()).toBeNull()
  expect(document.activeElement).toBe(trigger())
})

it('dismisses on an outside pointer click and on navigation', () => {
  act(() => trigger().click())
  const outside = container.querySelector('main button')!
  act(() => {
    outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    outside.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
  })
  expect(panel()).toBeNull()
  act(() => trigger().click())
  act(() => panel()!.querySelector<HTMLAnchorElement>('a[href="/contact"]')!.click())
  expect(panel()).toBeNull()
})

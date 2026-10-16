// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import theme from '../../theme/horizon'
import { IconButton } from '../components/actions/IconButton'
import { MorphIcon, type MorphIconProps } from './MorphIcon'

describe('MorphIcon state transitions', () => {
  let container: HTMLDivElement
  let root: Root
  let reduced: boolean
  let listeners: Set<(event: { matches: boolean }) => void>

  beforeEach(() => {
    reduced = false
    listeners = new Set()
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
    vi.stubGlobal('matchMedia', () => ({
      get matches() {
        return reduced
      },
      addEventListener: (_: string, listener: (event: { matches: boolean }) => void) =>
        listeners.add(listener),
      removeEventListener: (_: string, listener: (event: { matches: boolean }) => void) =>
        listeners.delete(listener),
    }))
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
    vi.unstubAllGlobals()
  })

  const render = (name: MorphIconProps['name']) => act(() => root.render(<MorphIcon name={name} />))
  const path = () => container.querySelector('path')?.getAttribute('d')
  const reduce = () =>
    act(() => {
      reduced = true
      listeners.forEach((notify) => notify({ matches: reduced }))
    })

  it('stops an in-flight morph immediately when reduced motion is enabled', () => {
    render('copy')
    const copy = path()
    render('check')
    reduce()
    const check = path()
    expect(check).not.toBe(copy)
    render('copy')
    expect(path()).toBe(copy)
    render('check')
    expect(path()).toBe(check)
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
    expect(container.querySelector('svg')?.getAttribute('focusable')).toBe('false')
  })

  it('supports rapid menu reversal and removes the policy subscription on unmount', () => {
    render('menu')
    const menu = path()
    render('close')
    render('menu')
    reduce()
    expect(path()).toBe(menu)
    act(() => root.render(null))
    expect(listeners.size).toBe(0)
  })

  it('keeps the same SVG mounted through an icon button clipboard busy state', () => {
    const button = (loading: boolean, name: MorphIconProps['name']) => (
      <ChakraProvider theme={theme}>
        <IconButton
          label={loading ? 'Copying email' : 'Copy email'}
          isLoading={loading}
          icon={<MorphIcon name={name} />}
        />
      </ChakraProvider>
    )
    act(() => root.render(button(false, 'copy')))
    const svg = container.querySelector('[data-morph-icon]')
    act(() => root.render(button(true, 'copy')))
    expect(container.querySelector('[data-morph-icon]')).toBe(svg)
    expect(container.querySelector('button')?.getAttribute('aria-busy')).toBe('true')
    expect(container.querySelector('button')?.getAttribute('aria-disabled')).toBe('true')
    act(() => root.render(button(false, 'check')))
    expect(container.querySelector('[data-morph-icon]')).toBe(svg)
    expect(svg?.getAttribute('data-morph-icon')).toBe('check')
  })
})

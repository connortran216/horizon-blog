/**
 * Static-markup checks for the carried-signal primitives and the nav track:
 * what they emit, not how they travel. Real travel belongs to the gallery.
 */

import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { NavItem, NavTrack } from '../components/navigation'
import { Heading } from '../components/typography'
import theme from '../../theme/horizon'
import { SIGNAL_HOST, SignalLine } from './SignalLine'
import { SignalRoute } from './SignalRoute'
import { SignalTarget } from './SignalTarget'
import { Typeset } from './Typeset'

const withoutStyles = (markup: string) => markup.replace(/<style[^>]*>[\s\S]*?<\/style>/g, '')

const render = (node: React.ReactElement, path = '/') =>
  withoutStyles(
    renderToStaticMarkup(
      <ChakraProvider theme={theme}>
        <MemoryRouter initialEntries={[path]}>{node}</MemoryRouter>
      </ChakraProvider>,
    ),
  )

describe('SignalRoute', () => {
  it('keeps one h1 read whole while its words wait for the tip', () => {
    const markup = render(
      <SignalRoute pace="order" trigger="mount">
        <Heading as="h1" recipe="display">
          <Typeset emphasis="and technology.">Blogs about work and technology.</Typeset>
        </Heading>
        <SignalLine />
      </SignalRoute>,
    )

    expect(markup.match(/<h1/g)?.length).toBe(1)
    expect(markup).toContain('Blogs about work and technology.')
    // The words are anchors: hidden until the tip reaches them.
    expect(markup).toContain('opacity:0')
    expect(markup.match(/data-typeset-rule/g)?.length).toBe(2)
  })

  it('renders its line as decoration, drawn from nothing', () => {
    const markup = render(
      <SignalRoute>
        <SignalTarget>
          <p>Figure</p>
        </SignalTarget>
        <SignalLine />
      </SignalRoute>,
    )

    expect(markup).toContain('data-signal-line=""')
    expect(markup).toMatch(/data-signal-line="" aria-hidden="true"/)
    expect(markup).toContain('scaleX(0)')
  })

  it('lays a vertical line along the vertical axis', () => {
    const markup = render(
      <SignalRoute orientation="vertical">
        <SignalLine />
      </SignalRoute>,
    )

    expect(markup).toContain('scaleY(0)')
  })
})

describe('SignalLine on a host', () => {
  it('names its host attribute and starts undrawn', () => {
    const markup = render(
      <article {...{ [SIGNAL_HOST]: '' }}>
        <SignalLine tone="action" />
      </article>,
    )

    expect(SIGNAL_HOST).toBe('data-signal-host')
    expect(markup).toContain('data-signal-host=""')
    expect(markup).toContain('data-signal-line=""')
  })
})

describe('SignalLine controlled', () => {
  it('reports the state it was given', () => {
    expect(render(<SignalLine drawn tone="action" />)).toContain('data-drawn="true"')
    expect(render(<SignalLine drawn={false} />)).toContain('data-drawn="false"')
  })

  it('leaves a host-driven line without a state', () => {
    expect(render(<SignalLine />)).not.toContain('data-drawn')
  })
})

describe('NavTrack', () => {
  const nav = (
    <NavTrack as="nav" aria-label="Site">
      <NavItem to="/">Home</NavItem>
      <NavItem to="/blog">Blog</NavItem>
    </NavTrack>
  )

  it('keeps aria-current on the current item', () => {
    const markup = render(nav, '/blog')

    expect(markup.match(/aria-current="page"/g)?.length).toBe(1)
    expect(markup).toMatch(/aria-current="page"[^>]*>Blog/)
  })

  it('takes the per-item bars away inside a track', () => {
    expect(render(nav, '/blog')).not.toContain('data-nav-indicator')
  })

  it('leaves a lone item its own bar', () => {
    expect(render(<NavItem to="/blog">Blog</NavItem>, '/blog')).toContain('data-nav-indicator')
  })
})

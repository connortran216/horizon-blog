/**
 * `uix.9`. `Routes.tsx` had no `path="*"`, so an unknown address matched nothing
 * and React Router rendered nothing: `main` measured 1440x679 with zero children
 * and empty text, between the navbar and the footer.
 *
 * These check the two halves of the repair - that the route resolves to a page
 * with a heading and ways onward, and that the address it names cannot be turned
 * into a layout problem by whoever typed it.
 */

import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import theme from '../../../theme/horizon'
import NotFoundPage, { requestedPathLabel } from './NotFoundPage'

const render = (path: string) =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <ChakraProvider theme={theme}>
        <NotFoundPage />
      </ChakraProvider>
    </MemoryRouter>,
  )

describe('the unknown-address page', () => {
  it('is never blank: a heading, a message and three ways onward', () => {
    const markup = render('/this-route-does-not-exist')

    expect(markup).toContain('<h1')
    expect(markup).toContain('This page is not here')
    expect(markup).toContain('We could not find /this-route-does-not-exist.')
    expect(markup).toContain('href="/"')
    expect(markup).toContain('href="/blog"')
    expect(markup).toContain('href="/series"')
  })

  it('announces itself politely rather than interrupting', () => {
    const markup = render('/nope')

    expect(markup).toContain('role="status"')
    expect(markup).toContain('aria-live="polite"')
  })

  it('names the address without letting it widen the column', () => {
    expect(requestedPathLabel('/blog/missing')).toBe('/blog/missing')
    expect(requestedPathLabel('/')).toBe('that address')
    expect(requestedPathLabel('   ')).toBe('that address')
    expect(requestedPathLabel(`/${'a'.repeat(200)}`)).toHaveLength(81)
  })

  it('renders the address as text, not as markup', () => {
    const markup = render('/<script>alert(1)</script>')

    expect(markup).not.toContain('<script>')
    expect(markup).toContain('&lt;script&gt;')
  })
})

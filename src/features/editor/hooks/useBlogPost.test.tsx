/**
 * What the editor shows before it has anything to show.
 *
 * The first render is the whole subject here, so the assertions are made
 * against `renderToStaticMarkup`: it renders once and runs no effects, which is
 * precisely the frame that used to be wrong. See the Testing section of
 * `src/design-system/CONVENTIONS.md`.
 */

import { ChakraProvider } from '@chakra-ui/react'
import type { ComponentProps } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import theme from '../../../theme/horizon'
import { AuthProvider } from '../../../context/AuthContext'
import { PublicPostRecord } from '../../../core/types/blog.types'
import { loadsPostOnMount, useBlogPost } from './useBlogPost'

const existingPost = { id: 76, title: 'A saved draft', user_id: 1 } as unknown as PublicPostRecord

function Probe() {
  const { isLoading } = useBlogPost({ redirectOnError: false })

  return <span data-loading={String(isLoading)} />
}

type RouterEntry = NonNullable<ComponentProps<typeof MemoryRouter>['initialEntries']>[number]

function firstRender(entry: RouterEntry): string {
  return renderToStaticMarkup(
    <ChakraProvider theme={theme}>
      <MemoryRouter initialEntries={[entry]}>
        <AuthProvider>
          <Probe />
        </AuthProvider>
      </MemoryRouter>
    </ChakraProvider>,
  )
}

describe('loadsPostOnMount', () => {
  it('is a fetch when the URL names a post and nothing was handed over', () => {
    expect(loadsPostOnMount('76', undefined)).toBe(true)
  })

  it('is not a fetch for a new draft', () => {
    expect(loadsPostOnMount(null, undefined)).toBe(false)
  })

  it('is not a fetch when the profile page already passed the post through', () => {
    expect(loadsPostOnMount('76', existingPost)).toBe(false)
  })
})

describe('the first frame the editor paints', () => {
  /*
   * The defect this closes: `isLoading` started at `false` while the effect
   * that sets it was still queued, so an existing draft rendered as an empty
   * workspace for one frame and only then became a loading panel.
   */
  it('is already loading when the URL names a post to fetch', () => {
    expect(firstRender('/blog-editor?id=76')).toContain('data-loading="true"')
  })

  it('is not loading for a new draft, which has nothing to wait for', () => {
    expect(firstRender('/blog-editor')).toContain('data-loading="false"')
  })

  it('is not loading when the post travelled with the navigation', () => {
    const markup = firstRender({
      pathname: '/blog-editor',
      search: '?id=76',
      state: { blog: existingPost, authorizedEdit: true },
    })

    expect(markup).toContain('data-loading="false"')
  })
})

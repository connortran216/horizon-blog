/**
 * What the migrated Series manager emits.
 *
 * `SeriesManager` is now an adapter over the design system's
 * `SeriesManagerForm`, so the decisions it used to make itself - which blogs may
 * be added, whether a save may fire - are `seriesManager.logic.ts`'s and are
 * tested there. What is left to prove here is what the adapter is for: that the
 * number ids the API speaks reach the form as the strings it speaks, and that
 * the resulting form offers the right blogs and the right rows.
 *
 * The old assertion on "Each blog can belong to one series" is rewritten rather
 * than dropped: the sentence still exists, under the add control, and it now
 * comes from `addBlogFieldState` with the second half the legacy copy left out -
 * that saving replaces the whole order.
 *
 * Rendered under `horizonTheme`, which is the theme production mounts.
 */

import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import horizonTheme from '../../../theme/horizon'
import SeriesManager from './SeriesManager'

const series = {
  id: 7,
  slug: 'database-engineering',
  title: 'Database Engineering',
  description: '',
  parts: [
    {
      postId: 44,
      title: 'Part already in this Series',
      status: 'published' as const,
      position: 1,
      publishedAt: null,
      scheduledPublishAt: null,
    },
  ],
  createdAt: '2026-08-01T00:00:00Z',
  updatedAt: '2026-08-01T00:00:00Z',
}

function render(optionsError?: string, onRetryOptions?: () => void): string {
  return renderToStaticMarkup(
    <ChakraProvider theme={horizonTheme}>
      <SeriesManager
        series={series}
        blogOptions={[
          { id: 42, title: 'Already assigned', status: 'published' },
          { id: 43, title: 'Available blog', status: 'draft' },
          { id: 44, title: 'Part already in this Series', status: 'published' },
        ]}
        assignedSeriesByPostId={new Map([[42, 8]])}
        optionsError={optionsError}
        onRetryOptions={onRetryOptions}
        onUpdate={vi.fn()}
        onReplacePosts={vi.fn()}
        onDelete={vi.fn()}
      />
    </ChakraProvider>,
  )
}

describe('SeriesManager', () => {
  const markup = render()

  it('does not offer a blog that already belongs to another series', () => {
    expect(markup).not.toContain('>Already assigned<')
    expect(markup).toContain('>Available blog<')
  })

  it('does not offer a blog this Series already holds, but still lists it as a row', () => {
    expect(markup).not.toContain('<option value="44"')
    expect(markup).toContain('Part already in this Series')
  })

  it('still says a blog belongs to one Series, and now says what a save replaces', () => {
    expect(markup).toContain('Each blog belongs to one Series. Saving replaces the whole order.')
  })

  it('names the move and remove controls after the blog they act on', () => {
    expect(markup).toContain('aria-label="Move Part already in this Series earlier in the Series"')
    expect(markup).toContain('aria-label="Remove Part already in this Series from the Series"')
  })

  it('refuses to save a form nothing has changed, and says why', () => {
    expect(markup).toContain('Nothing has changed yet.')
  })

  it('reports a failed load of the owned blogs instead of offering an empty list', () => {
    const failed = render('We could not load the blogs you own.', vi.fn())

    expect(failed).toContain('We could not load the blogs you own.')
    expect(failed).toContain('Try loading your blogs again')
    expect(failed).not.toContain('Every blog you own already belongs to a Series.')
  })
})

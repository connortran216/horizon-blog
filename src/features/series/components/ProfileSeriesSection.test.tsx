/**
 * What the profile's Series section emits in each of its states. The spine
 * and composer decisions are covered in the design system; this checks the
 * section picks the right one and never lets a failure leave the section.
 */

import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import horizonTheme from '../../../theme/horizon'
import type { OwnerSeries } from '../series.types'
import ProfileSeriesSection, { type ProfileSeriesSectionProps } from './ProfileSeriesSection'

const sample: OwnerSeries = {
  id: 4,
  slug: 'sample-series',
  title: 'Sample Series',
  description: 'Sample description.',
  createdAt: '2026-10-01T00:00:00Z',
  updatedAt: '2026-10-08T09:00:00Z',
  parts: [
    {
      postId: 1,
      title: 'Sample part one',
      status: 'published',
      position: 1,
      publishedAt: '2026-10-02T00:00:00Z',
      scheduledPublishAt: null,
    },
    {
      postId: 2,
      title: 'Sample part two',
      status: 'draft',
      position: 2,
      publishedAt: null,
      scheduledPublishAt: '2026-10-14T02:00:00Z',
    },
  ],
}

function render(props: Partial<ProfileSeriesSectionProps> = {}) {
  return renderToStaticMarkup(
    <ChakraProvider theme={horizonTheme}>
      <MemoryRouter>
        <ProfileSeriesSection
          series={[sample]}
          loading={false}
          error={null}
          onRetry={vi.fn()}
          onCreate={vi.fn()}
          {...props}
        />
      </MemoryRouter>
    </ChakraProvider>,
  )
}

describe('ProfileSeriesSection', () => {
  it('lists each Series as a spine with a named Manage link', () => {
    const markup = render()

    expect(markup).toContain('id="series"')
    expect(markup).toContain('Blogs you have put in order')
    expect(markup).toContain('2 parts · 1 live · 1 not live yet · Updated Oct 8, 2026')
    expect(markup).toContain('Part 2, scheduled: Sample part two')
    expect(markup).toContain('aria-label="Manage Sample Series"')
    expect(markup).toContain('href="/series/manage"')
    expect(markup).toContain('New Series')
  })

  it('keeps loading inside the section', () => {
    const markup = render({ loading: true })

    expect(markup).toContain('your Series')
    expect(markup).not.toContain('Sample Series')
  })

  it('shows a list failure in the section with a retry', () => {
    const markup = render({ series: [], error: 'Series could not load.' })

    expect(markup).toContain('load your Series')
    expect(markup).toContain('Series could not load.')
  })

  it('keeps a loaded list on screen when only a create failed', () => {
    // `error` is the list's failure alone; a loaded list never shows it.
    const markup = render({ error: null })

    expect(markup).not.toContain('load your Series')
    expect(markup).toContain('Sample Series')
  })

  it('offers the next step when there is no Series yet', () => {
    expect(render({ series: [] })).toContain(
      'Start one with New Series, then add the blogs that belong together.',
    )
  })

  it('opens the composer in place of the New Series button', () => {
    const markup = render({ initiallyComposing: true })

    expect(markup).toContain('<form aria-label="New Series"')
    // The words appear once: as the form's name, not also as a button.
    expect(markup.match(/New Series/g)).toHaveLength(1)
    expect(markup).toContain('Sample Series')
  })
})

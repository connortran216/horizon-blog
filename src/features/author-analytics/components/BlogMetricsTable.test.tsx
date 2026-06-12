import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import BlogMetricsTable from './BlogMetricsTable'

describe('BlogMetricsTable', () => {
  it('distinguishes date-range hearts received from current active hearts', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <BlogMetricsTable
          blogs={[
            {
              postId: 76,
              title: 'Analytics post',
              views: 10,
              estimatedUniqueReaders: 8,
              uniqueReadersApproximate: true,
              heartsReceived: 2,
              activeHeartCount: 4,
              shares: 1,
              linkClicks: 3,
              completionRate: 0.5,
              avgActiveReadSeconds: 42,
            },
          ]}
          range={{ from: '2026-05-13', to: '2026-06-12', timezone: 'UTC' }}
          sort="hearts_received"
          order="desc"
          onSortChange={() => undefined}
        />
      </MemoryRouter>,
    )

    expect(markup).toContain('Hearts received')
    expect(markup).toContain('4 active hearts')
    expect(markup).toContain('>2</td>')
  })
})

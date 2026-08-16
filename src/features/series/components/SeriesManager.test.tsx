import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import theme from '../../../theme'
import SeriesManager from './SeriesManager'

describe('SeriesManager', () => {
  it('does not offer a blog that already belongs to another series', () => {
    const markup = renderToStaticMarkup(
      <ChakraProvider theme={theme}>
        <SeriesManager
          series={{
            id: 7,
            slug: 'database-engineering',
            title: 'Database Engineering',
            description: '',
            parts: [],
            createdAt: '2026-08-01T00:00:00Z',
            updatedAt: '2026-08-01T00:00:00Z',
          }}
          blogOptions={[
            { id: 42, title: 'Already assigned', status: 'published' },
            { id: 43, title: 'Available blog', status: 'draft' },
          ]}
          assignedSeriesByPostId={new Map([[42, 8]])}
          onUpdate={vi.fn()}
          onReplacePosts={vi.fn()}
          onDelete={vi.fn()}
        />
      </ChakraProvider>,
    )

    expect(markup).not.toContain('Already assigned')
    expect(markup).toContain('Available blog')
    expect(markup).toContain('Each blog can belong to one series')
  })
})

import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import theme from '../../../theme'
import ProfilePostsSection from './ProfilePostsSection'

describe('ProfilePostsSection', () => {
  it('shows mutually exclusive owner counts and the scheduled management row', () => {
    const markup = renderToStaticMarkup(
      <ChakraProvider theme={theme}>
        <ProfilePostsSection
          postsLoading={false}
          profileUsername="owner"
          publishedBlogs={[]}
          scheduledBlogs={[
            {
              id: '91',
              title: 'Scheduled article',
              createdAt: '2026-08-20T08:00:00Z',
              updatedAt: '2026-08-21T09:00:00Z',
              scheduledPublishAt: '2026-08-27T01:50:00Z',
              status: 'draft',
            },
          ]}
          draftBlogs={[]}
          publishedPagination={{ page: 1, limit: 9, total: 4 }}
          scheduledPagination={{ page: 1, limit: 9, total: 1 }}
          draftPagination={{ page: 1, limit: 9, total: 2 }}
          scheduleClock={new Date('2026-08-27T02:00:00Z')}
          onPublishedPageChange={vi.fn()}
          onScheduledPageChange={vi.fn()}
          onDraftPageChange={vi.fn()}
          onEdit={vi.fn()}
          onReschedule={vi.fn()}
          onPublishNow={vi.fn()}
          onCancelSchedule={vi.fn()}
          onDelete={vi.fn()}
        />
      </ChakraProvider>,
    )

    expect(markup).toContain('Published (4)')
    expect(markup).toContain('Scheduled (1)')
    expect(markup).toContain('Drafts (2)')
    expect(markup).toContain('7 total blogs')
    expect(markup).toContain('Scheduled article')
    expect(markup).toContain('Needs attention')
    expect(markup).toContain('Manage')
  })
})

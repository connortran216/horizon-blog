/**
 * Long Vietnamese and English content through the archive's two card
 * patterns.
 *
 * `blog-summary-cards.test.tsx` already proves the backend-summary mapping;
 * this file is narrower and asks one question of each pattern the archive
 * composes from - EditorialCard (`PostCard`) and FeaturedStory - does a title
 * and excerpt long enough to wrap, in Vietnamese with full diacritics or in
 * English, render intact rather than getting clipped, mangled, or thrown away
 * by the mapping in between. Vietnamese content is production content here,
 * not an edge case, so it gets its own case rather than a token fixture.
 */

import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { BlogPostSummary } from '../../../core'
import theme from '../../../theme/horizon'
import EditorialCard from './EditorialCard'
import FeaturedStory from './FeaturedStory'

const vietnameseTitle =
  'Kiến trúc microservices và những cạm bẫy thường gặp khi mở rộng hệ thống xử lý ' +
  'hàng triệu bưu kiện mỗi ngày trong môi trường logistics đa quốc gia'

const vietnameseExcerpt =
  'Bài viết này phân tích cách một đội ngũ kỹ thuật đã tái cấu trúc hệ thống theo dõi ' +
  'đơn hàng từ một khối nguyên khối sang các dịch vụ độc lập, cùng những đánh đổi về ' +
  'độ trễ, tính nhất quán dữ liệu và chi phí vận hành mà quyết định đó kéo theo.'

const longEnglishTitle =
  'A Practical Guide to Designing Idempotent Webhook Delivery for High-Volume ' +
  'Parcel Tracking Pipelines Across Multiple Regional Carrier Integrations'

const longEnglishExcerpt =
  'When a single shipment event can be retried by three different upstream carriers ' +
  'within the same minute, the receiving service has to treat every webhook as if it ' +
  'might already have been processed, which changes almost everything about how the ' +
  'handler is written, tested and rolled back.'

const basePost: BlogPostSummary = {
  id: '101',
  title: vietnameseTitle,
  subtitle: undefined,
  excerpt: vietnameseExcerpt,
  author: { id: 3, username: 'Nguyễn Thị Hương', avatar: undefined },
  createdAt: '2026-05-01T00:00:00Z',
  updatedAt: '2026-05-02T00:00:00Z',
  readingTime: 9,
  tags: ['kiến-trúc', 'logistics'],
  featuredImage: undefined,
  status: 'published',
  slug: '101',
  series: null,
}

const renderCards = (post: BlogPostSummary) =>
  renderToStaticMarkup(
    <MemoryRouter>
      <ChakraProvider theme={theme}>
        <FeaturedStory post={post} />
        <EditorialCard post={post} />
      </ChakraProvider>
    </MemoryRouter>,
  )

describe('archive cards with long Vietnamese content', () => {
  it('renders a long Vietnamese title and excerpt intact, with diacritics preserved', () => {
    const markup = renderCards(basePost)

    expect(markup).toContain(vietnameseTitle)
    expect(markup).toContain(vietnameseExcerpt)
    expect(markup).toContain('Nguyễn Thị Hương')
    // No replacement character from a broken encoding step anywhere in the tree.
    expect(markup).not.toContain('�')
  })

  it('renders the Vietnamese author name in the metadata line without transliterating it', () => {
    const markup = renderCards(basePost)

    expect(markup).toContain('Nguyễn Thị Hương')
    expect(markup).not.toContain('Nguyen Thi Huong')
  })
})

describe('archive cards with long English content', () => {
  it('renders a long English title and excerpt intact', () => {
    const markup = renderCards({
      ...basePost,
      title: longEnglishTitle,
      excerpt: longEnglishExcerpt,
      author: { id: 4, username: 'Connor Tran', avatar: undefined },
    })

    expect(markup).toContain(longEnglishTitle)
    expect(markup).toContain(longEnglishExcerpt)
  })
})

describe('archive cards clean the excerpt before display', () => {
  it('strips markdown syntax out of an excerpt sourced from raw markdown', () => {
    const markup = renderCards({
      ...basePost,
      excerpt: '**Chỉ mục** là chìa khoá của [hiệu năng đọc](https://example.com) trong Postgres.',
    })

    expect(markup).toContain('Chỉ mục là chìa khoá của hiệu năng đọc trong Postgres.')
    expect(markup).not.toContain('**')
    expect(markup).not.toContain('](')
  })
})

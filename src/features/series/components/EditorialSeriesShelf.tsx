import { useEffect, useState } from 'react'
import { Box, Link, Skeleton } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { usePublicSeriesList } from '../usePublicSeriesList'
import type { PublicSeriesSummary } from '../series.types'
import SeriesCarousel from './SeriesCarousel'

export default function EditorialSeriesShelf() {
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<PublicSeriesSummary[]>([])
  const { data, loading, error, retry } = usePublicSeriesList({ page, limit: 6 })
  useEffect(() => {
    if (!data) return
    setItems((previous) => [
      ...new Map([...previous, ...data.items].map((item) => [item.id, item])).values(),
    ])
  }, [data])
  const hasMore = !!data && data.page < data.totalPages
  const loadMore = () => {
    if (hasMore && !loading && !error) setPage(data!.page + 1)
  }
  if (!loading && !error && !items.length) return null
  if (error && !items.length)
    return (
      <section aria-label="Series">
        <p>Series chưa tải được.</p>
        <button onClick={retry}>Thử lại</button>
      </section>
    )
  return (
    <Box as="section" aria-labelledby="home-series-heading">
      <div className="signal-section-heading">
        <div>
          <span className="signal-eyebrow">Follow a thread</span>
          <h2 id="home-series-heading">Series</h2>
        </div>
        <Link as={RouterLink} to="/series">
          All Series
        </Link>
      </div>
      {loading && items.length === 0 ? (
        <Skeleton height="90px" borderRadius="20px" />
      ) : (
        <SeriesCarousel
          total={data?.total ?? items.length}
          hasMore={hasMore}
          loading={loading}
          error={error}
          onMore={loadMore}
          onRetry={retry}
        >
          {items.map((series) => (
            <Link
              as={RouterLink}
              to={'/series/' + series.slug}
              key={series.id}
              className="signal-series-link"
            >
              <div className="signal-book" aria-hidden="true">
                <span className="signal-book-sheet" />
                <span className="signal-book-sheet" />
                <div className="signal-book-cover">
                  <span>HORIZON / SERIES</span>
                  <strong>{series.title}</strong>
                  <span>READ · EXPLORE · CONNECT</span>
                </div>
              </div>
              <div className="signal-series-copy">
                <h3>{series.title}</h3>
                {series.description && <p>{series.description}</p>}
                <p>{series.partCount} bài đã xuất bản</p>
              </div>
              <span className="signal-series-cta">
                Khám phá series <span aria-hidden="true">→</span>
              </span>
            </Link>
          ))}
        </SeriesCarousel>
      )}
    </Box>
  )
}

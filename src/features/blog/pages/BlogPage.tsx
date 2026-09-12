/**
 * The blog archive.
 *
 * Composition over `useBlogArchive`, which still owns the query string, the
 * debounce, the paging and the two requests. Nothing about search, filtering or
 * pagination behaviour moved; what moved is who draws it.
 *
 * The four async states are now distinct. Loading is content-shaped skeletons,
 * a failed request is an error with a retry, no results is an empty state that
 * names the next valid action, and results are results - where a failed request
 * used to render the same "nothing matched that search" panel as an empty one.
 */

import {
  Button,
  ContentContainer,
  EmptyState,
  ErrorState,
  Eyebrow,
  Grid,
  Heading,
  Pagination,
  RetryAction,
  Section,
  Skeleton,
  Stack,
  Stagger,
  Text,
  filterResultSummary,
  hierarchyContext,
  noResultsNextAction,
} from '../../../design-system'
import BlogArchiveHero from '../components/BlogArchiveHero'
import BlogFilterToolbar from '../components/BlogFilterToolbar'
import EditorialCard from '../components/EditorialCard'
import FeaturedStory from '../components/FeaturedStory'
import { useBlogArchive } from '../useBlogArchive'
import SeriesShelf from '../../series/components/SeriesShelf'

const PAGE_SIZE = 9
const RESULTS_EYEBROW = 'Latest blogs'

const BlogPage = () => {
  const {
    searchInput,
    setSearchInput,
    query,
    posts,
    popularTags,
    loading,
    tagsLoading,
    error,
    tagsError,
    page,
    total,
    activeTags,
    hasActiveFilters,
    setPage,
    toggleTag,
    clearQuery,
    removeTag,
    clearAllFilters,
    retry,
    retryTags,
  } = useBlogArchive(PAGE_SIZE)

  const featuredPost = posts[0]
  const remainingPosts = posts.slice(1)
  const filterState = { query, selectedTags: activeTags }
  const resultsHeading = hasActiveFilters ? 'Search results' : 'Blogs worth reading next'
  const sectionLabels = hierarchyContext(RESULTS_EYEBROW, resultsHeading)
  const resultSummary = filterResultSummary(filterState, total, loading)

  return (
    <ContentContainer>
      <Section>
        <Stack gap={12}>
          <BlogArchiveHero />

          <BlogFilterToolbar
            popularTags={popularTags}
            activeTags={activeTags}
            searchInput={searchInput}
            onSearchChange={setSearchInput}
            loading={tagsLoading}
            tagsError={tagsError}
            onRetryTags={retryTags}
            onToggleTag={toggleTag}
            onClearQuery={clearQuery}
            onRemoveTag={removeTag}
            onClearAll={clearAllFilters}
            summary={
              resultSummary ? (
                <Text as="p" recipe="metadata" aria-live="polite">
                  {resultSummary}
                </Text>
              ) : null
            }
          />

          {page === 1 && !hasActiveFilters && !searchInput.trim() ? <SeriesShelf compact /> : null}

          {loading ? (
            <Grid columns={2} gap={8}>
              {Array.from({ length: PAGE_SIZE }, (_unused, index) => (
                <Skeleton
                  key={`blog-skeleton-${index}`}
                  shape={{ shape: 'media', aspectRatio: '16 / 9' }}
                  label={index === 0 ? 'the blog archive' : undefined}
                />
              ))}
            </Grid>
          ) : error ? (
            <ErrorState failedAction="load the blog archive" detail={error} align="start">
              <RetryAction failedAction="load the blog archive" onRetry={retry} />
            </ErrorState>
          ) : posts.length === 0 ? (
            <EmptyState subject="blogs" nextAction={noResultsNextAction(filterState)} align="start">
              {hasActiveFilters ? (
                <Button tone="secondary" onClick={clearAllFilters}>
                  Clear all filters
                </Button>
              ) : null}
            </EmptyState>
          ) : (
            <Stack as="section" gap={8} aria-labelledby="blog-results-heading">
              <Stack gap={2}>
                <Eyebrow as="p">{RESULTS_EYEBROW}</Eyebrow>
                <Heading id="blog-results-heading" as="h2" recipe="sectionTitle">
                  {resultsHeading}
                </Heading>
              </Stack>

              {featuredPost ? (
                <FeaturedStory post={featuredPost} sectionLabels={sectionLabels} />
              ) : null}

              {remainingPosts.length > 0 ? (
                <Grid columns={2} gap={8}>
                  <Stagger>
                    {remainingPosts.map((post) => (
                      <EditorialCard key={post.id} post={post} sectionLabels={sectionLabels} />
                    ))}
                  </Stagger>
                </Grid>
              ) : null}
            </Stack>
          )}

          {loading || error ? null : (
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              totalItems={total}
              onPageChange={setPage}
              label="Blog pagination"
            />
          )}
        </Stack>
      </Section>
    </ContentContainer>
  )
}

export default BlogPage

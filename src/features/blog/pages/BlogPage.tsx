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

import { useRef } from 'react'
import { Box } from '@chakra-ui/react'
import { AnimatePresence, LayoutGroup } from 'framer-motion'

import {
  Button,
  ContentContainer,
  EmptyState,
  ErrorState,
  Eyebrow,
  Grid,
  Heading,
  LayoutTransition,
  Pagination,
  RetryAction,
  Reveal,
  Section,
  Skeleton,
  Stack,
  Text,
  durationSeconds,
  filterResultSummary,
  hierarchyContext,
  noResultsNextAction,
  standardEase,
  useMotionPolicy,
} from '../../../design-system'
import BlogArchiveHero from '../components/BlogArchiveHero'
import BlogFilterToolbar from '../components/BlogFilterToolbar'
import EditorialCard from '../components/EditorialCard'
import FeaturedStory from '../components/FeaturedStory'
import { useBlogArchive } from '../useBlogArchive'
import SeriesShelf from '../../series/components/SeriesShelf'

/*
 * Ten: the featured story, then three full rows of three. Nine left the last
 * row one card short.
 */
const PAGE_SIZE = 10
const GRID_COLUMNS = 3
const RESULTS_EYEBROW = 'Latest blogs'

const BlogPage = () => {
  const motionPolicy = useMotionPolicy()
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

  /*
   * The block the pager pages, not the list inside it. This wrapper survives
   * the swap between skeletons, error, empty and results, so it is still there
   * to be scrolled to and focused when `Pagination` moves the reader.
   */
  const resultsRef = useRef<HTMLDivElement>(null)

  const featuredPost = posts[0]
  /*
   * Filtered by id rather than trusting position alone: the cover transition
   * (`horizon-blog-y2e.4.2`) gives the featured cover and every card cover a
   * `view-transition-name` derived from the post id, and two elements on one
   * page sharing that name is a real bug the browser cannot recover from
   * gracefully. `slice(1)` already keeps the featured post out of the grid
   * today; this makes that guarantee resilient to a future change in how
   * `posts` is built rather than just to today's shape of it.
   */
  const remainingPosts = posts.slice(1).filter((post) => post.id !== featuredPost?.id)
  const filterState = { query, selectedTags: activeTags }
  const resultsHeading = hasActiveFilters ? 'Search results' : 'Blogs worth reading next'
  const sectionLabels = hierarchyContext(RESULTS_EYEBROW, resultsHeading)
  const resultSummary = filterResultSummary(filterState, total, loading)
  const reflowTransition = {
    duration: durationSeconds('layout', motionPolicy),
    ease: standardEase,
  }
  const reflowScale = motionPolicy.translation ? 0.97 : 1
  const columnBeat = durationSeconds('tick', motionPolicy) * 2

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

          <Box ref={resultsRef} minW={0}>
            {loading ? (
              <Grid columns={GRID_COLUMNS} gap={8}>
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
              <EmptyState
                subject="blogs"
                nextAction={noResultsNextAction(filterState)}
                align="start"
              >
                {hasActiveFilters ? (
                  <Button tone="secondary" onClick={clearAllFilters}>
                    Clear all filters
                  </Button>
                ) : null}
              </EmptyState>
            ) : (
              <LayoutGroup id="blog-editorial-reflow">
                <Stack as="section" gap={8} aria-labelledby="blog-results-heading">
                  <Stack gap={2}>
                    <Eyebrow as="p">{RESULTS_EYEBROW}</Eyebrow>
                    <Heading id="blog-results-heading" as="h2" recipe="sectionTitle">
                      {resultsHeading}
                    </Heading>
                  </Stack>

                  <AnimatePresence mode="popLayout" initial={false}>
                    {featuredPost ? (
                      <LayoutTransition
                        key={featuredPost.id}
                        layoutGroupId={`blog-result-${featuredPost.id}`}
                        data-blog-result={featuredPost.id}
                        data-blog-result-kind="featured"
                        initial={{ opacity: 0, scale: reflowScale }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: reflowScale }}
                        transition={reflowTransition}
                      >
                        <FeaturedStory post={featuredPost} sectionLabels={sectionLabels} />
                      </LayoutTransition>
                    ) : null}
                  </AnimatePresence>

                  {remainingPosts.length > 0 ? (
                    <Grid columns={GRID_COLUMNS} gap={8}>
                      <AnimatePresence mode="popLayout" initial={false}>
                        {remainingPosts.map((post, index) => (
                          <LayoutTransition
                            key={post.id}
                            layoutGroupId={`blog-result-${post.id}`}
                            data-blog-result={post.id}
                            data-blog-result-kind="card"
                            initial={{ opacity: 0, scale: reflowScale }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: reflowScale }}
                            transition={reflowTransition}
                            style={{ height: '100%' }}
                          >
                            {/*
                              Each row arrives left to right as it scrolls into
                              view - two ticks between neighbours - rather than
                              the whole archive landing at once.
                            */}
                            <Reveal
                              duration="reveal"
                              delay={(index % GRID_COLUMNS) * columnBeat}
                              style={{ height: '100%' }}
                            >
                              <EditorialCard post={post} sectionLabels={sectionLabels} />
                            </Reveal>
                          </LayoutTransition>
                        ))}
                      </AnimatePresence>
                    </Grid>
                  ) : null}
                </Stack>
              </LayoutGroup>
            )}
          </Box>

          {loading || error ? null : (
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              totalItems={total}
              onPageChange={setPage}
              regionRef={resultsRef}
              label="Blog pagination"
            />
          )}
        </Stack>
      </Section>
    </ContentContainer>
  )
}

export default BlogPage

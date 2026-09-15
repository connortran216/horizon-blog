/**
 * One author and everything they have published.
 *
 * Two independent requests, and therefore two independent sets of states: the
 * profile can fail on its own - in which case there is no page - and the post
 * list can fail while the profile is fine, in which case the identity stays and
 * only the list is replaced. `useAuthorArchive` still owns both; this page
 * decides what each one looks like.
 */

import { useRef } from 'react'
import { Box } from '@chakra-ui/react'

import {
  ActionLink,
  ContentContainer,
  Divider,
  EmptyState,
  ErrorState,
  MissingState,
  Pagination,
  RetryAction,
  Section,
  Skeleton,
  Stack,
} from '../../../design-system'
import { space } from '../../../theme/tokens'
import AuthorArchiveStoryListItem from '../components/AuthorArchiveStoryListItem'
import AuthorArchiveHero from '../components/AuthorArchiveHero'
import { useAuthorArchive } from '../useAuthorArchive'

const PAGE_SIZE = 6
const SKELETON_ROWS = 4

const AuthorArchivePage = () => {
  const {
    archive,
    currentPage,
    profileLoading,
    postsLoading,
    pageErrorState,
    postsErrorState,
    setPage,
    retryPosts,
  } = useAuthorArchive(PAGE_SIZE)

  const isInitialLoading = profileLoading && !archive
  /*
   * The block the pager pages. It sits outside the post-list states, so it is
   * still there to be scrolled to and focused while the next page loads.
   */
  const postsRegionRef = useRef<HTMLElement>(null)

  return (
    <ContentContainer>
      <Section>
        {/*
          Two unequal tracks - an identity column beside the writing - which is
          not what `Grid` offers: its tracks are always equal, on purpose. A
          page-level composition like this one is the caller's to lay out, so it
          is a grid here with token spacing rather than a fourth column option
          pushed into the primitive.
        */}
        <Box
          display="grid"
          gridTemplateColumns={{ base: '1fr', lg: '320px minmax(0, 1fr)' }}
          gap={space[12]}
          alignItems="start"
        >
          {isInitialLoading ? (
            <>
              <Skeleton
                shape={{ shape: 'media', aspectRatio: '3 / 4' }}
                label="this author's profile"
              />
              <Stack gap={6}>
                {Array.from({ length: SKELETON_ROWS }, (_unused, index) => (
                  <Skeleton
                    key={`author-post-skeleton-${index}`}
                    shape={{ shape: 'text', textStyle: 'cardTitle', lines: 3 }}
                  />
                ))}
              </Stack>
            </>
          ) : pageErrorState ? (
            <Stack gap={4} gridColumn={{ base: 'auto', lg: '1 / -1' }}>
              {pageErrorState.statusCode === 404 ? (
                <MissingState subject="that author page" detail={pageErrorState.description}>
                  <ActionLink to="/blog" underline="hover" color="action.primary">
                    Back to Blog
                  </ActionLink>
                </MissingState>
              ) : (
                <ErrorState
                  failedAction="load this author page"
                  detail={pageErrorState.description}
                >
                  <ActionLink to="/blog" underline="hover" color="action.primary">
                    Back to Blog
                  </ActionLink>
                </ErrorState>
              )}
            </Stack>
          ) : archive ? (
            <>
              <Stack position={{ lg: 'sticky' }} top={{ lg: space[24] }} gap={4}>
                <AuthorArchiveHero
                  author={archive.user}
                  totalPosts={postsLoading || postsErrorState ? null : archive.total}
                />
              </Stack>

              <Stack
                ref={postsRegionRef}
                as="section"
                gap={8}
                aria-label={`Blogs by ${archive.user.name}`}
              >
                {postsLoading ? (
                  <Stack gap={6}>
                    {Array.from({ length: SKELETON_ROWS }, (_unused, index) => (
                      <Skeleton
                        key={`author-post-skeleton-${index}`}
                        shape={{ shape: 'text', textStyle: 'cardTitle', lines: 3 }}
                        label={index === 0 ? "this author's blogs" : undefined}
                      />
                    ))}
                  </Stack>
                ) : postsErrorState ? (
                  <ErrorState
                    failedAction="load this author's blogs"
                    detail={postsErrorState.description}
                    align="start"
                  >
                    <RetryAction failedAction="load this author's blogs" onRetry={retryPosts} />
                  </ErrorState>
                ) : archive.posts.length === 0 ? (
                  <EmptyState
                    subject="published blogs"
                    nextAction="Check back later, or keep browsing the latest writing across Horizon."
                    align="start"
                  >
                    <ActionLink
                      to="/blog"
                      underline="hover"
                      color="action.primary"
                      fontWeight="semibold"
                    >
                      Explore the blog
                    </ActionLink>
                  </EmptyState>
                ) : (
                  <>
                    {/*
                      A row owns no surface; a rule is what separates it from
                      its neighbour, so the list is a plain run with a divider
                      between siblings and none before the first.
                    */}
                    <Box>
                      {archive.posts.map((post, index) => (
                        <Box key={post.id}>
                          {index > 0 ? <Divider /> : null}
                          <AuthorArchiveStoryListItem post={post} />
                        </Box>
                      ))}
                    </Box>

                    <Pagination
                      page={currentPage}
                      pageSize={archive.limit || PAGE_SIZE}
                      totalItems={archive.total}
                      onPageChange={setPage}
                      regionRef={postsRegionRef}
                      label="Author archive pagination"
                    />
                  </>
                )}
              </Stack>
            </>
          ) : null}
        </Box>
      </Section>
    </ContentContainer>
  )
}

export default AuthorArchivePage

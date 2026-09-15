/**
 * Home.
 *
 * Four runs, in the order a first-time reader meets them: what the site is, the
 * Signature story, Series discovery, and the latest writing. The Signature is
 * the single most prominent piece of writing on the page and is deliberately a
 * different editorial object from the cards beneath it - not a larger one.
 *
 * The latest list excludes the Signature, so nothing appears twice, and the
 * cards carry no "Lead blog" / "Recent blog" badges: the section above them
 * already says what they are.
 */

import { useEffect, useState } from 'react'
import { FiArrowRight } from 'react-icons/fi'
import { useLocation } from 'react-router-dom'

import {
  ActionLink,
  ContentContainer,
  EmptyState,
  ErrorState,
  Eyebrow,
  Grid,
  Heading,
  RetryAction,
  Section,
  Skeleton,
  Stack,
  Stagger,
  Text,
  hierarchyContext,
} from '../../../design-system'
import { BlogPostSummary, getBlogService } from '../../../core'
import { useAuth } from '../../../context/AuthContext'
import { can } from '../../../core/authorization/authorization'
import HeroArchivePreview from '../components/HeroArchivePreview'
import StoryCard from '../components/StoryCard'
import SeriesShelf from '../../series/components/SeriesShelf'

const POST_LIMIT = 9
const SETTLE_MS = 250
const LATEST_EYEBROW = 'Recent blogs'
const LATEST_HEADING = 'Keep reading beyond the latest post'

const HomePage = () => {
  const location = useLocation()
  const [blogPosts, setBlogPosts] = useState<BlogPostSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadVersion, setReloadVersion] = useState(0)
  const { user } = useAuth()
  const canWrite = can(user?.authorization, 'content:manage:own')

  useEffect(() => {
    let cancelled = false
    let settleTimer = 0

    const settle = () => {
      // The short settle keeps the skeletons from flashing on a warm cache.
      // It is a timer, so it is cancelled on unmount rather than left to call
      // `setState` on a component that is no longer mounted.
      settleTimer = window.setTimeout(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      }, SETTLE_MS)
    }

    const loadBlogPosts = async () => {
      setIsLoading(true)
      setLoadError(null)

      try {
        const summaries = await getBlogService().getPublishedPosts({ limit: POST_LIMIT })

        if (!cancelled) {
          setBlogPosts(summaries)
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error loading blog posts:', error)
          setBlogPosts([])
          setLoadError('The latest writing could not load right now.')
        }
      } finally {
        if (!cancelled) {
          settle()
        }
      }
    }

    void loadBlogPosts()

    return () => {
      cancelled = true
      window.clearTimeout(settleTimer)
    }
  }, [location.pathname, reloadVersion])

  const signaturePost = blogPosts[0]
  const latestPosts = blogPosts.slice(1)
  const latestLabels = hierarchyContext(LATEST_EYEBROW, LATEST_HEADING)
  const writeHref = canWrite ? '/blog-editor' : user ? `/profile/${user.username}` : '/register'
  const writeLabel = canWrite
    ? 'Write your next blog'
    : user
      ? 'View your profile'
      : 'Create an account'

  return (
    <ContentContainer>
      <Section as="header">
        <Stack gap={6} maxW="4xl">
          <Eyebrow as="p">Horizon blog</Eyebrow>

          <Heading as="h1" recipe="display">
            Human stories, blogs, and thoughtful writing for curious readers.
          </Heading>

          <Text recipe="prose">
            Horizon is a quiet place to slow down, read something thoughtful, and publish work that
            feels intentional. Less noise, more clarity.
          </Text>

          <Stack direction="row" gap={6} collapseAt="sm" alignItems="center" flexWrap="wrap">
            {/*
              The page's one primary call to action, at button weight. It is
              still a link - a destination, copyable, openable in a new tab -
              and the fill, hover and focus come from the `primary` Button tone
              rather than from colour and weight written on here.
            */}
            <ActionLink to="/blog" weight="primary" iconEnd={<FiArrowRight aria-hidden="true" />}>
              Explore the blog
            </ActionLink>
            <ActionLink to={writeHref} underline="hover" standalone color="text.secondary">
              {writeLabel}
            </ActionLink>
          </Stack>

          <Text recipe="metadata" textTransform="uppercase" letterSpacing="wider">
            Read with focus. Publish with intent. Keep the blog human.
          </Text>
        </Stack>
      </Section>

      <Section>
        {/*
          One run, so an absent section contributes no air. The Series shelf
          renders nothing at all when there is no Series to show, and a Section
          wrapped around it would still have reserved its own padding.
        */}
        <Stack gap={12}>
          {isLoading ? (
            <Stack gap={8}>
              <Skeleton
                shape={{ shape: 'media', aspectRatio: '16 / 10' }}
                label="the latest writing"
              />
              <Grid columns={3} gap={8}>
                {[0, 1, 2].map((index) => (
                  <Skeleton
                    key={`home-skeleton-${index}`}
                    shape={{ shape: 'media', aspectRatio: '16 / 9' }}
                  />
                ))}
              </Grid>
            </Stack>
          ) : loadError ? (
            <ErrorState failedAction="load the latest writing" detail={loadError} align="start">
              <RetryAction
                failedAction="load the latest writing"
                onRetry={() => setReloadVersion((value) => value + 1)}
              />
            </ErrorState>
          ) : signaturePost ? (
            /* The pattern draws its own "Signature" eyebrow; a second one here
               would be the duplicated hierarchy label this release removes. */
            <HeroArchivePreview post={signaturePost} />
          ) : (
            <EmptyState
              subject="published blogs"
              nextAction={
                canWrite
                  ? 'Publish the first blog and set the tone from the very beginning.'
                  : 'New writing appears here as it is published.'
              }
              align="start"
            >
              <ActionLink
                standalone
                to={canWrite ? '/blog-editor' : user ? '/blog' : '/register'}
                underline="hover"
                color="action.primary"
                fontWeight="semibold"
              >
                {canWrite ? 'Start writing' : user ? 'Explore the blog' : 'Join Horizon'}
              </ActionLink>
            </EmptyState>
          )}

          <SeriesShelf />

          {!isLoading && !loadError && latestPosts.length > 0 ? (
            <Stack as="section" gap={6} aria-labelledby="home-latest-heading">
              <Stack
                direction="row"
                gap={4}
                collapseAt="sm"
                justifyContent="space-between"
                alignItems="flex-end"
                flexWrap="wrap"
              >
                <Stack gap={2} minW={0}>
                  <Eyebrow as="p">{LATEST_EYEBROW}</Eyebrow>
                  <Heading id="home-latest-heading" as="h2" recipe="sectionTitle">
                    {LATEST_HEADING}
                  </Heading>
                </Stack>
                <ActionLink
                  standalone
                  to="/blog"
                  underline="hover"
                  color="action.primary"
                  fontWeight="semibold"
                >
                  See all blogs
                </ActionLink>
              </Stack>

              <Grid columns={3} gap={8}>
                <Stagger>
                  {latestPosts.map((post) => (
                    <StoryCard key={post.id} post={post} sectionLabels={latestLabels} />
                  ))}
                </Stagger>
              </Grid>
            </Stack>
          ) : null}
        </Stack>
      </Section>
    </ContentContainer>
  )
}

export default HomePage

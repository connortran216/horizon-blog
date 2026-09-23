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
import { FiArrowDown, FiArrowRight } from 'react-icons/fi'
import { useLocation } from 'react-router-dom'

import {
  ActionLink,
  COPY_MARKER,
  ContentContainer,
  EmptyState,
  ErrorState,
  Eyebrow,
  Grid,
  Heading,
  RetryAction,
  Reveal,
  Section,
  SignalTarget,
  Skeleton,
  Stack,
  Stagger,
  SynapseField,
  Text,
  Typeset,
  hierarchyContext,
  sentenceWrittenAt,
  synapseTiming,
  useMotionPolicy,
} from '../../../design-system'
import { layout } from '../../../theme/tokens'
import { BlogPostSummary, getBlogService } from '../../../core'
import { useAuth } from '../../../context/AuthContext'
import { can } from '../../../core/authorization/authorization'
import HeroArchivePreview from '../components/HeroArchivePreview'
import StoryCard from '../components/StoryCard'
import SeriesShelf from '../../series/components/SeriesShelf'

const POST_LIMIT = 9
const HERO_HEADLINE = 'Human stories, blogs, and thoughtful writing for curious readers.'
/** The words the page most wants read; they get the drawn rule. */
const HERO_EMPHASIS = 'curious readers.'
/** The eyebrow plus every word of the headline: what the field has to write. */
const HERO_ANCHOR_COUNT = 1 + HERO_HEADLINE.trim().split(/\s+/u).length
/** A full-width field has room for more thoughts than a plate. */
const HERO_DENSITY = 56
/** Where "Latest writing" lands: the run of Signature, Series and recent blogs. */
const LATEST_ANCHOR_ID = 'home-writing'
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
  const policy = useMotionPolicy()
  /*
   * The rest of the hero waits for the sentence. Not for the last word to land
   * - that would leave the call to action a full second behind the headline -
   * but for the writing to be most of the way through, so the lede arrives as
   * the last words do.
   */
  const afterHeadline = sentenceWrittenAt(HERO_ANCHOR_COUNT, synapseTiming(policy)) * 0.7

  useEffect(() => {
    let cancelled = false

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
        // The guard is what keeps this off an unmounted component; the request
        // settling is the only thing the skeletons were ever waiting for.
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadBlogPosts()

    return () => {
      cancelled = true
    }
  }, [location.pathname, reloadVersion])

  const signaturePost = blogPosts[0]
  /*
   * Filtered by id rather than trusting position alone: the cover transition
   * (`horizon-blog-y2e.4.2`) gives the Signature cover and every card cover a
   * `view-transition-name` derived from the post id, and two elements on one
   * page sharing that name is a real bug the browser cannot recover from
   * gracefully. `slice(1)` already keeps the Signature post out of the grid
   * today; this makes that guarantee resilient to a future change in how
   * `blogPosts` is built rather than just to today's shape of it.
   */
  const latestPosts = blogPosts.slice(1).filter((post) => post.id !== signaturePost?.id)
  const latestLabels = hierarchyContext(LATEST_EYEBROW, LATEST_HEADING)
  const writeHref = canWrite ? '/blog-editor' : user ? `/profile/${user.username}` : '/register'
  const writeLabel = canWrite
    ? 'Write your next blog'
    : user
      ? 'View your profile'
      : 'Create an account'

  return (
    <>
      {/*
        The hero is the page itself for the first screen: the synapse field
        runs edge to edge under a transparent header, the copy sits in the
        content frame on top of it, and the field dissolves along its bottom
        edge and fades as the reader scrolls it away. The network writes the
        copy: the eyebrow and every word of the headline are anchors it sends
        a signal to, in order, and each appears when its signal lands; the two
        words the page most wants read get the rule. The lede, the calls to
        action and the sign-off come in a beat apart once the sentence is
        nearly written. The field is weather, not content: hidden from
        assistive technology, never carrying text of its own, faint in a
        hand's width around the copy and full everywhere else.
      */}
      <SynapseField
        variant="canvas"
        as="header"
        density={HERO_DENSITY}
        minH={{
          base: `calc(100svh - ${layout.header.mobile})`,
          sm: `calc(100svh - ${layout.header.desktop})`,
        }}
      >
        <ContentContainer py={{ base: 10, md: 12 }}>
          <Stack gap={6} maxW={{ base: 'none', lg: '58%' }} {...{ [COPY_MARKER]: '' }}>
            <SignalTarget>
              <Eyebrow as="p">Horizon blog</Eyebrow>
            </SignalTarget>

            <Heading as="h1" recipe="display">
              <Typeset emphasis={HERO_EMPHASIS}>{HERO_HEADLINE}</Typeset>
            </Heading>

            <Stagger trigger="mount" initialDelay={afterHeadline} maxDelay={afterHeadline + 0.6}>
              <Text recipe="prose">
                Horizon is a quiet place to slow down, read something thoughtful, and publish work
                that feels intentional. Less noise, more clarity.
              </Text>

              <Stack direction="row" gap={6} collapseAt="sm" alignItems="center" flexWrap="wrap">
                {/*
                  The page's one primary call to action, at button weight. It is
                  still a link - a destination, copyable, openable in a new tab -
                  and the fill, hover and focus come from the `primary` Button tone
                  rather than from colour and weight written on here.
                */}
                <ActionLink
                  to="/blog"
                  weight="primary"
                  iconEnd={<FiArrowRight aria-hidden="true" />}
                >
                  Explore the blog
                </ActionLink>
                <ActionLink to={writeHref} underline="hover" standalone color="text.secondary">
                  {writeLabel}
                </ActionLink>
              </Stack>

              <Text recipe="metadata" textTransform="uppercase" letterSpacing="wider">
                Read with focus. Publish with intent. Keep the blog human.
              </Text>

              {/*
                The quiet invitation to keep going. A real in-page link to the
                writing below, so it works without any script; the arrow moves
                the way the page will.
              */}
              <ActionLink
                href={`#${LATEST_ANCHOR_ID}`}
                standalone
                underline="hover"
                color="text.secondary"
                iconTravel="down"
                iconEnd={<FiArrowDown aria-hidden="true" />}
              >
                Latest writing
              </ActionLink>
            </Stagger>
          </Stack>
        </ContentContainer>
      </SynapseField>

      <ContentContainer
        id={LATEST_ANCHOR_ID}
        as="div"
        sx={{ scrollMarginTop: layout.header.desktop }}
      >
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

            <Reveal duration="reveal">
              <SeriesShelf />
            </Reveal>

            {!isLoading && !loadError && latestPosts.length > 0 ? (
              <Stack as="section" gap={6} aria-labelledby="home-latest-heading">
                <Reveal duration="reveal">
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
                </Reveal>

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
    </>
  )
}

export default HomePage

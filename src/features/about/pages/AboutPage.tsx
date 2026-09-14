/**
 * About - migrated onto Horizon Design System v2 (release M2).
 *
 * `ContentContainer` frames it, `Section` carries the rhythm between the four
 * runs, `Surface` owns every card edge and `Reveal` / `Stagger` own entry. The
 * founder portrait is a `ResponsiveImage`, so a remote object on a MinIO bucket
 * finally has a loading, absent and failed state.
 *
 * `ProfileHeader` was the candidate for the founder card and does not fit: it
 * renders exactly one biography paragraph beside a small avatar, and the real
 * founder note is two paragraphs beside a portrait. Using it would have meant
 * dropping half the biography, so the card composes the same primitives itself.
 *
 * The biography, the portrait, the tags and the three outbound links are the
 * real ones, unchanged.
 */

import { Box, Flex } from '@chakra-ui/react'
import { FaCode, FaGithub, FaLinkedin, FaRegCompass, FaUsers } from 'react-icons/fa'
import { FiArrowRight, FiBookOpen, FiFeather, FiLayers, FiMessageSquare } from 'react-icons/fi'

import { componentTokens, radii, space } from '../../../theme/tokens'
import {
  ActionLink,
  Chip,
  ContentContainer,
  Eyebrow,
  Grid,
  Heading,
  ResponsiveImage,
  Reveal,
  Section,
  Stack,
  Stagger,
  Surface,
  Text,
} from '../../../design-system'
import AboutHero from '../components/AboutHero'
import AboutStatCard from '../components/AboutStatCard'
import { AboutFocusThread, AboutPrinciple, AboutStatItem } from '../about.types'

const PORTRAIT_SRC =
  'https://minio.connortran.io.vn/horizon-blog-public-bucket/connortran-avatar.jpg'

const stats: AboutStatItem[] = [
  {
    label: 'Experience across backend work',
    value: '5+ years',
    description: 'Grounded in real delivery work across systems, APIs, and product surfaces.',
    icon: FaUsers,
  },
  {
    label: 'Primary craft',
    value: 'Python + Django',
    description:
      'The stack behind most of the day-to-day engineering practice that feeds the blog.',
    icon: FaCode,
  },
  {
    label: 'Working lane',
    value: 'Backend systems',
    description:
      'Daily work centered on APIs, event flows, reliability, and product infrastructure.',
    icon: FaRegCompass,
  },
  {
    label: 'Writing direction',
    value: 'Engineering + life',
    description: 'Notes about technical work, product craft, and the human side of building.',
    icon: FiBookOpen,
  },
]

const principles: AboutPrinciple[] = [
  {
    icon: FiFeather,
    title: 'Stay curious',
    description:
      'Horizon starts from curiosity, not certainty. It is a place to follow questions, notice patterns, and keep learning in public.',
  },
  {
    icon: FiLayers,
    title: 'Write down what helps',
    description:
      'I write about ideas, lessons, and technical details that have helped me think better or work better, hoping they stay useful to someone else too.',
  },
  {
    icon: FiMessageSquare,
    title: 'Leave room for the unknown',
    description:
      'Knowledge does not end. The more we learn, the more clearly we see how much is still missing, and the page should stay open to that.',
  },
]

const focusThreads: AboutFocusThread[] = [
  {
    label: 'Build',
    title: 'Backend systems with real constraints',
    description: 'Most of the daily work lives in APIs, event flows, and product infrastructure.',
  },
  {
    label: 'Write',
    title: 'Notes that come from practice',
    description: 'The writing focuses on lessons that hold up better after doing the work.',
  },
  {
    label: 'Shape',
    title: 'Interfaces that stay quiet',
    description:
      'Layout, motion, and hierarchy should support the writing instead of competing with it.',
  },
]

const founderTags = ['Backend systems', 'Product infrastructure', 'Writing in public']

const AboutPage = () => (
  <ContentContainer>
    <Section density="comfortable">
      <AboutHero focusThreads={focusThreads} />
    </Section>

    <Section density="compact" aria-labelledby="about-signals">
      <Stack gap={6}>
        <Stack gap={2}>
          {/*
           * The legacy page had no heading here, only a kicker and a paragraph,
           * which left four cards hanging under nothing in the document
           * outline. The kicker's own word becomes the heading.
           */}
          <Heading recipe="sectionTitle" as="h2" id="about-signals">
            Signals
          </Heading>
          <Text recipe="body" maxW="prose">
            Enough context to understand the background behind the writing without turning the page
            into a resume.
          </Text>
        </Stack>

        <Grid columns={4} gap={6}>
          <Stagger>
            {stats.map((stat) => (
              <AboutStatCard key={stat.label} {...stat} />
            ))}
          </Stagger>
        </Grid>
      </Stack>
    </Section>

    <Section density="compact" aria-labelledby="about-approach">
      <Reveal>
        <Stack gap={6}>
          <Stack gap={2}>
            <Eyebrow as="p">Approach</Eyebrow>
            <Heading recipe="sectionTitle" as="h2" id="about-approach">
              Why Horizon stays open
            </Heading>
          </Stack>

          {/*
            No `alignItems="start"` here, and the card fills its track: the two
            columns hold one card against a stack of three, so starting them
            left the long card 560px tall beside a 762px column and 202px of
            nothing under it. Stretching is what makes the pair read as one
            block rather than two lists that happen to be side by side.
          */}
          <Grid columns={2} gap={6} collapseAt="lg">
            <Surface depth="flat" height="100%" p={{ base: space[6], sm: space[8] }}>
              <Stack gap={6}>
                <Heading recipe="cardTitle" as="h3">
                  The more I learn, the more I realize how much I still do not know.
                </Heading>
                <Text recipe="body">
                  Horizon is a place to stay curious, follow ideas that keep pulling at me, and
                  write down the things that have helped me a lot. Some of them come from backend
                  systems, some from writing, and some from those small moments where a confusing
                  piece of work suddenly becomes a little clearer.
                </Text>
                <Text recipe="body">
                  Knowledge feels endless. The more we learn, the more aware we become of how much
                  is still missing, and Horizon should feel open enough to keep making room for
                  that. I do not want this page to sound final. I want it to feel like an honest
                  record of things I am still learning, revisiting, and understanding more slowly
                  over time.
                </Text>
                <Stack direction="row" collapseAt={undefined} gap={3} flexWrap="wrap">
                  {principles.map((principle) => (
                    <Chip key={principle.title}>{principle.title}</Chip>
                  ))}
                </Stack>
              </Stack>
            </Surface>

            {/*
              The principles arrive one after another, like the signal cards
              above them. They used to ride the section's single `Reveal`, which
              meant one page carried two different entry granularities with
              nothing in the content to justify the difference: some cards
              arrived in sequence, these three arrived as one block.
            */}
            <Stack gap={6}>
              <Stagger>
                {principles.map((principle) => (
                  <Surface key={principle.title} as="article" depth="flat">
                    <Stack gap={4}>
                      {/*
                        The icon belongs beside the title, not above it. Stacked,
                        it cost a 48px row plus a gap before the card said what
                        it was about - the heading is what a reader scans for,
                        and the icon is a mark on it rather than a thing in its
                        own right. `minWidth: 0` so a long title wraps inside the
                        row instead of pushing the icon out of the card.
                      */}
                      <Flex align="center" gap={space[4]}>
                        <Flex
                          align="center"
                          justify="center"
                          boxSize={space[12]}
                          borderRadius={radii.control}
                          bg={componentTokens.control.quietHoverBg}
                          color={componentTokens.control.solidBg}
                          flexShrink={0}
                          aria-hidden="true"
                        >
                          <Box as={principle.icon} boxSize={space[4]} />
                        </Flex>
                        <Heading recipe="cardTitle" as="h3" minW={0}>
                          {principle.title}
                        </Heading>
                      </Flex>
                      <Text recipe="body">{principle.description}</Text>
                    </Stack>
                  </Surface>
                ))}
              </Stagger>
            </Stack>
          </Grid>
        </Stack>
      </Reveal>
    </Section>

    <Section density="compact" aria-labelledby="about-founder">
      <Reveal>
        <Surface as="article" depth="feature" p={{ base: space[6], sm: space[8] }}>
          {/*
            The text column has to stretch for its own `justifyContent="center"`
            to have a row to centre in. Started, it sat at its natural height
            against a taller portrait and the leftover fell entirely below it -
            33px above the writing and 82px under it, which is the bottom-heavy
            card. Stretched, the same slack splits evenly.
          */}
          <Grid columns={2} gap={8} collapseAt="lg">
            {/*
             * A real media frame rather than a bare `img`: the portrait is a
             * remote object on a MinIO bucket, and the legacy page had no
             * loading, absent or failed state for it at all - a broken URL left
             * a collapsed box and no alt anyone could act on.
             */}
            {/*
              Square rather than 4/5. The portrait sets the card's height, and
              at 4/5 it stood 609px against 438px of text beside it - 204px of
              empty card under the writing. A square frame is 487px in the same
              column, which puts the two within 49px of each other. The image
              still fills its frame and crops rather than distorting.
            */}
            <ResponsiveImage
              aspectRatio="1 / 1"
              src={PORTRAIT_SRC}
              alt="Portrait of Tran Tuan Canh, founder of Horizon Blog"
              task="the founder portrait"
              loading="lazy"
            />

            <Stack gap={6} justifyContent="center">
              <Stack gap={3}>
                <Eyebrow as="p">Founder note</Eyebrow>
                <Heading recipe="sectionTitle" as="h2" id="about-founder">
                  Tran Tuan Canh
                </Heading>
                <Text
                  recipe="metadata"
                  as="p"
                  color="action.primary"
                  fontWeight="semibold"
                  letterSpacing="wider"
                  textTransform="uppercase"
                >
                  Founder and Engineer
                </Text>
              </Stack>

              <Text recipe="body">
                I built Horizon as a place to think in public, write with more intent, and keep the
                product surface honest. If a page cannot support the writing or the person behind
                it, it is not done yet.
              </Text>
              <Text recipe="body">
                Most of my day-to-day work lives in backend systems, APIs, event flows, and product
                infrastructure. The dedicated CV page pulls that professional side into the same
                editorial world as the writing.
              </Text>

              <Stack direction="row" collapseAt={undefined} gap={3} flexWrap="wrap">
                {founderTags.map((tag) => (
                  <Chip key={tag}>{tag}</Chip>
                ))}
              </Stack>

              <Stack direction="row" collapseAt={undefined} gap={6} flexWrap="wrap">
                <ActionLink
                  to="/cv"
                  underline="hover"
                  iconEnd={<FiArrowRight aria-hidden="true" />}
                  color="action.primary"
                  fontWeight="semibold"
                >
                  View CV
                </ActionLink>
                <ActionLink
                  href="https://github.com/connortran216"
                  underline="hover"
                  iconStart={<FaGithub aria-hidden="true" />}
                  color="action.primary"
                  fontWeight="semibold"
                >
                  GitHub
                </ActionLink>
                <ActionLink
                  href="https://www.linkedin.com/in/c%E1%BA%A3nh-tr%E1%BA%A7n-tu%E1%BA%A5n-b57564162/"
                  underline="hover"
                  iconStart={<FaLinkedin aria-hidden="true" />}
                  color="action.primary"
                  fontWeight="semibold"
                >
                  LinkedIn
                </ActionLink>
              </Stack>
            </Stack>
          </Grid>
        </Surface>
      </Reveal>
    </Section>
  </ContentContainer>
)

export default AboutPage

import { Flex, Grid as ChakraGrid } from '@chakra-ui/react'

import {
  ContentContainer,
  Divider,
  Eyebrow,
  Heading,
  Section,
  SignalLine,
  SignalRoute,
  Stack,
  Text,
  Typeset,
  durationSeconds,
  useMotionPolicy,
} from '../../../design-system'
import { space } from '../../../theme/tokens'
import { ContactRail } from '../components'

const topics = ['Writing feedback', 'Frontend architecture', 'Product conversations'] as const

export const CONTACT_HEADLINE = 'A quieter inbox for deeper conversations.'
export const CONTACT_EMPHASIS = 'conversations.'

/*
 * The letter and its rail, joined by one line. The title typesets itself and
 * draws the rule under "conversations."; then the column divider draws down
 * from the top, a signal at its tip, and each contact channel's mark lights as
 * the signal passes it - the invitation carried across to the way to answer
 * it. Only the decorative marks wait for the signal: every word, address and
 * action on the page is present from the first frame. Below the grid
 * breakpoint the divider is not drawn, and the marks are simply there.
 */
const ContactPage = () => {
  const policy = useMotionPolicy()
  // The divider leaves once the title has set - one editorial reveal.
  const afterTitle = durationSeconds('reveal', policy)

  return (
    <ContentContainer>
      <Section density="comfortable" aria-labelledby="contact-title">
        <ChakraGrid
          templateColumns={{
            base: 'minmax(0, 1fr)',
            lg: 'minmax(0, 1.14fr) minmax(0, 0.86fr)',
          }}
          gap={{ base: space[12], lg: space[12] }}
          alignItems="start"
        >
          <Stack gap={8} minW={0}>
            <Stack gap={6}>
              <Eyebrow as="p">Contact Horizon</Eyebrow>

              {/*
              Measured in em so the letter's three lines hold at every size:
              "A quieter inbox" / "for deeper" / "conversations."
            */}
              <Heading recipe="display" as="h1" id="contact-title" maxW="7.5em">
                <Typeset emphasis={CONTACT_EMPHASIS}>{CONTACT_HEADLINE}</Typeset>
              </Heading>
            </Stack>

            <Stack gap={6} maxW="prose">
              <Text recipe="prose" color="text.secondary">
                If you have a question, an idea, or just want to share your thoughts, I&apos;d love
                to hear from you. Email is the best place to reach me, whether it&apos;s about a
                blog, frontend architecture, or where the web is headed.
              </Text>

              <Text recipe="prose" color="text.secondary">
                A little context goes a long way.
              </Text>

              <Text recipe="prose" color="text.muted" fontStyle="italic">
                - Canh
              </Text>
            </Stack>

            <Divider />

            <Stack gap={3}>
              <Eyebrow as="p">Some things people often write about</Eyebrow>
              <Flex gap={space[4]} flexWrap="wrap">
                {topics.map((topic, index) => (
                  <Text
                    key={topic}
                    as="span"
                    recipe="body"
                    color="text.secondary"
                    paddingRight={index === topics.length - 1 ? 0 : space[4]}
                    borderRight={index === topics.length - 1 ? '0' : '1px solid'}
                    borderColor="border.subtle"
                  >
                    {topic}
                  </Text>
                ))}
              </Flex>
            </Stack>
          </Stack>

          <SignalRoute
            orientation="vertical"
            trigger="mount"
            delay={afterTitle}
            position="relative"
            minW={0}
            paddingLeft={{ base: 0, lg: space[12] }}
          >
            <SignalLine
              position="absolute"
              insetBlock={0}
              left={0}
              display={{ base: 'none', lg: 'block' }}
            />
            <ContactRail />
          </SignalRoute>
        </ChakraGrid>
      </Section>
    </ContentContainer>
  )
}

export default ContactPage

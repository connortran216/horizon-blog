/**
 * Contact - the page is the email address.
 *
 * The previous version had three problems that compounded into one ugly page,
 * and they are worth naming because each is easy to reintroduce:
 *
 * - **The same action appeared twice.** "Email directly" and "Call instead" sat
 *   in the hero, and then the same two channels appeared again underneath as
 *   cards with the same verbs. A reader had to work out whether the two sets
 *   did different things. They did not.
 * - **Three metaphors at once.** A two-column hero, one bare oversized value,
 *   and two bordered cards, on one screen. Nothing said which of the three was
 *   the page's shape.
 * - **The hero was squeezed into half the width**, so a `display` headline set
 *   at 64px wrapped across four short lines beside a column of cards.
 *
 * So: one column, one idea. The page states what it is for, gives the address
 * at the size of a page title because that address is the whole point, and then
 * lists the other two ways to reach the author quietly underneath. No cards.
 *
 * Every real detail - the address, the number, the location - is unchanged.
 */

import { FiClock, FiMessageSquare, FiPenTool } from 'react-icons/fi'

import { space } from '../../../theme/tokens'
import {
  ActionLink,
  ContentContainer,
  Divider,
  Eyebrow,
  Grid,
  Heading,
  Section,
  SectionLabel,
  Stack,
  Stagger,
  Text,
} from '../../../design-system'
import { ContactPromptItem } from '../contact.types'

const EMAIL = 'canhtran210699@gmail.com'
const PHONE = '+84 96 345 2909'

/**
 * The two channels that are not the recommended one.
 *
 * The address deliberately has no action. A postal address is context for a
 * conversation, not a thing to press, and inventing a button for it - a map
 * link, a copy control - would be the page making up a job for itself.
 */
const otherChannels = [
  {
    kind: 'Phone',
    value: PHONE,
    note: 'Best for time-sensitive conversations after a short heads-up.',
    href: `tel:${PHONE.replace(/[^\d+]/g, '')}`,
    action: 'Call',
  },
  {
    kind: 'Location',
    value: 'Ho Chi Minh City, Vietnam',
    note: '10 Lam Van Ben, Tan Hung ward. Useful when a conversation needs timezone or local context.',
    href: null,
    action: null,
  },
] as const

const prompts: ContactPromptItem[] = [
  {
    icon: FiPenTool,
    title: 'Writing and editorial feedback',
    description: 'Reach out with ideas, feedback on the blog, or topics you want to see explored.',
  },
  {
    icon: FiMessageSquare,
    title: 'Frontend and product conversations',
    description:
      'The project is also a design and engineering playground, so thoughtful product discussions are always welcome.',
  },
  {
    icon: FiClock,
    title: 'Clear expectations',
    description:
      'Messages should feel as intentional as the product. Short context and a concrete ask work best.',
  },
]

const ContactPage = () => (
  <ContentContainer>
    <Section density="comfortable">
      {/*
        One column at prose measure. The headline is a `display` recipe, which
        is 64px on a wide screen - it needs the full frame to land in two lines
        rather than four, and it had half of it.
      */}
      <Stack gap={6} maxW="4xl">
        <Eyebrow as="p">Contact Horizon</Eyebrow>

        <Heading recipe="display" as="h1">
          Reach out directly, with no form in the middle.
        </Heading>

        <Text recipe="prose" maxW="prose">
          Email is the best place for thoughtful notes about writing, frontend architecture, or the
          direction of Horizon. A little context makes the reply more useful.
        </Text>
      </Stack>
    </Section>

    <Section density="compact" aria-labelledby="contact-email">
      {/*
        The one emphasis on the page, and it is carried by scale rather than by
        a fill. `pageTitle` and not `display`: at 64px the address runs past the
        measure on a laptop and breaks mid-string on a phone, which is not
        emphasis, it is damage.
      */}
      <Stack gap={4}>
        <SectionLabel id="contact-email">Write to me</SectionLabel>
        <Divider />
        <ActionLink
          href={`mailto:${EMAIL}`}
          underline="hover"
          /*
           * Not a scale step on a phone. At 32px this address is 24 characters
           * against 327px of room, so `pageTitle` broke it across two lines
           * mid-string - "canhtran210699@gm | ail.com" - which reads as damage
           * rather than emphasis. It is emphatic here because it is the largest
           * thing on its screen, not because it hits a particular number, so
           * the size is allowed to follow the width it actually has.
           */
          fontSize={{ base: '22px', sm: '28px', md: '44px' }}
          lineHeight={{ base: '30px', sm: '38px', md: '54px' }}
          fontWeight="semibold"
          color="text.primary"
          _hover={{ color: 'action.primary' }}
        >
          {EMAIL}
        </ActionLink>
        <Text recipe="body" color="text.secondary" maxW="prose">
          Best for blog feedback, frontend discussion, and thoughtful async context. Replies are
          slower than a chat app and more considered than one.
        </Text>
      </Stack>
    </Section>

    <Section density="compact" aria-labelledby="contact-other">
      <Stack gap={4}>
        <SectionLabel id="contact-other">Other ways</SectionLabel>
        <Divider />

        {/*
          Kind, value, action - one row each. A row does not need a border to
          be read as a row; the rule between two of them is enough, and it
          costs one device where a card spends four.
        */}
        <Stagger>
          {otherChannels.map((channel) => (
            <Stack key={channel.kind} gap={4} paddingBlock={space[4]}>
              <Grid columns={3} gap={6} collapseAt="sm" alignItems="baseline">
                <Eyebrow as="p">{channel.kind}</Eyebrow>

                <Stack gap={2} minW={0}>
                  <Text recipe="body" fontWeight="semibold" color="text.primary">
                    {channel.value}
                  </Text>
                  <Text recipe="body" color="text.secondary">
                    {channel.note}
                  </Text>
                </Stack>

                {channel.href ? (
                  <ActionLink href={channel.href} weight="secondary">
                    {channel.action}
                  </ActionLink>
                ) : (
                  <span />
                )}
              </Grid>
              <Divider />
            </Stack>
          ))}
        </Stagger>
      </Stack>
    </Section>

    <Section density="compact" aria-labelledby="contact-reasons">
      <Stack gap={6}>
        <Stack gap={2}>
          <Eyebrow as="p">Good conversations start with clarity</Eyebrow>
          <Heading recipe="sectionTitle" as="h2" id="contact-reasons">
            A few helpful reasons to reach out
          </Heading>
        </Stack>

        {/*
          Three short pieces of guidance, each under its own rule. They were
          cards, which gave three sentences the same weight as the address the
          page exists to hand over.
        */}
        <Grid columns={3} gap={8}>
          <Stagger>
            {prompts.map((prompt) => (
              <Stack key={prompt.title} as="article" gap={3}>
                <Divider />
                <Heading recipe="cardTitle" as="h3">
                  {prompt.title}
                </Heading>
                <Text recipe="body" color="text.secondary">
                  {prompt.description}
                </Text>
              </Stack>
            ))}
          </Stagger>
        </Grid>
      </Stack>
    </Section>
  </ContentContainer>
)

export default ContactPage

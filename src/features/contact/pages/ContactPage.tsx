/**
 * Contact - migrated onto Horizon Design System v2 (release M2).
 *
 * The page composes the design system's `ContactCard` and `ContactPrompt`
 * rather than owning cards of its own. Link semantics for a `mailto:`, a `tel:`
 * and a postal address are easy to get subtly wrong, and `contactHref` answers
 * that question once instead of at every call site.
 *
 * Each channel card carries its own action - "Call", "Email directly" - beside
 * the value it links. The page names the verb; the pattern decides whether the
 * channel can carry one at all, which is why the address has none.
 *
 * The real contact details - the address, the number and the email - are
 * unchanged.
 */

import { Icon } from '@chakra-ui/react'
import { FaEnvelope, FaMapMarkerAlt, FaPhone } from 'react-icons/fa'
import { FiArrowRight, FiClock, FiMessageSquare, FiPenTool } from 'react-icons/fi'

import { space } from '../../../theme/tokens'
import {
  ActionLink,
  ContactCard,
  ContactPrompt,
  ContentContainer,
  Eyebrow,
  Grid,
  Heading,
  Section,
  Stack,
  Text,
} from '../../../design-system'
import { ContactInfoItem, ContactPromptItem } from '../contact.types'

const EMAIL = 'canhtran210699@gmail.com'
const PHONE = '+84 96 345 2909'

const contactInfo: ContactInfoItem[] = [
  {
    channel: 'location',
    icon: FaMapMarkerAlt,
    title: 'Location',
    content: '10 Lam Van Ben, Tan Hung ward, HCM City, Vietnam',
    description: 'Useful when a conversation needs timezone or local context.',
    emphasis: 'secondary',
  },
  {
    channel: 'phone',
    icon: FaPhone,
    title: 'Phone',
    content: PHONE,
    description: 'Best for time-sensitive conversations after a short heads-up.',
    actionLabel: 'Call',
    emphasis: 'secondary',
  },
  {
    channel: 'email',
    icon: FaEnvelope,
    title: 'Email',
    content: EMAIL,
    description: 'Best for blog feedback, frontend discussion, and thoughtful async context.',
    actionLabel: 'Email directly',
    emphasis: 'primary',
  },
]

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

const ContactPage = () => {
  const primaryContact = contactInfo.find((info) => info.emphasis === 'primary')
  const secondaryContacts = contactInfo.filter((info) => info.emphasis !== 'primary')

  return (
    <ContentContainer>
      <Section density="comfortable">
        <Grid columns={2} gap={8} collapseAt="lg" alignItems="start">
          <Stack gap={6}>
            <Eyebrow as="p">Contact Horizon</Eyebrow>

            <Heading recipe="display" as="h1">
              Reach out directly, with no form in the middle.
            </Heading>

            <Text recipe="prose">
              Email is the best place for thoughtful notes about writing, frontend architecture, or
              the direction of Horizon. A little context makes the reply more useful.
            </Text>

            <Stack direction="row" collapseAt={undefined} gap={6} flexWrap="wrap">
              <ActionLink
                href={`mailto:${EMAIL}`}
                underline="hover"
                iconEnd={<FiArrowRight aria-hidden="true" />}
                color="action.primary"
                fontWeight="semibold"
              >
                Email directly
              </ActionLink>
              <ActionLink
                href={`tel:${PHONE.replace(/[^\d+]/g, '')}`}
                underline="hover"
                color="action.primary"
                fontWeight="semibold"
              >
                Call instead
              </ActionLink>
            </Stack>
          </Stack>

          <Stack gap={4}>
            {primaryContact ? (
              <ContactCard
                channel={primaryContact.channel}
                title={primaryContact.title}
                value={primaryContact.content}
                detail={primaryContact.description}
                actionLabel={primaryContact.actionLabel}
                emphasis="primary"
                icon={<Icon as={primaryContact.icon} boxSize={space[6]} />}
              />
            ) : null}

            {secondaryContacts.map((info) => (
              <ContactCard
                key={info.title}
                channel={info.channel}
                title={info.title}
                value={info.content}
                detail={info.description}
                actionLabel={info.actionLabel}
                icon={<Icon as={info.icon} boxSize={space[6]} />}
              />
            ))}
          </Stack>
        </Grid>
      </Section>

      <Section density="compact">
        <Stack gap={6}>
          <Stack gap={2}>
            <Eyebrow as="p">Good conversations start with clarity</Eyebrow>
            <Heading recipe="sectionTitle" as="h2">
              A few helpful reasons to reach out.
            </Heading>
          </Stack>

          <Grid columns={3} gap={6}>
            {prompts.map((prompt) => (
              <ContactPrompt
                key={prompt.title}
                title={prompt.title}
                description={prompt.description}
                icon={<Icon as={prompt.icon} boxSize={space[4]} />}
              />
            ))}
          </Grid>
        </Stack>
      </Section>
    </ContentContainer>
  )
}

export default ContactPage

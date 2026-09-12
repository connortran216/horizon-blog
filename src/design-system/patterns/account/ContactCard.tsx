/**
 * Horizon Design System v2 - a contact channel.
 *
 * One way to reach the author: an address, a number, a profile elsewhere, or a
 * place. It replaces the legacy `ContactInfoCard` and `ContactPromptCard` - the
 * `prompt` variant is the second of those, a card with no destination that
 * explains what a conversation could be about.
 *
 * The link semantics are the point of this component. A `mailto:` must not open
 * a new browsing context, an external profile must carry
 * `rel="noopener noreferrer"`, and a location must not be a link at all.
 * `contactHref` decides which of those a channel is and `ActionLink` renders it,
 * so no call site has to remember.
 */

import type { ReactElement, ReactNode } from 'react'
import { Flex } from '@chakra-ui/react'

import { componentTokens, radii, space } from '../../../theme/tokens'
import { ActionLink } from '../../components/actions'
import { Stack } from '../../components/layout'
import { Surface } from '../../components/surface'
import { Heading, Text } from '../../components/typography'
import { contactHref, type ContactChannel } from './identity.logic'

export interface ContactCardProps {
  /** How to reach the author. `location` renders as text, never as a link. */
  channel: ContactChannel
  /** The channel's name: "Email", "Based in". */
  title: string
  /** The address, number, handle or place. Shown as the link text. */
  value: string
  /** One sentence of context - response times, what to write about. */
  detail?: string
  /** Emphasis. `primary` is the preferred channel; there should be one. */
  emphasis?: 'primary' | 'secondary'
  /** The channel's mark. Decorative; the title carries the meaning. */
  icon?: ReactElement
}

export function ContactCard({
  channel,
  title,
  value,
  detail,
  emphasis = 'secondary',
  icon,
}: ContactCardProps) {
  const { href } = contactHref(channel, value)
  const isPrimary = emphasis === 'primary'

  return (
    <Surface
      as="article"
      depth={isPrimary ? 'raised' : 'flat'}
      height="100%"
      borderColor={isPrimary ? componentTokens.control.solidBg : undefined}
    >
      <Stack gap={4} height="100%">
        {icon === undefined ? null : (
          <Flex
            align="center"
            justify="center"
            boxSize={space[12]}
            borderRadius={radii.control}
            bg={componentTokens.control.quietHoverBg}
            color={componentTokens.control.solidBg}
            aria-hidden="true"
          >
            {icon}
          </Flex>
        )}

        <Heading recipe="cardTitle" as="h3">
          {title}
        </Heading>

        {href === undefined ? (
          <Text recipe="body">{value}</Text>
        ) : (
          <Text recipe="body" as="span">
            <ActionLink href={href}>{value}</ActionLink>
          </Text>
        )}

        {detail === undefined ? null : <Text recipe="metadata">{detail}</Text>}
      </Stack>
    </Surface>
  )
}

export interface ContactPromptProps {
  title: string
  description: string
  icon?: ReactElement
  children?: ReactNode
}

/**
 * A card with no destination.
 *
 * It suggests what a message could be about, which is why it has no href and no
 * button: giving it one would turn a piece of guidance into a fourth contact
 * channel that does not exist.
 */
export function ContactPrompt({ title, description, icon, children }: ContactPromptProps) {
  return (
    <Surface as="article" depth="flat" height="100%">
      <Stack gap={4}>
        {icon === undefined ? null : (
          <Flex
            align="center"
            justify="center"
            boxSize={space[8]}
            borderRadius={radii.control}
            bg={componentTokens.control.quietHoverBg}
            color={componentTokens.control.solidBg}
            aria-hidden="true"
          >
            {icon}
          </Flex>
        )}
        <Heading recipe="cardTitle" as="h3">
          {title}
        </Heading>
        <Text recipe="body">{description}</Text>
        {children}
      </Stack>
    </Surface>
  )
}

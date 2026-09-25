/**
 * Horizon Design System v2 - the profile header.
 *
 * The identity block at the top of an author workspace or a public author page:
 * portrait, name, biography, place, site, and the counts that describe the
 * writing underneath. It replaces the legacy `ProfileHeaderCard` arrangement.
 *
 * Two things the legacy card does that this one does not, on purpose:
 *
 * - It does not paint its own gradient, shadow or border. In the standard
 *   layout `Surface` owns depth; the owner workspace has no surface at all -
 *   it is an unboxed masthead on the page canvas.
 * - It does not decide who may edit. `actions` is a slot; the caller has
 *   already asked its own authorisation module and passes in the controls that
 *   answer allows.
 */

import type { ReactNode } from 'react'
import { Box, Flex, Grid as ChakraGrid } from '@chakra-ui/react'
import { FiGlobe, FiMail, FiMapPin } from 'react-icons/fi'
import type { IconType } from 'react-icons'

import { componentTokens, space } from '../../../theme/tokens'
import { ActionLink } from '../../components/actions'
import { Grid, Stack } from '../../components/layout'
import { Surface } from '../../components/surface'
import { Eyebrow, Heading, Metadata, Text } from '../../components/typography'
import { MissingState, PanelLoading, PermissionState } from '../../components/feedback'
import { SignalLine, SignalRoute, SignalTarget, Typeset } from '../../motion'
import { Avatar } from './AvatarEditor'
import { bioPlaceholder, profileHeaderState, type ProfileHeaderStateInput } from './identity.logic'

export interface ProfileStat {
  readonly label: string
  readonly value: string
  /** One sentence saying what the number counts. */
  readonly detail?: string
}

export interface ProfileIdentity {
  readonly name: string
  readonly avatarUrl?: string | null
  readonly bio?: string
  readonly email?: string
  readonly location?: string
  /** The person's own site. Rendered as an external link. */
  readonly website?: string
}

export interface ProfileHeaderProps extends Omit<ProfileHeaderStateInput, 'hasProfile' | 'hasBio'> {
  profile?: ProfileIdentity | null
  /** The kicker. "Author workspace" for the owner, "Author" in public. */
  eyebrow?: string
  /** Owner controls. The caller decides whether there are any. */
  actions?: ReactNode
  /** Counts under the identity. Two on the production workspace. */
  stats?: readonly ProfileStat[]
  /** The portrait's editor, when the viewer owns this profile. */
  avatarSlot?: ReactNode
  /** A small identity-level action, such as editing your own profile. */
  identityAction?: ReactNode
  /** The owner workspace gets an editorial split; public profiles stay standard. */
  layout?: 'standard' | 'workspace'
  /** Why the profile was refused, when it was. */
  deniedDetail?: string
}

function MetaItem({ icon, children }: { icon: IconType; children: ReactNode }) {
  return (
    <Box as="li" display="inline-flex" alignItems="center" gap={space[2]} minW="0" maxW="100%">
      <Box as={icon} aria-hidden="true" flexShrink={0} />
      <Box minW="0" maxW="100%" overflowWrap="anywhere">
        {children}
      </Box>
    </Box>
  )
}

export function ProfileHeader({
  profile,
  eyebrow = 'Author',
  actions,
  stats,
  avatarSlot,
  identityAction,
  layout = 'standard',
  deniedDetail,
  isLoading,
  deniedAction,
  isMissing,
}: ProfileHeaderProps) {
  const state = profileHeaderState({
    isLoading,
    deniedAction,
    isMissing,
    hasProfile: profile != null,
    hasBio: Boolean(profile?.bio?.trim()),
  })

  if (state.status === 'denied') {
    return (
      <PermissionState deniedAction={deniedAction ?? 'view this profile'} detail={deniedDetail} />
    )
  }

  if (state.status === 'missing') {
    return (
      <MissingState
        subject="that profile"
        detail="The handle may have changed, or the account may have been closed."
      />
    )
  }

  if (!state.showsIdentity || profile == null) {
    return <PanelLoading task="the profile" />
  }

  const metadata = (
    <>
      {profile.email ? (
        <MetaItem icon={FiMail}>
          <ActionLink href={`mailto:${profile.email}`} underline="hover">
            {profile.email}
          </ActionLink>
        </MetaItem>
      ) : null}
      {profile.location ? <MetaItem icon={FiMapPin}>{profile.location}</MetaItem> : null}
      {profile.website ? (
        <MetaItem icon={FiGlobe}>
          <ActionLink href={profile.website}>Personal site</ActionLink>
        </MetaItem>
      ) : null}
    </>
  )

  if (layout === 'workspace') {
    return (
      /*
       * The author masthead. No surface: the workspace is the page, so the
       * portrait, the name and the writing sit on the canvas like the opening
       * of an author page in print. One line runs under the masthead - a
       * `SignalRoute` - and as it draws it writes the name and then the counts
       * beneath it, the same carried signal the other public pages use.
       */
      <SignalRoute as="header" pace="order" trigger="mount" width="100%" maxW="100%" minW="0">
        <ChakraGrid
          templateColumns={{ base: 'minmax(0, 1fr)', md: 'auto minmax(0, 1fr)' }}
          columnGap={{ base: space[8], lg: space[12] }}
          rowGap={space[8]}
          alignItems="start"
        >
          <Box width={{ base: '11rem', lg: '13rem' }} minW="0">
            {avatarSlot ?? <Avatar name={profile.name} src={profile.avatarUrl} size="lg" />}
          </Box>

          {/*
            Named areas so the reading order can change with the width without
            the markup changing: at desktop the one primary action sits beside
            the eyebrow; on a phone it follows the writing it acts on, instead
            of standing above the name.
          */}
          <ChakraGrid
            minW="0"
            rowGap={space[6]}
            columnGap={space[4]}
            alignItems="center"
            templateColumns={{ base: 'minmax(0, 1fr)', sm: 'minmax(0, 1fr) auto' }}
            templateAreas={{
              base: `"eyebrow" "identity" "bio" "meta" "actions"`,
              sm: `"eyebrow actions" "identity identity" "bio bio" "meta meta"`,
            }}
          >
            <Eyebrow as="p" gridArea="eyebrow">
              {eyebrow}
            </Eyebrow>

            {actions === undefined ? null : (
              <Flex gridArea="actions" gap={space[3]} flexWrap="wrap">
                {actions}
              </Flex>
            )}

            <Stack gap={2} minW="0" gridArea="identity">
              <Heading recipe="display" as="h1" overflowWrap="anywhere">
                <Typeset>{profile.name}</Typeset>
              </Heading>
              {identityAction}
            </Stack>

            <Text
              gridArea="bio"
              recipe="prose"
              as="p"
              color={state.usesBioPlaceholder ? 'text.muted' : 'text.secondary'}
              maxW="prose"
              overflowWrap="anywhere"
            >
              {state.usesBioPlaceholder ? bioPlaceholder() : profile.bio}
            </Text>

            <Metadata
              as="ul"
              gridArea="meta"
              flexWrap="wrap"
              columnGap={space[6]}
              rowGap={space[2]}
            >
              {metadata}
            </Metadata>
          </ChakraGrid>
        </ChakraGrid>

        <SignalLine tone="action" mt={{ base: space[8], lg: space[12] }} />

        {stats === undefined || stats.length === 0 ? null : (
          /*
           * The counts as typography on the line, not as cards: each number is
           * written as the line reaches it, a term and its description so
           * "Drafts: 2" is one relationship a screen reader can state.
           */
          <ChakraGrid
            as="dl"
            templateColumns={{
              base: 'minmax(0, 1fr)',
              sm: `repeat(${stats.length}, minmax(0, 1fr))`,
            }}
            gap={{ base: space[3], sm: space[8] }}
            pt={space[6]}
          >
            {stats.map((stat) => (
              /*
               * One figure. From `sm` the number stands over its term and
               * sentence (`column-reverse` keeps the term first in the
               * markup; `flex-end` packs it to the top). On a phone it is a
               * compact row - number, then term - and the sentence waits for
               * the room.
               */
              <Flex
                key={stat.label}
                direction={{ base: 'row-reverse', sm: 'column-reverse' }}
                justify="flex-end"
                align={{ base: 'baseline', sm: 'stretch' }}
                gap={{ base: space[4], sm: space[1] }}
                minW="0"
              >
                <Box as="dt" display="flex" flexDirection="column" gap={space[1]} minW="0">
                  <Text recipe="cardTitle" as="span">
                    {stat.label}
                  </Text>
                  {stat.detail === undefined ? null : (
                    <Box display={{ base: 'none', sm: 'block' }}>
                      <Text recipe="metadata">{stat.detail}</Text>
                    </Box>
                  )}
                </Box>
                <Box
                  as="dd"
                  marginInlineStart="0"
                  flexShrink={0}
                  // A column of its own on a phone, so the terms line up whatever the digits.
                  minW={{ base: space[12], sm: 'auto' }}
                >
                  <SignalTarget>
                    <Text
                      as="span"
                      display="block"
                      textStyle="display"
                      color="action.primary"
                      lineHeight="1"
                    >
                      {stat.value}
                    </Text>
                  </SignalTarget>
                </Box>
              </Flex>
            ))}
          </ChakraGrid>
        )}
      </SignalRoute>
    )
  }

  return (
    <Surface as="header" depth="raised" p={{ base: space[6], sm: space[8] }}>
      <Stack gap={6}>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'center', md: 'flex-start' }}
          gap={{ base: space[6], md: space[8] }}
        >
          <Box flexShrink={0}>
            {avatarSlot ?? <Avatar name={profile.name} src={profile.avatarUrl} size="lg" />}
          </Box>

          <Stack gap={3} flex="1" minW="0" textAlign={{ base: 'center', md: 'start' }}>
            <Eyebrow as="p">{eyebrow}</Eyebrow>
            <Heading recipe="pageTitle" as="h1">
              {profile.name}
            </Heading>

            {identityAction}

            <Text recipe="body" color={state.usesBioPlaceholder ? 'text.muted' : undefined}>
              {state.usesBioPlaceholder ? bioPlaceholder() : profile.bio}
            </Text>

            <Metadata as="ul" justifyContent={{ base: 'center', md: 'flex-start' }} gap={space[4]}>
              {metadata}
            </Metadata>
          </Stack>

          {actions === undefined ? null : (
            <Stack
              direction="row"
              gap={3}
              collapseAt={undefined}
              flexWrap="wrap"
              justifyContent={{ base: 'center', md: 'flex-end' }}
            >
              {actions}
            </Stack>
          )}
        </Flex>

        {stats === undefined || stats.length === 0 ? null : (
          <Grid as="dl" columns={2} gap={4}>
            {stats.map((stat) => (
              <Box
                key={stat.label}
                borderWidth="1px"
                borderStyle="solid"
                borderColor={componentTokens.card.border}
                borderRadius={componentTokens.control.radius}
                bg={componentTokens.workspace.bg}
                padding={space[4]}
              >
                {/*
                 * A real `dl` pair. The label is the term and the number is the
                 * description, so "Drafts: 3" is one relationship a screen
                 * reader can state rather than two adjacent runs of text.
                 */}
                <Text recipe="metadata" as="dt" textTransform="uppercase" letterSpacing="wider">
                  {stat.label}
                </Text>
                <Box as="dd" marginInlineStart="0" marginBlockStart={space[2]}>
                  <Text recipe="cardTitle" as="span" display="block" fontWeight="semibold">
                    {stat.value}
                  </Text>
                  {stat.detail === undefined ? null : <Text recipe="metadata">{stat.detail}</Text>}
                </Box>
              </Box>
            ))}
          </Grid>
        )}
      </Stack>
    </Surface>
  )
}

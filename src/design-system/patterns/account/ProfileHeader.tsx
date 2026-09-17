/**
 * Horizon Design System v2 - the profile header.
 *
 * The identity block at the top of an author workspace or a public author page:
 * portrait, name, biography, place, site, and the counts that describe the
 * writing underneath. It replaces the legacy `ProfileHeaderCard` arrangement.
 *
 * Two things the legacy card does that this one does not, on purpose:
 *
 * - It does not paint its own gradient, shadow or border. `Surface` owns depth,
 *   and a second owner is what produced the hand-written `rgba()` shadow and
 *   the two stacked radial gradients in the legacy file.
 * - It does not decide who may edit. `actions` is a slot; the caller has
 *   already asked its own authorisation module and passes in the controls that
 *   answer allows.
 */

import type { ReactNode } from 'react'
import { Box, Flex, Grid as ChakraGrid } from '@chakra-ui/react'
import { FiGlobe, FiMail, FiMapPin } from 'react-icons/fi'
import type { IconType } from 'react-icons'

import { componentTokens, fontFamilies, space } from '../../../theme/tokens'
import { ActionLink } from '../../components/actions'
import { Grid, Stack } from '../../components/layout'
import { Divider, Surface } from '../../components/surface'
import { Eyebrow, Heading, Metadata, Text } from '../../components/typography'
import { MissingState, PanelLoading, PermissionState } from '../../components/feedback'
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
      <Surface as="header" depth="raised" padded={false} width="100%" maxW="100%" minW="0">
        <ChakraGrid
          templateColumns={{ base: 'minmax(0, 1fr)', lg: 'minmax(0, 3fr) minmax(0, 7fr)' }}
        >
          <Stack gap={6} bg="bg.subtle" p={{ base: space[6], sm: space[8] }} minW="0">
            {avatarSlot ?? <Avatar name={profile.name} src={profile.avatarUrl} size="lg" />}

            <Divider />

            <Stack gap={2} minW="0">
              <Heading recipe="pageTitle" as="h1" fontFamily={fontFamilies.display}>
                {profile.name}
              </Heading>
              {identityAction}
            </Stack>

            <Metadata as="ul" flexDirection="column" alignItems="flex-start" gap={space[3]}>
              {metadata}
            </Metadata>
          </Stack>

          <Stack
            gap={8}
            bg="bg.page"
            p={{ base: space[6], sm: space[8], lg: space[12] }}
            minW="0"
            width="100%"
            maxW="100%"
          >
            <Flex
              direction={{ base: 'column', sm: 'row' }}
              align={{ base: 'flex-start', sm: 'center' }}
              justify="space-between"
              gap={space[4]}
            >
              <Stack gap={2}>
                <Divider
                  width={space[12]}
                  borderTopColor={componentTokens.feature.accent}
                  borderTopWidth="2px"
                />
                <Eyebrow as="p">{eyebrow}</Eyebrow>
              </Stack>

              {actions === undefined ? null : (
                <Stack
                  direction="row"
                  gap={3}
                  collapseAt={undefined}
                  flexWrap="wrap"
                  justifyContent={{ base: 'flex-start', sm: 'flex-end' }}
                >
                  {actions}
                </Stack>
              )}
            </Flex>

            <Text
              recipe="sectionTitle"
              as="p"
              color={state.usesBioPlaceholder ? 'text.muted' : 'text.primary'}
              fontWeight="regular"
              width="100%"
              maxW="48ch"
              overflowWrap="anywhere"
            >
              {state.usesBioPlaceholder ? bioPlaceholder() : profile.bio}
            </Text>

            {stats === undefined || stats.length === 0 ? null : (
              <Stack gap={6} marginBlockStart={{ base: space[4], lg: space[8] }}>
                <Divider />
                <ChakraGrid
                  as="dl"
                  templateColumns={{ base: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' }}
                >
                  {stats.map((stat, index) => (
                    <Flex
                      key={stat.label}
                      align="flex-start"
                      gap={space[6]}
                      paddingInlineStart={{ base: 0, sm: index === 0 ? 0 : space[8] }}
                      paddingInlineEnd={{ base: 0, sm: index === 0 ? space[8] : 0 }}
                      paddingBlock={{ base: space[4], sm: space[2] }}
                      borderTopWidth={{ base: index === 0 ? 0 : '1px', sm: 0 }}
                      borderInlineStartWidth={{ base: 0, sm: index === 0 ? 0 : '1px' }}
                      borderColor={componentTokens.workspace.border}
                    >
                      <Box
                        as="dt"
                        display="flex"
                        flexDirection="column"
                        gap={space[1]}
                        paddingBlockStart={space[2]}
                        order={2}
                        minW="0"
                      >
                        <Text recipe="cardTitle" as="span">
                          {stat.label}
                        </Text>
                        {stat.detail === undefined ? null : (
                          <Text recipe="metadata">{stat.detail}</Text>
                        )}
                      </Box>
                      <Box as="dd" marginInlineStart="0" order={1} flexShrink={0}>
                        <Text
                          recipe="display"
                          as="span"
                          display="block"
                          color={componentTokens.feature.accent}
                        >
                          {stat.value}
                        </Text>
                      </Box>
                    </Flex>
                  ))}
                </ChakraGrid>
              </Stack>
            )}
          </Stack>
        </ChakraGrid>
      </Surface>
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

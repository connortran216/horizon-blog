import {
  Avatar,
  Box,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { ChangeEvent, RefObject } from 'react'
import { FaGithub, FaPenNib, FaTwitter, FaUsers } from 'react-icons/fa'
import { AnimatedCard, AnimatedGhostButton } from '../../../core'
import { UserProfile } from '../../../core/types/profile.types'

interface ProfileHeaderCardProps {
  profile: UserProfile | null
  profileName: string
  avatarSrc?: string
  profileLoading: boolean
  isUploadingAvatar: boolean
  articleCount: number
  avatarInputRef: RefObject<HTMLInputElement>
  onOpenProfileEditor: () => void
  onOpenAvatarPreview: () => void
  onSelectAvatar: () => void
  onAvatarChange: (event: ChangeEvent<HTMLInputElement>) => void
}

const ProfileHeaderCard = ({
  profile,
  profileName,
  avatarSrc,
  profileLoading,
  isUploadingAvatar,
  articleCount,
  avatarInputRef,
  onOpenProfileEditor,
  onOpenAvatarPreview,
  onSelectAvatar,
  onAvatarChange,
}: ProfileHeaderCardProps) => {
  return (
    <AnimatedCard overflow="hidden" intensity="medium">
      <Box p={8} overflow="hidden" pos="relative">
        {profileLoading ? (
          <Flex justify="center" align="center" minH="160px">
            <Spinner size="lg" />
          </Flex>
        ) : (
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align={{ base: 'center', md: 'flex-start' }}
            gap={6}
          >
            <Menu>
              <MenuButton
                as="button"
                type="button"
                pos="relative"
                role="group"
                cursor={profileLoading || isUploadingAvatar ? 'not-allowed' : 'pointer'}
                aria-label="Avatar options"
                disabled={profileLoading || isUploadingAvatar}
                _focusVisible={{
                  boxShadow: '0 0 0 2px var(--chakra-colors-accent-primary)',
                  borderRadius: 'full',
                }}
              >
                <Avatar size={{ base: 'xl', md: 'xl' }} src={avatarSrc} name={profileName} />
                <Box
                  pos="absolute"
                  inset={0}
                  borderRadius="full"
                  bg="blackAlpha.400"
                  opacity={0}
                  transition="opacity 0.2s ease"
                  _groupHover={{ opacity: 1 }}
                />
              </MenuButton>
              <MenuList zIndex="tooltip">
                <MenuItem onClick={onOpenAvatarPreview} isDisabled={!avatarSrc}>
                  View Avatar
                </MenuItem>
                <MenuItem onClick={onSelectAvatar}>Change Avatar</MenuItem>
              </MenuList>
            </Menu>

            <VStack flex={1} align={{ base: 'center', md: 'stretch' }} spacing={3}>
              <Heading size="3xl" color="text.primary">
                {profileName}
              </Heading>

              {profile?.email && (
                <Text color="text.tertiary" textAlign={{ base: 'center', md: 'left' }}>
                  {profile.email}
                </Text>
              )}

              <Text color="text.secondary" textAlign={{ base: 'center', md: 'left' }} maxW="lg">
                {profile?.bio || 'Tell readers a bit about yourself.'}
              </Text>

              <HStack spacing={4} flexWrap="wrap" justify={{ base: 'center', md: 'flex-start' }}>
                {profile?.location && <Text color="text.secondary">{profile.location}</Text>}
                {profile?.website && (
                  <Text
                    as="a"
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="link.default"
                    _hover={{ color: 'link.hover' }}
                  >
                    Website
                  </Text>
                )}
              </HStack>

              <Stack direction="row" spacing={6} justify={{ base: 'center', md: 'flex-start' }}>
                <HStack spacing={2}>
                  <Icon as={FaUsers} color="accent.primary" />
                  <Text color="text.secondary">
                    <Text as="span" fontWeight="bold" color="text.primary">
                      1.2k
                    </Text>{' '}
                    Followers
                  </Text>
                </HStack>
                <HStack spacing={2}>
                  <Icon as={FaPenNib} color="accent.primary" />
                  <Text color="text.secondary">
                    <Text as="span" fontWeight="bold" color="text.primary">
                      {articleCount}
                    </Text>{' '}
                    Articles
                  </Text>
                </HStack>
                <HStack
                  spacing={3}
                  ml={2}
                  borderLeft="1px solid"
                  borderColor="border.default"
                  pl={4}
                >
                  <IconButton
                    as="a"
                    href="#"
                    aria-label="GitHub"
                    icon={<Icon as={FaGithub} />}
                    variant="ghost"
                    size="sm"
                    color="text.secondary"
                    _hover={{ color: 'text.primary' }}
                  />
                  <IconButton
                    as="a"
                    href="#"
                    aria-label="Twitter"
                    icon={<Icon as={FaTwitter} />}
                    variant="ghost"
                    size="sm"
                    color="text.secondary"
                    _hover={{ color: '#1DA1F2' }}
                  />
                </HStack>
              </Stack>
            </VStack>

            <HStack alignSelf={{ base: 'center', md: 'flex-start' }} spacing={2}>
              <AnimatedGhostButton
                px={5}
                py={2}
                onClick={onOpenProfileEditor}
                isDisabled={profileLoading}
              >
                Edit Profile
              </AnimatedGhostButton>

              <Input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={onAvatarChange}
                display="none"
              />
            </HStack>
          </Flex>
        )}
      </Box>
    </AnimatedCard>
  )
}

export default ProfileHeaderCard

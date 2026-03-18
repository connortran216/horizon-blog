import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Input,
  Link,
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
import { FiArrowRight, FiEdit3, FiMapPin, FiGlobe, FiMail } from 'react-icons/fi'
import { Link as RouterLink } from 'react-router-dom'
import { AnimatedCard, AnimatedGhostButton } from '../../../core'
import { UserProfile } from '../../../core/types/profile.types'

interface ProfileHeaderCardProps {
  profile: UserProfile | null
  profileName: string
  avatarSrc?: string
  profileLoading: boolean
  isUploadingAvatar: boolean
  articleCount: number
  draftCount: number
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
  draftCount,
  avatarInputRef,
  onOpenProfileEditor,
  onOpenAvatarPreview,
  onSelectAvatar,
  onAvatarChange,
}: ProfileHeaderCardProps) => {
  return (
    <AnimatedCard
      overflow="hidden"
      intensity="light"
      position="relative"
      border="1px solid"
      borderColor="rgba(255, 255, 255, 0.04)"
      boxShadow="0 20px 44px rgba(0, 0, 0, 0.28)"
      _before={{
        content: '""',
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        bgImage: `
          radial-gradient(
            circle at 82% 30%,
            rgba(109, 130, 167, 0.16) 0%,
            rgba(109, 130, 167, 0.1) 16%,
            rgba(109, 130, 167, 0.05) 30%,
            transparent 54%
          ),
          radial-gradient(
            circle at 76% 34%,
            rgba(109, 130, 167, 0.1) 0%,
            rgba(109, 130, 167, 0.04) 20%,
            transparent 44%
          )
        `,
        opacity: 0.95,
        zIndex: 0,
      }}
    >
      <Box p={{ base: 6, md: 8 }} pos="relative" zIndex={1}>
        {profileLoading ? (
          <Flex justify="center" align="center" minH="160px">
            <Spinner size="lg" />
          </Flex>
        ) : (
          <Stack spacing={{ base: 6, md: 8 }} position="relative">
            <HStack justify="space-between" align="flex-start" flexWrap="wrap" spacing={4}>
              <Badge
                px={3}
                py={1.5}
                borderRadius="full"
                bg="bg.tertiary"
                color="text.secondary"
                textTransform="uppercase"
                letterSpacing="0.16em"
                fontSize="10px"
              >
                Author workspace
              </Badge>

              <HStack spacing={3} flexWrap="wrap">
                <Button
                  as={RouterLink}
                  to="/blog-editor"
                  bg="action.primary"
                  color="white"
                  _hover={{ bg: 'action.hover' }}
                  rightIcon={<FiArrowRight />}
                  borderRadius="full"
                >
                  Write a blog
                </Button>
                <AnimatedGhostButton
                  px={5}
                  py={2}
                  onClick={onOpenProfileEditor}
                  isDisabled={profileLoading}
                  leftIcon={<FiEdit3 />}
                  borderRadius="full"
                >
                  Edit profile
                </AnimatedGhostButton>
              </HStack>
            </HStack>

            <Flex
              direction={{ base: 'column', lg: 'row' }}
              align={{ base: 'stretch', lg: 'flex-start' }}
              gap={{ base: 6, md: 8 }}
            >
              <Stack
                spacing={4}
                align={{ base: 'center', lg: 'flex-start' }}
                minW={{ lg: '220px' }}
              >
                <Menu isLazy lazyBehavior="unmount">
                  <MenuButton
                    as={Button}
                    type="button"
                    variant="unstyled"
                    pos="relative"
                    role="group"
                    display="inline-flex"
                    alignItems="center"
                    justifyContent="center"
                    p={0}
                    boxSize={{ base: '108px', md: '132px' }}
                    minW={{ base: '108px', md: '132px' }}
                    maxW={{ base: '108px', md: '132px' }}
                    maxH={{ base: '108px', md: '132px' }}
                    borderRadius="full"
                    overflow="hidden"
                    flexShrink={0}
                    lineHeight={0}
                    bg="bg.tertiary"
                    border="1px solid"
                    borderColor="border.subtle"
                    boxShadow="lg"
                    cursor={profileLoading || isUploadingAvatar ? 'not-allowed' : 'pointer'}
                    aria-label="Avatar options"
                    disabled={profileLoading || isUploadingAvatar}
                    _focusVisible={{
                      boxShadow: '0 0 0 2px var(--chakra-colors-action-primary)',
                      borderRadius: 'full',
                    }}
                  >
                    <Avatar
                      boxSize={{ base: '108px', md: '132px' }}
                      minW={{ base: '108px', md: '132px' }}
                      minH={{ base: '108px', md: '132px' }}
                      src={avatarSrc}
                      name={profileName}
                      borderRadius="full"
                      flexShrink={0}
                    />
                    <Box
                      pos="absolute"
                      inset={0}
                      borderRadius="full"
                      bg="blackAlpha.500"
                      opacity={0}
                      transition="opacity 0.2s ease"
                      pointerEvents="none"
                      _groupHover={{ opacity: 1 }}
                    />
                    <Box
                      position="absolute"
                      insetX={0}
                      bottom={0}
                      py={2}
                      bgGradient="linear(to-t, blackAlpha.700, transparent)"
                      opacity={0}
                      transition="opacity 0.2s ease"
                      pointerEvents="none"
                      _groupHover={{ opacity: 1 }}
                    >
                      <Text
                        textAlign="center"
                        fontSize="10px"
                        fontWeight="semibold"
                        letterSpacing="0.12em"
                        textTransform="uppercase"
                        color="white"
                      >
                        Change
                      </Text>
                    </Box>
                  </MenuButton>
                  <MenuList zIndex="tooltip">
                    <MenuItem onClick={onOpenAvatarPreview} isDisabled={!avatarSrc}>
                      View avatar
                    </MenuItem>
                    <MenuItem onClick={onSelectAvatar}>Change avatar</MenuItem>
                  </MenuList>
                </Menu>

                <Text
                  fontSize="xs"
                  textTransform="uppercase"
                  letterSpacing="0.14em"
                  color="text.tertiary"
                  textAlign={{ base: 'center', lg: 'left' }}
                >
                  Profile image
                </Text>
              </Stack>

              <VStack flex={1} align={{ base: 'center', lg: 'stretch' }} spacing={5}>
                <Stack spacing={3}>
                  <Heading
                    size="3xl"
                    color="text.primary"
                    textAlign={{ base: 'center', lg: 'left' }}
                    letterSpacing="-0.04em"
                  >
                    {profileName}
                  </Heading>

                  {profile?.email && (
                    <HStack
                      spacing={2}
                      justify={{ base: 'center', lg: 'flex-start' }}
                      color="text.tertiary"
                    >
                      <FiMail />
                      <Text>{profile.email}</Text>
                    </HStack>
                  )}

                  <Text
                    color="text.secondary"
                    textAlign={{ base: 'center', lg: 'left' }}
                    maxW="2xl"
                    fontSize={{ base: 'md', md: 'lg' }}
                    lineHeight="tall"
                  >
                    {profile?.bio ||
                      'This space holds live blogs, drafts in progress, and the personal details behind the writing.'}
                  </Text>
                </Stack>

                <HStack spacing={4} flexWrap="wrap" justify={{ base: 'center', lg: 'flex-start' }}>
                  {profile?.location ? (
                    <HStack spacing={2} color="text.secondary">
                      <FiMapPin />
                      <Text>{profile.location}</Text>
                    </HStack>
                  ) : null}

                  {profile?.website ? (
                    <HStack spacing={2}>
                      <FiGlobe />
                      <Link
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        color="action.primary"
                        _hover={{ color: 'action.hover' }}
                      >
                        Personal site
                      </Link>
                    </HStack>
                  ) : null}
                </HStack>

                <Flex direction={{ base: 'column', md: 'row' }} gap={4} align="stretch">
                  <Box
                    flex={1}
                    border="1px solid"
                    borderColor="border.subtle"
                    borderRadius="2xl"
                    bg="bg.page"
                    px={5}
                    py={4}
                  >
                    <Text
                      fontSize="xs"
                      textTransform="uppercase"
                      letterSpacing="0.14em"
                      color="text.tertiary"
                    >
                      Blogs
                    </Text>
                    <Text mt={2} fontSize="2xl" fontWeight="bold" color="text.primary">
                      {articleCount}
                    </Text>
                    <Text color="text.secondary">Blogs currently live on the site.</Text>
                  </Box>
                  <Box
                    flex={1}
                    border="1px solid"
                    borderColor="border.subtle"
                    borderRadius="2xl"
                    bg="bg.page"
                    px={5}
                    py={4}
                  >
                    <Text
                      fontSize="xs"
                      textTransform="uppercase"
                      letterSpacing="0.14em"
                      color="text.tertiary"
                    >
                      Drafts
                    </Text>
                    <Text mt={2} fontSize="2xl" fontWeight="bold" color="text.primary">
                      {draftCount}
                    </Text>
                    <Text color="text.secondary">Blogs still being refined before publishing.</Text>
                  </Box>
                </Flex>
              </VStack>
            </Flex>

            <Input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={onAvatarChange}
              display="none"
            />
          </Stack>
        )}
      </Box>
    </AnimatedCard>
  )
}

export default ProfileHeaderCard

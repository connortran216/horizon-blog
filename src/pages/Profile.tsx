import { Box, Container, VStack, useDisclosure } from '@chakra-ui/react'
import { MotionWrapper } from '../core'
import { useAuth } from '../context/AuthContext'
import { useParams } from 'react-router-dom'
import {
  AvatarPreviewModal,
  EditProfileModal,
  ProfileHeaderCard,
  ProfilePostsSection,
} from '../features/profile/components'
import { useProfileData } from '../features/profile/useProfileData'
import { useProfilePosts } from '../features/profile/useProfilePosts'

const Profile = () => {
  const { username } = useParams()
  const { user, status, refreshUserProfile } = useAuth()
  const {
    isOpen: isProfileEditorOpen,
    onOpen: onOpenProfileEditor,
    onClose: onCloseProfileEditor,
  } = useDisclosure()
  const {
    isOpen: isAvatarPreviewOpen,
    onOpen: onOpenAvatarPreview,
    onClose: onCloseAvatarPreview,
  } = useDisclosure()

  const {
    profile,
    profileLoading,
    profileForm,
    isSavingProfile,
    isUploadingAvatar,
    avatarInputRef,
    profileName,
    avatarSrc,
    setProfileFormField,
    openEditor,
    saveProfile,
    selectAvatar,
    onAvatarChange,
  } = useProfileData({
    status,
    user,
    routeUsername: username,
    refreshUserProfile,
  })

  const {
    postsLoading,
    publishedBlogs,
    draftBlogs,
    publishedPagination,
    draftPagination,
    handlePublishedPageChange,
    handleDraftPageChange,
    handleEdit,
    handleDelete,
  } = useProfilePosts({
    status,
    user,
  })

  const profileUsername = user?.username || username || ''

  const handleOpenProfileEditor = () => {
    openEditor(onOpenProfileEditor)
  }

  const handleSaveProfile = () => {
    void saveProfile(onCloseProfileEditor)
  }

  return (
    <MotionWrapper>
      <Box position="relative" pb={12} overflowX="hidden">
        <Box
          position="absolute"
          top={0}
          left="50%"
          transform="translateX(-50%)"
          w={{ base: '92%', md: '76%' }}
          h="280px"
          bg="action.glow"
          filter="blur(130px)"
          opacity={0.68}
          pointerEvents="none"
        />

        <Container maxW="container.xl" py={{ base: 8, md: 12 }} position="relative">
          <VStack spacing={{ base: 8, md: 10 }} align="stretch">
            <ProfileHeaderCard
              profile={profile}
              profileName={profileName}
              avatarSrc={avatarSrc}
              profileLoading={profileLoading}
              isUploadingAvatar={isUploadingAvatar}
              articleCount={publishedPagination.total}
              draftCount={draftPagination.total}
              avatarInputRef={avatarInputRef}
              onOpenProfileEditor={handleOpenProfileEditor}
              onOpenAvatarPreview={onOpenAvatarPreview}
              onSelectAvatar={selectAvatar}
              onAvatarChange={(event) => {
                void onAvatarChange(event)
              }}
            />

            <ProfilePostsSection
              postsLoading={postsLoading}
              profileUsername={profileUsername}
              publishedBlogs={publishedBlogs}
              draftBlogs={draftBlogs}
              publishedPagination={publishedPagination}
              draftPagination={draftPagination}
              onPublishedPageChange={handlePublishedPageChange}
              onDraftPageChange={handleDraftPageChange}
              onEdit={handleEdit}
              onDelete={(blogId) => {
                void handleDelete(blogId)
              }}
            />
          </VStack>
        </Container>
      </Box>

      <EditProfileModal
        isOpen={isProfileEditorOpen}
        isSavingProfile={isSavingProfile}
        profileForm={profileForm}
        onClose={onCloseProfileEditor}
        onProfileFormChange={setProfileFormField}
        onSaveProfile={handleSaveProfile}
      />

      <AvatarPreviewModal
        isOpen={isAvatarPreviewOpen}
        profileName={profileName}
        avatarSrc={avatarSrc}
        onClose={onCloseAvatarPreview}
      />
    </MotionWrapper>
  )
}

export default Profile

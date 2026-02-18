import { Container, VStack, useDisclosure } from '@chakra-ui/react'
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
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <ProfileHeaderCard
            profile={profile}
            profileName={profileName}
            avatarSrc={avatarSrc}
            profileLoading={profileLoading}
            isUploadingAvatar={isUploadingAvatar}
            articleCount={publishedPagination.total}
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

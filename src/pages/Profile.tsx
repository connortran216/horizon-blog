/**
 * The author workspace.
 *
 * `useProfileData` and `useProfilePosts` still own everything: the two request
 * lifecycles, the fifteen-second schedule clock, pagination, the avatar upload,
 * and every navigation the row menus perform. This page only decides what the
 * two of them look like next to each other.
 *
 * Two things from the legacy composition are gone. The 280px `blur(130px)` glow
 * behind the header was a raw blur radius painted by the page rather than by a
 * surface, and `DESIGN.md` reserves ambient artwork for Home and About. And
 * `MotionWrapper` wrapped the whole route in a translation that replayed on
 * every visit regardless of the reader's motion preference; the design system's
 * surfaces carry their own motion, under one reduced-motion policy.
 */

import { useDisclosure } from '@chakra-ui/react'
import { useParams } from 'react-router-dom'

import { ContentContainer, Section, Stack } from '../design-system'
import { useAuth } from '../context/AuthContext'
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
    avatarUploadError,
    profileName,
    avatarSrc,
    setProfileFormField,
    openEditor,
    saveProfile,
    uploadAvatarFile,
  } = useProfileData({
    status,
    user,
    routeUsername: username,
    refreshUserProfile,
  })

  const {
    postsLoading,
    publishedBlogs,
    scheduledBlogs,
    draftBlogs,
    publishedPagination,
    scheduledPagination,
    draftPagination,
    scheduleClock,
    handlePublishedPageChange,
    handleScheduledPageChange,
    handleDraftPageChange,
    handleEdit,
    handleReschedule,
    handlePublishNow,
    handleCancelSchedule,
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
    <ContentContainer>
      <Section>
        <Stack gap={8}>
          <ProfileHeaderCard
            profile={profile}
            profileName={profileName}
            avatarSrc={avatarSrc}
            profileLoading={profileLoading}
            isUploadingAvatar={isUploadingAvatar}
            avatarUploadError={avatarUploadError}
            articleCount={publishedPagination.total}
            draftCount={draftPagination.total}
            onOpenProfileEditor={handleOpenProfileEditor}
            onOpenAvatarPreview={onOpenAvatarPreview}
            onSelectAvatarFile={(file) => {
              void uploadAvatarFile(file)
            }}
          />

          <ProfilePostsSection
            postsLoading={postsLoading}
            profileUsername={profileUsername}
            publishedBlogs={publishedBlogs}
            scheduledBlogs={scheduledBlogs}
            draftBlogs={draftBlogs}
            publishedPagination={publishedPagination}
            scheduledPagination={scheduledPagination}
            draftPagination={draftPagination}
            scheduleClock={scheduleClock}
            onPublishedPageChange={handlePublishedPageChange}
            onScheduledPageChange={handleScheduledPageChange}
            onDraftPageChange={handleDraftPageChange}
            onEdit={handleEdit}
            onReschedule={handleReschedule}
            onPublishNow={handlePublishNow}
            onCancelSchedule={(blog) => {
              void handleCancelSchedule(blog)
            }}
            onDelete={(blogId) => {
              void handleDelete(blogId)
            }}
          />
        </Stack>
      </Section>

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
    </ContentContainer>
  )
}

export default Profile

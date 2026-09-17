/**
 * The identity block at the top of the author workspace.
 *
 * `ProfileHeader` owns the arrangement and `AvatarEditor` owns the portrait and
 * its controls, so this file is now the adapter between them and
 * `useProfileData`: it names the two counts, decides which owner controls exist,
 * and hands the upload straight back to the hook.
 *
 * What went with the legacy card: the hand-written `rgba()` border and shadow,
 * the two stacked radial gradients, and the avatar menu. The menu's trigger was
 * an `unstyled` Chakra `Button` wrapping the portrait, and the file input it
 * drove was `display="none"` - which takes the input out of the accessibility
 * tree entirely, so the only keyboard route to changing a picture was through a
 * menu that existed to work around that. `AvatarEditor` keeps a real, visually
 * hidden `input[type=file]` and a real button, so the control is reachable
 * without the menu. The menu's other item, "View avatar", survives as its own
 * button beside it.
 *
 * Who may write is still decided by `can(profile?.authorization, ...)`, exactly
 * where it was decided before. `ProfileHeader` takes the resulting controls as a
 * slot; it is not told the permission and cannot infer one.
 */

import { FiArrowRight, FiEdit3, FiMaximize2 } from 'react-icons/fi'

import {
  ActionLink,
  AvatarEditor,
  Button,
  ProfileHeader,
  Stack,
  type ProfileStat,
} from '../../../design-system'
import { can } from '../../../core/authorization/authorization'
import { UserProfile } from '../../../core/types/profile.types'

/** What the backend accepts for an avatar. Mirrored on the input's own filter. */
const ACCEPTED_AVATAR_TYPES = ['image/jpeg', 'image/png'] as const

interface ProfileHeaderCardProps {
  profile: UserProfile | null
  profileName: string
  avatarSrc?: string
  profileLoading: boolean
  isUploadingAvatar: boolean
  /** Why the last avatar upload failed. Shown under the portrait, as written. */
  avatarUploadError?: string
  articleCount: number
  draftCount: number
  onOpenProfileEditor: () => void
  onOpenAvatarPreview: () => void
  onSelectAvatarFile: (file: File) => void
}

const ProfileHeaderCard = ({
  profile,
  profileName,
  avatarSrc,
  profileLoading,
  isUploadingAvatar,
  avatarUploadError,
  articleCount,
  draftCount,
  onOpenProfileEditor,
  onOpenAvatarPreview,
  onSelectAvatarFile,
}: ProfileHeaderCardProps) => {
  const canWrite = can(profile?.authorization, 'content:manage:own')

  const stats: ProfileStat[] = [
    {
      label: 'Blogs',
      value: String(articleCount),
      detail: 'Blogs currently live on the site.',
    },
    {
      label: 'Drafts',
      value: String(draftCount),
      detail: 'Blogs still being refined before publishing.',
    },
  ]

  return (
    <ProfileHeader
      layout="workspace"
      eyebrow="Author workspace"
      isLoading={profileLoading}
      profile={{
        name: profileName,
        avatarUrl: avatarSrc ?? null,
        bio: profile?.bio,
        email: profile?.email,
        location: profile?.location,
        website: profile?.website,
      }}
      stats={stats}
      avatarSlot={
        <Stack gap={2} alignItems="stretch">
          <AvatarEditor
            presentation="workspace"
            name={profileName}
            src={avatarSrc ?? null}
            acceptedTypes={ACCEPTED_AVATAR_TYPES}
            isUploading={isUploadingAvatar}
            uploadError={avatarUploadError}
            isDisabled={profileLoading}
            onSelectFile={onSelectAvatarFile}
          />
          {/*
            The legacy menu's "View avatar". A button rather than a menu item
            because it is one action, and disabled when there is no picture to
            open - which is what the menu item did too.
          */}
          <Button
            tone="quiet"
            size="md"
            iconStart={<FiMaximize2 aria-hidden="true" />}
            isDisabled={!avatarSrc}
            onClick={onOpenAvatarPreview}
            alignSelf="flex-start"
          >
            View full size
          </Button>
        </Stack>
      }
      identityAction={
        <Button
          tone="link"
          size="md"
          iconStart={<FiEdit3 aria-hidden="true" />}
          isDisabled={profileLoading}
          onClick={onOpenProfileEditor}
          alignSelf="flex-start"
          data-profile-action="edit"
        >
          Edit profile
        </Button>
      }
      actions={
        canWrite ? (
          <ActionLink
            to="/blog-editor"
            weight="primary"
            iconStart={<FiEdit3 aria-hidden="true" />}
            iconEnd={<FiArrowRight aria-hidden="true" />}
          >
            Write a blog
          </ActionLink>
        ) : null
      }
    />
  )
}

export default ProfileHeaderCard

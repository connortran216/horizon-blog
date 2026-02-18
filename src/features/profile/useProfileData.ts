import { ChangeEvent, RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { UseToastOptions, useToast } from '@chakra-ui/react'
import { User } from '../../core/types/common.types'
import { UserProfile } from '../../core/types/profile.types'
import { AuthStatus } from '../../core/types/auth.types'
import { getProfileService } from '../../core/di/container'
import {
  buildFallbackProfile,
  buildProfileFormValues,
  DEFAULT_PROFILE_FORM,
  getProfileErrorMessage,
  sanitizeImageSrc,
} from './profile.utils'
import { ProfileFormValues } from './profile.types'

interface UseProfileDataParams {
  status: AuthStatus
  user: User | null
  routeUsername?: string
  refreshUserProfile: () => Promise<User | null>
}

interface UseProfileDataResult {
  profile: UserProfile | null
  profileLoading: boolean
  profileForm: ProfileFormValues
  isSavingProfile: boolean
  isUploadingAvatar: boolean
  avatarInputRef: RefObject<HTMLInputElement>
  profileName: string
  avatarSrc?: string
  setProfileFormField: (field: keyof ProfileFormValues, value: string) => void
  openEditor: (onOpen: () => void) => void
  saveProfile: (onSuccess: () => void) => Promise<void>
  selectAvatar: () => void
  onAvatarChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>
}

const buildToast = (config: UseToastOptions): UseToastOptions => ({
  duration: 3000,
  isClosable: true,
  ...config,
})

export const useProfileData = ({
  status,
  user,
  routeUsername,
  refreshUserProfile,
}: UseProfileDataParams): UseProfileDataResult => {
  const toast = useToast()
  const avatarInputRef = useRef<HTMLInputElement | null>(null)

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileForm, setProfileForm] = useState<ProfileFormValues>(DEFAULT_PROFILE_FORM)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarRefreshAttempted, setAvatarRefreshAttempted] = useState(false)

  const loadCurrentProfile = useCallback(
    async (showErrorToast = false, resetAvatarRetry = true): Promise<UserProfile | null> => {
      if (status !== AuthStatus.AUTHENTICATED) {
        setProfile(null)
        setProfileForm(DEFAULT_PROFILE_FORM)
        setProfileLoading(false)
        return null
      }

      setProfileLoading(true)

      try {
        const currentProfile = await getProfileService().getCurrentProfile()
        setProfile(currentProfile)
        setProfileForm(buildProfileFormValues(currentProfile))
        if (resetAvatarRetry) {
          setAvatarRefreshAttempted(false)
        }
        return currentProfile
      } catch (error) {
        if (showErrorToast) {
          toast(
            buildToast({
              title: 'Failed to load profile',
              description: getProfileErrorMessage(error, 'Unable to load your profile.'),
              status: 'error',
            }),
          )
        }

        return null
      } finally {
        setProfileLoading(false)
      }
    },
    [status, toast],
  )

  useEffect(() => {
    void loadCurrentProfile(true)
  }, [loadCurrentProfile])

  useEffect(() => {
    if (status === AuthStatus.UNAUTHENTICATED || !user) {
      setProfile(null)
      setProfileForm(DEFAULT_PROFILE_FORM)
      setProfileLoading(false)
    }
  }, [status, user])

  const setProfileFormField = (field: keyof ProfileFormValues, value: string) => {
    setProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const openEditor = (onOpen: () => void) => {
    const fallbackProfile = buildFallbackProfile(profile, user)
    setProfileForm(buildProfileFormValues(fallbackProfile))
    onOpen()
  }

  const saveProfile = async (onSuccess: () => void) => {
    const fallbackProfile = buildFallbackProfile(profile, user)
    const normalizedName = profileForm.name.trim() || fallbackProfile.name.trim()

    if (!normalizedName) {
      toast(
        buildToast({
          title: 'Name is required',
          description: 'Please enter your display name before saving.',
          status: 'error',
        }),
      )
      return
    }

    setIsSavingProfile(true)
    try {
      const updatedProfile = await getProfileService().updateCurrentProfile(fallbackProfile, {
        ...profileForm,
        name: normalizedName,
      })
      setProfile(updatedProfile)
      setProfileForm(buildProfileFormValues(updatedProfile))
      setAvatarRefreshAttempted(false)
      void refreshUserProfile()

      toast(
        buildToast({
          title: 'Profile updated',
          description: 'Your profile has been saved successfully.',
          status: 'success',
        }),
      )

      onSuccess()
    } catch (error) {
      toast(
        buildToast({
          title: 'Profile update failed',
          description: getProfileErrorMessage(error, 'Failed to update profile.'),
          status: 'error',
        }),
      )
    } finally {
      setIsSavingProfile(false)
    }
  }

  const selectAvatar = () => {
    avatarInputRef.current?.click()
  }

  const onAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    setIsUploadingAvatar(true)
    try {
      const updatedProfile = await getProfileService().uploadAvatar(file)
      setProfile(updatedProfile)
      setProfileForm(buildProfileFormValues(updatedProfile))
      setAvatarRefreshAttempted(false)
      void refreshUserProfile()

      toast(
        buildToast({
          title: 'Avatar updated',
          description: 'Your avatar has been updated successfully.',
          status: 'success',
        }),
      )
    } catch (error) {
      toast(
        buildToast({
          title: 'Avatar upload failed',
          description: getProfileErrorMessage(error, 'Failed to upload avatar.'),
          status: 'error',
        }),
      )
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  useEffect(() => {
    const safeAvatarUrl = sanitizeImageSrc(profile?.avatarUrl)
    if (!safeAvatarUrl || avatarRefreshAttempted) {
      return
    }

    let isMounted = true
    const imageProbe = new window.Image()
    imageProbe.src = safeAvatarUrl
    imageProbe.onerror = () => {
      if (!isMounted) return

      setAvatarRefreshAttempted(true)
      void loadCurrentProfile(false, false).then((refreshedProfile) => {
        if (refreshedProfile) {
          void refreshUserProfile()
        }
      })
    }

    return () => {
      isMounted = false
    }
  }, [profile?.avatarUrl, avatarRefreshAttempted, loadCurrentProfile, refreshUserProfile])

  const profileName = useMemo(
    () => profile?.name || user?.username || routeUsername || 'My Profile',
    [profile?.name, routeUsername, user?.username],
  )
  const avatarSrc = useMemo(
    () => sanitizeImageSrc(profile?.avatarUrl) || sanitizeImageSrc(user?.avatar),
    [profile?.avatarUrl, user?.avatar],
  )

  return {
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
  }
}

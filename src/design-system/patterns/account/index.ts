/**
 * Horizon Design System v2 - account and identity patterns.
 *
 * Covers the `account-identity-pattern` rows of the component inventory:
 * `AuthShell`, `AuthMethodDivider`, `GoogleAuthButton`, `ProfileHeaderCard`,
 * `AvatarPreviewModal`, `EditProfileModal`'s identity fields, `ContactInfoCard`,
 * `ContactPromptCard`, `CvExperienceCard`, `CvProjectEntry`, `AboutHero` and
 * `AboutStatCard`.
 *
 * Nothing here changes the auth or OAuth contract. The patterns take an outcome
 * the feature has already computed and decide only how it looks and reads.
 */

export { AuthPanel } from './AuthPanel'
export type { AuthPanelProps } from './AuthPanel'

export { AuthMethod, AuthMethodSeparator } from './AuthMethod'
export type { AuthMethodProps, AuthMethodSeparatorProps } from './AuthMethod'

export { AuthAlert, AuthCallbackFeedback, VerificationFeedback } from './VerificationFeedback'
export type {
  AuthAlertProps,
  AuthCallbackFeedbackProps,
  VerificationFeedbackProps,
} from './VerificationFeedback'

export { ProfileHeader } from './ProfileHeader'
export type { ProfileHeaderProps, ProfileIdentity, ProfileStat } from './ProfileHeader'

export { Avatar, AvatarEditor } from './AvatarEditor'
export type { AvatarEditorProps, AvatarProps, AvatarSize } from './AvatarEditor'

export { ContactCard, ContactPrompt } from './ContactCard'
export type { ContactCardProps, ContactPromptProps } from './ContactCard'

export { CVEntry } from './CVEntry'
export type { CVEntryLink, CVEntryProps } from './CVEntry'

export {
  authCallbackCopy,
  authFailureCopy,
  authFailureReasons,
  authMethodState,
  authPanelState,
  resendConfirmation,
  verificationCopy,
} from './auth.logic'
export type {
  AuthCallbackCopy,
  AuthCallbackStatus,
  AuthFailureReason,
  AuthMethodStateInput,
  AuthMethodStateOutput,
  AuthPanelStateInput,
  AuthPanelStateOutput,
  AuthPanelStatus,
  VerificationCopy,
  VerificationStatus,
} from './auth.logic'

export {
  avatarEditorState,
  avatarInitials,
  avatarRejection,
  bioPlaceholder,
  contactHref,
  cvPrintStyle,
  profileHeaderState,
  readableLinkText,
} from './identity.logic'
export type {
  AvatarCandidate,
  AvatarEditorStateInput,
  AvatarEditorStateOutput,
  AvatarEditorStatus,
  AvatarUploadLimits,
  ContactChannel,
  ContactHrefOutput,
  PrintStyle,
  ProfileHeaderStateInput,
  ProfileHeaderStateOutput,
  ProfileHeaderStatus,
} from './identity.logic'

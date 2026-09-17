/**
 * Horizon Design System v2 - account and identity entries.
 */

import { Box } from '@chakra-ui/react'
import { FiArrowRight, FiEdit3, FiMaximize2 } from 'react-icons/fi'

import {
  AuthAlert,
  AuthCallbackFeedback,
  AuthMethod,
  AuthMethodSeparator,
  AuthPanel,
  ActionLink,
  Avatar,
  AvatarEditor,
  Button,
  CVEntry,
  ContactCard,
  ContactPrompt,
  Field,
  Input,
  ProfileHeader,
  Stack,
  VerificationFeedback,
  type VerificationStatus,
} from '../../index'
import { space } from '../../../theme/tokens'
import {
  sampleAvatarLimits,
  sampleCVEntries,
  sampleContactCards,
  sampleProfile,
  sampleProfileStats,
  sampleProfileWithoutBio,
} from '../../patterns/account/fixtures'
import { useGallery } from '../GalleryContext'
import { Glyph, noop, type EntryRenderer } from './support'

function AuthPanelEntry({ state }: { readonly state: string }) {
  return (
    <AuthPanel
      eyebrow="Sample account"
      title="Sign in to the sample blog"
      description="The gallery has no backend, so nothing here submits anywhere."
      isSubmitting={state === 'submitting'}
      isUnavailable={state === 'unavailable'}
      validationError={
        state === 'validation error' ? 'That sample address is missing an @ sign.' : undefined
      }
      footer={<AuthMethodSeparator />}
    >
      <Box display="flex" flexDirection="column" gap={space[3]}>
        <Field label="Email address" id="gallery-auth-email">
          <Input placeholder="sample.author@example.com" />
        </Field>
        <Button tone="primary" isLoading={state === 'submitting'} loadingLabel="Signing in">
          Send the sample link
        </Button>
      </Box>
    </AuthPanel>
  )
}

function AuthMethodEntry({ state }: { readonly state: string }) {
  return (
    <AuthMethod
      provider="Sample Provider"
      onStart={noop}
      icon={<Glyph shape="dot" />}
      isDisabled={state === 'disabled'}
      isRedirecting={state === 'redirecting'}
    />
  )
}

function AuthMethodSeparatorEntry() {
  return <AuthMethodSeparator />
}

function AuthAlertEntry({ state }: { readonly state: string }) {
  if (state === 'success') {
    return (
      <AuthAlert
        tone="success"
        title="Sample link sent"
        detail="Check the sample inbox for a link that expires in an hour."
      />
    )
  }

  if (state === 'info') {
    return (
      <AuthAlert
        tone="info"
        title="Check the sample inbox"
        detail="If that sample address has an account, a link is on its way."
      />
    )
  }

  if (state === 'permission') {
    return (
      <AuthAlert
        tone="permission"
        title="This sample account cannot sign in"
        detail="Ask a sample administrator to restore access."
      />
    )
  }

  return (
    <AuthAlert
      tone="error"
      title="That sample link no longer works"
      detail="Request a new one and use it within the hour."
    />
  )
}

function AuthCallbackFeedbackEntry({ state }: { readonly state: string }) {
  const status = state === 'succeeded' ? 'succeeded' : state === 'failed' ? 'failed' : 'pending'

  return <AuthCallbackFeedback status={status} provider="Sample Provider" />
}

const VERIFICATION: Record<string, VerificationStatus> = {
  'awaiting the link': 'awaitingLink',
  checking: 'checking',
  verified: 'verified',
  'link unusable': 'linkUnusable',
}

function VerificationFeedbackEntry({ state }: { readonly state: string }) {
  return <VerificationFeedback status={VERIFICATION[state] ?? 'awaitingLink'} />
}

function ProfileHeaderEntry({ state }: { readonly state: string }) {
  const gallery = useGallery()
  const profile =
    state === 'no biography'
      ? sampleProfileWithoutBio
      : { ...sampleProfile, avatarUrl: gallery.image }

  if (state === 'workspace') {
    return (
      <ProfileHeader
        layout="workspace"
        profile={{
          name: 'Connor Tran',
          avatarUrl: gallery.image,
          bio: 'I’m Connor Tran, a backend engineer and indie developer in Ho Chi Minh City. I build and experiment with products, then write about what I learn, from software architecture and engineering tradeoffs to personal growth and life along the way.',
          email: 'sample.author@example.com',
          location: 'Vietnam',
          website: 'https://example.com/sample-author',
        }}
        eyebrow="Author workspace"
        stats={[
          { label: 'Blogs', value: '48', detail: 'Blogs currently live on the site.' },
          { label: 'Drafts', value: '4', detail: 'Blogs still being refined before publishing.' },
        ]}
        avatarSlot={
          <Stack gap={2} alignItems="stretch">
            <AvatarEditor
              presentation="workspace"
              name="Connor Tran"
              src={gallery.image}
              hasSource={gallery.image !== null}
              acceptedTypes={sampleAvatarLimits.allowedTypes}
              onSelectFile={noop}
            />
            <Button
              tone="quiet"
              size="md"
              iconStart={<FiMaximize2 aria-hidden="true" />}
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
            alignSelf="flex-start"
          >
            Edit profile
          </Button>
        }
        actions={
          <ActionLink
            href="#gallery-write"
            weight="primary"
            iconStart={<FiEdit3 aria-hidden="true" />}
            iconEnd={<FiArrowRight aria-hidden="true" />}
          >
            Write a blog
          </ActionLink>
        }
      />
    )
  }

  return (
    <ProfileHeader
      profile={state === 'missing' ? null : profile}
      eyebrow="Sample profile"
      stats={sampleProfileStats}
      isLoading={state === 'loading'}
      isMissing={state === 'missing'}
      deniedAction={state === 'denied' ? 'view this sample profile' : undefined}
      deniedDetail={state === 'denied' ? 'This sample profile is private.' : undefined}
      actions={<Button tone="secondary">Edit sample profile</Button>}
    />
  )
}

function AvatarEntry({ state }: { readonly state: string }) {
  const gallery = useGallery()
  const size = state === 'small' ? 'sm' : state === 'large' ? 'lg' : 'md'

  return (
    <Avatar
      name={sampleProfile.name}
      src={state === 'image failed' ? null : gallery.image}
      size={size}
      hasFailed={state === 'image failed'}
    />
  )
}

function AvatarEditorEntry({ state }: { readonly state: string }) {
  const gallery = useGallery()

  return (
    <AvatarEditor
      presentation={state === 'workspace' ? 'workspace' : 'standard'}
      name={sampleProfile.name}
      src={gallery.image}
      hasSource={gallery.image !== null}
      acceptedTypes={sampleAvatarLimits.allowedTypes}
      onSelectFile={noop}
      onReloadImage={noop}
      caption="Sample avatar. JPEG or PNG, up to five megabytes."
      isUploading={state === 'uploading'}
      isDisabled={state === 'disabled'}
      imageFailed={state === 'image failed'}
      uploadError={state === 'upload failed' ? 'That sample file is larger than 5 MB.' : undefined}
    />
  )
}

function ContactCardEntry({ state }: { readonly state: string }) {
  const card = sampleContactCards.find((entry) => entry.channel === state) ?? sampleContactCards[0]

  return <ContactCard {...card} icon={<Glyph shape="dot" />} />
}

function ContactPromptEntry() {
  return (
    <ContactPrompt
      title="Sample contact prompt"
      description="Nothing has been filled in yet, so the page asks for it."
      icon={<Glyph shape="dot" />}
    >
      <Button tone="secondary">Add sample contact details</Button>
    </ContactPrompt>
  )
}

function CVEntryEntry({ state }: { readonly state: string }) {
  const entry = state === 'project' ? sampleCVEntries[1] : sampleCVEntries[0]

  return <CVEntry {...entry} headingLevel="h3" />
}

export const accountEntries = {
  AuthPanel: AuthPanelEntry,
  AuthMethod: AuthMethodEntry,
  AuthMethodSeparator: AuthMethodSeparatorEntry,
  AuthAlert: AuthAlertEntry,
  AuthCallbackFeedback: AuthCallbackFeedbackEntry,
  VerificationFeedback: VerificationFeedbackEntry,
  ProfileHeader: ProfileHeaderEntry,
  Avatar: AvatarEntry,
  AvatarEditor: AvatarEditorEntry,
  ContactCard: ContactCardEntry,
  ContactPrompt: ContactPromptEntry,
  CVEntry: CVEntryEntry,
} satisfies Record<string, EntryRenderer>

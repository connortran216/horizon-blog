import { useState } from 'react'
import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import ProfileHeaderCard from '../../features/profile/components/ProfileHeaderCard'
import AvatarPreviewModal from '../../features/profile/components/AvatarPreviewModal'
import EditProfileModal from '../../features/profile/components/EditProfileModal'
import type { ProfileFormValues } from '../../features/profile/profile.types'
import { Text } from '../index'

const initialProfile: ProfileFormValues = {
  name: 'Connor Tran',
  bio: 'I’m Connor Tran, a backend engineer and indie developer in Ho Chi Minh City. I build and experiment with products, then write about what I learn, from software architecture and engineering tradeoffs to personal growth and life along the way.',
  location: 'Vietnam',
  website: 'https://connortran.io.vn',
}
const avatar = 'https://minio.connortran.io.vn/horizon-blog-public-bucket/connortran-avatar.jpg'

function WorkspacePreview({ missingAvatar = false }: { missingAvatar?: boolean }) {
  const [profile, setProfile] = useState(initialProfile)
  const [form, setForm] = useState(initialProfile)
  const [editing, setEditing] = useState(false)
  const [previewing, setPreviewing] = useState(false)
  const [selectedFile, setSelectedFile] = useState('')
  return (
    <Box maxW="1120px" mx="auto" py={8}>
      <ProfileHeaderCard
        profile={{
          ...profile,
          id: 1,
          email: 'canhtran210699@gmail.com',
          authorization: { role: 'author', permissions: ['content:manage:own'] },
        }}
        profileName={profile.name}
        avatarSrc={missingAvatar ? undefined : avatar}
        profileLoading={false}
        isUploadingAvatar={false}
        articleCount={12}
        draftCount={3}
        onOpenProfileEditor={() => {
          setForm(profile)
          setEditing(true)
        }}
        onOpenAvatarPreview={() => setPreviewing(true)}
        onSelectAvatarFile={(file) => setSelectedFile(file.name)}
      />
      {selectedFile ? (
        <Text role="status">Selected {selectedFile}. This preview does not upload files.</Text>
      ) : null}
      <AvatarPreviewModal
        isOpen={previewing}
        onClose={() => setPreviewing(false)}
        profileName={profile.name}
        avatarSrc={missingAvatar ? undefined : avatar}
      />
      <EditProfileModal
        isOpen={editing}
        onClose={() => setEditing(false)}
        profileForm={form}
        isSavingProfile={false}
        onProfileFormChange={(field, value) =>
          setForm((current) => ({ ...current, [field]: value }))
        }
        onSaveProfile={() => {
          setProfile(form)
          setEditing(false)
        }}
      />
    </Box>
  )
}

const meta = {
  title: 'Author/Profile header',
  component: WorkspacePreview,
  parameters: {
    docs: {
      description: {
        component:
          'Compact owner masthead. Profile edits are held in this preview only; file selection never uploads. Use theme controls to inspect dark and light modes.',
      },
    },
  },
} satisfies Meta<typeof WorkspacePreview>
export default meta
type Story = StoryObj<typeof meta>
export const Workspace: Story = {}
export const MissingAvatar: Story = { args: { missingAvatar: true } }

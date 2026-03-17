import { Avatar, HStack, Text } from '@chakra-ui/react'
import { User } from '../../../core'

interface EditorMetaBarProps {
  user: User | null
  saveStatus: string
  saveTone: string
}

const EditorMetaBar = ({ user, saveStatus, saveTone }: EditorMetaBarProps) => {
  return (
    <HStack spacing={3} justify="space-between">
      <HStack spacing={3}>
        <Avatar size="sm" src={user?.avatar} name={user?.username} />
        <Text fontSize="sm" color="text.secondary">
          {user?.username || 'Anonymous'}
        </Text>
      </HStack>
      <Text fontSize="sm" color={saveTone}>
        {saveStatus}
      </Text>
    </HStack>
  )
}

export default EditorMetaBar

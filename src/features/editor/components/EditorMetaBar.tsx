import { Avatar, Badge, Box, HStack, Stack, Text, VStack } from '@chakra-ui/react'
import { User } from '../../../core'

interface EditorMetaBarProps {
  user: User | null
  saveStatus: string
  saveTone: string
  draftLabel: string
}

const EditorMetaBar = ({ user, saveStatus, saveTone, draftLabel }: EditorMetaBarProps) => {
  return (
    <Stack spacing={3} align={{ base: 'stretch', lg: 'flex-end' }} w={{ base: 'full', lg: 'auto' }}>
      <Badge
        alignSelf={{ base: 'flex-start', lg: 'flex-end' }}
        px={3}
        py={1.5}
        borderRadius="full"
        bg="action.subtle"
        color="action.primary"
        textTransform="uppercase"
        letterSpacing="0.16em"
        fontSize="10px"
      >
        {draftLabel}
      </Badge>

      <Box
        minW={{ base: 'full', lg: '18rem' }}
        border="1px solid"
        borderColor="border.subtle"
        borderRadius="2xl"
        bg="bg.page"
        px={4}
        py={4}
        boxShadow="sm"
      >
        <HStack spacing={3} align="center">
          <Avatar size="sm" src={user?.avatar} name={user?.username} />
          <VStack align="flex-start" spacing={0.5}>
            <Text fontSize="sm" fontWeight="semibold" color="text.primary">
              {user?.username || 'Anonymous'}
            </Text>
            <Text
              fontSize="xs"
              color="text.tertiary"
              textTransform="uppercase"
              letterSpacing="0.12em"
            >
              Author
            </Text>
          </VStack>
        </HStack>

        <Box mt={4} pt={4} borderTop="1px solid" borderColor="border.subtle">
          <Text
            fontSize="xs"
            color="text.tertiary"
            textTransform="uppercase"
            letterSpacing="0.12em"
          >
            Save status
          </Text>
          <Text mt={1.5} fontSize="sm" fontWeight="medium" color={saveTone}>
            {saveStatus}
          </Text>
        </Box>
      </Box>
    </Stack>
  )
}

export default EditorMetaBar

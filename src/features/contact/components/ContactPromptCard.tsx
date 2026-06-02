import { Box, Flex, Heading, Icon, Stack, Text } from '@chakra-ui/react'
import { ContactPromptItem } from '../contact.types'

interface ContactPromptCardProps {
  prompt: ContactPromptItem
}

const ContactPromptCard = ({ prompt }: ContactPromptCardProps) => (
  <Box
    border="1px solid"
    borderColor="border.subtle"
    borderRadius="2xl"
    bg="bg.secondary"
    p={{ base: 5, md: 6 }}
    h="100%"
  >
    <Stack spacing={4}>
      <Flex
        w={10}
        h={10}
        align="center"
        justify="center"
        borderRadius="xl"
        bg="bg.tertiary"
        color="action.primary"
      >
        <Icon as={prompt.icon} boxSize={4} />
      </Flex>
      <Heading size="md" color="text.primary" letterSpacing="-0.02em">
        {prompt.title}
      </Heading>
      <Text color="text.secondary" lineHeight="tall">
        {prompt.description}
      </Text>
    </Stack>
  </Box>
)

export default ContactPromptCard

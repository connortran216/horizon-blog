import { Flex, Heading, Icon, Stack, Text } from '@chakra-ui/react'
import { AnimatedCard } from '../../../core'
import { ContactPromptItem } from '../contact.types'

interface ContactPromptCardProps {
  prompt: ContactPromptItem
}

const ContactPromptCard = ({ prompt }: ContactPromptCardProps) => (
  <AnimatedCard intensity="light" maxW="100%" animation="fadeInUp">
    <Stack spacing={4} p={6}>
      <Flex
        w={12}
        h={12}
        align="center"
        justify="center"
        borderRadius="2xl"
        bg="bg.tertiary"
        color="accent.primary"
      >
        <Icon as={prompt.icon} boxSize={5} />
      </Flex>
      <Heading size="md" color="text.primary" letterSpacing="-0.02em">
        {prompt.title}
      </Heading>
      <Text color="text.secondary" lineHeight="tall">
        {prompt.description}
      </Text>
    </Stack>
  </AnimatedCard>
)

export default ContactPromptCard

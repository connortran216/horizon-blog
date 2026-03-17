import { Flex, Icon, Link, Stack, Text } from '@chakra-ui/react'
import { AnimatedCard } from '../../../core'
import { ContactInfoItem } from '../contact.types'

interface ContactInfoCardProps {
  info: ContactInfoItem
}

const ContactInfoCard = ({ info }: ContactInfoCardProps) => (
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
        <Icon as={info.icon} boxSize={5} />
      </Flex>
      <Stack spacing={2}>
        <Text fontWeight="semibold" color="text.primary">
          {info.title}
        </Text>
        {info.href ? (
          <Link href={info.href} color="text.secondary" lineHeight="tall">
            {info.content}
          </Link>
        ) : (
          <Text color="text.secondary" lineHeight="tall">
            {info.content}
          </Text>
        )}
      </Stack>
    </Stack>
  </AnimatedCard>
)

export default ContactInfoCard

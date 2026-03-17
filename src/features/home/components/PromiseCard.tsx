import { Flex, Heading, Icon, Stack, Text } from '@chakra-ui/react'
import { IconType } from 'react-icons'
import { AnimatedCard } from '../../../core'

interface PromiseCardProps {
  icon: IconType
  title: string
  description: string
}

const PromiseCard = ({ icon, title, description }: PromiseCardProps) => (
  <AnimatedCard intensity="light" animation="fadeInUp" maxW="100%">
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
        <Icon as={icon} boxSize={5} />
      </Flex>
      <Stack spacing={2}>
        <Heading size="md" color="text.primary" letterSpacing="-0.02em">
          {title}
        </Heading>
        <Text color="text.secondary" lineHeight="tall">
          {description}
        </Text>
      </Stack>
    </Stack>
  </AnimatedCard>
)

export default PromiseCard

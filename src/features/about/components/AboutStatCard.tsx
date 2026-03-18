import { Flex, Icon, Stack, Text } from '@chakra-ui/react'
import { AnimatedCard } from '../../../core'
import { AboutStatItem } from '../about.types'

const AboutStatCard = ({ icon, label, value }: AboutStatItem) => (
  <AnimatedCard intensity="light" maxW="100%" animation="fadeInUp">
    <Stack spacing={4} p={6}>
      <Flex
        w={12}
        h={12}
        align="center"
        justify="center"
        borderRadius="2xl"
        bg="bg.tertiary"
        color="action.primary"
      >
        <Icon as={icon} boxSize={5} />
      </Flex>
      <Stack spacing={1}>
        <Text fontSize="2xl" fontWeight="bold" color="text.primary" letterSpacing="-0.03em">
          {value}
        </Text>
        <Text color="text.secondary" lineHeight="tall">
          {label}
        </Text>
      </Stack>
    </Stack>
  </AnimatedCard>
)

export default AboutStatCard

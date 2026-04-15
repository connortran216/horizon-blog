import { Box, Flex, Icon, Stack, Text } from '@chakra-ui/react'
import { AboutStatItem } from '../about.types'

const AboutStatCard = ({ icon, label, value, description }: AboutStatItem) => (
  <Box
    h="100%"
    border="1px solid"
    borderColor="border.subtle"
    borderRadius="2xl"
    bg="bg.secondary"
    px={5}
    py={6}
    transition="background-color 0.2s ease, border-color 0.2s ease"
    _hover={{
      bg: 'bg.elevated',
      borderColor: 'border.default',
    }}
  >
    <Stack spacing={5} h="100%">
      <Flex align="flex-start" justify="space-between" gap={4}>
        <Flex
          w={11}
          h={11}
          align="center"
          justify="center"
          borderRadius="2xl"
          bg="bg.tertiary"
          color="action.primary"
          flexShrink={0}
        >
          <Icon as={icon} boxSize={4.5} />
        </Flex>
        <Text
          fontSize="xs"
          fontWeight="semibold"
          color="text.tertiary"
          textTransform="uppercase"
          letterSpacing="0.14em"
          textAlign="right"
        >
          {label}
        </Text>
      </Flex>
      <Stack spacing={2} flex="1">
        <Text
          fontSize={{ base: '2xl', md: '3xl' }}
          fontWeight="bold"
          color="text.primary"
          letterSpacing="-0.04em"
        >
          {value}
        </Text>
        {description ? (
          <Text color="text.secondary" lineHeight="tall">
            {description}
          </Text>
        ) : null}
      </Stack>
    </Stack>
  </Box>
)

export default AboutStatCard

import { Box, Button, Flex, Icon, Link, Stack, Text } from '@chakra-ui/react'
import { ContactInfoItem } from '../contact.types'

interface ContactInfoCardProps {
  info: ContactInfoItem
}

const ContactInfoCard = ({ info }: ContactInfoCardProps) => {
  const isPrimary = info.variant === 'primary'

  return (
    <Box
      border="1px solid"
      borderColor={isPrimary ? 'action.primary' : 'border.subtle'}
      borderRadius="2xl"
      bg={isPrimary ? 'action.subtle' : 'bg.secondary'}
      p={{ base: 5, md: 6 }}
      h="100%"
    >
      <Stack spacing={4} h="100%">
        <Flex
          w={11}
          h={11}
          align="center"
          justify="center"
          borderRadius="xl"
          bg={isPrimary ? 'bg.secondary' : 'bg.tertiary'}
          color="action.primary"
        >
          <Icon as={info.icon} boxSize={5} />
        </Flex>
        <Stack spacing={2} flex="1">
          <Text fontWeight="semibold" color="text.primary">
            {info.title}
          </Text>
          {info.href ? (
            <Link
              href={info.href}
              color={isPrimary ? 'action.primary' : 'text.secondary'}
              lineHeight="tall"
            >
              {info.content}
            </Link>
          ) : (
            <Text color="text.secondary" lineHeight="tall">
              {info.content}
            </Text>
          )}
          {info.description && (
            <Text color="text.tertiary" fontSize="sm" lineHeight="tall">
              {info.description}
            </Text>
          )}
        </Stack>
        {info.href && info.actionLabel && (
          <Button
            as={Link}
            href={info.href}
            alignSelf="flex-start"
            size="sm"
            variant={isPrimary ? 'solid' : 'outline'}
            _hover={{ textDecoration: 'none' }}
          >
            {info.actionLabel}
          </Button>
        )}
      </Stack>
    </Box>
  )
}

export default ContactInfoCard

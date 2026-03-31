import { Box, HStack, Text } from '@chakra-ui/react'

interface AuthMethodDividerProps {
  label: string
}

const AuthMethodDivider = ({ label }: AuthMethodDividerProps) => (
  <HStack spacing="4" align="center">
    <Box flex="1" h="1px" bg="border.subtle" />
    <Text
      color="text.tertiary"
      fontSize="xs"
      fontWeight="semibold"
      letterSpacing="0.16em"
      textTransform="uppercase"
    >
      {label}
    </Text>
    <Box flex="1" h="1px" bg="border.subtle" />
  </HStack>
)

export default AuthMethodDivider

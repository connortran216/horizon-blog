import { Box, Container, Heading, Link, Stack, Text } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { ReactNode } from 'react'

interface AuthShellProps {
  title: string
  description: ReactNode
  children: ReactNode
}

const AuthShell = ({ title, description, children }: AuthShellProps) => {
  return (
    <Container maxW="md" py={{ base: '10', md: '20' }}>
      <Stack spacing={{ base: '8', md: '10' }}>
        <Stack spacing="3" textAlign="center" align="center">
          <Text
            color="text.tertiary"
            fontSize="xs"
            fontWeight="semibold"
            letterSpacing="0.18em"
            textTransform="uppercase"
          >
            Account
          </Text>
          <Heading color="text.primary" size="lg" letterSpacing="-0.02em">
            {title}
          </Heading>
          <Text color="text.secondary" maxW="28rem">
            {description}
          </Text>
        </Stack>

        <Box
          py={{ base: '0', sm: '8' }}
          px={{ base: '0', sm: '8', md: '10' }}
          bg={{ base: 'transparent', sm: 'bg.glass' }}
          backdropFilter={{ base: 'none', sm: 'blur(18px)' }}
          boxShadow={{ base: 'none', sm: 'xl' }}
          borderRadius={{ base: 'none', sm: '2xl' }}
          border="1px solid"
          borderColor={{ base: 'transparent', sm: 'border.subtle' }}
        >
          {children}
        </Box>
      </Stack>
    </Container>
  )
}

export const AuthInlineLink = ({
  to,
  children,
  state,
}: {
  to: string
  children: ReactNode
  state?: unknown
}) => (
  <Link
    as={RouterLink}
    to={to}
    state={state}
    color="action.primary"
    fontWeight="semibold"
    _hover={{ color: 'action.hover', textDecoration: 'underline' }}
  >
    {children}
  </Link>
)

export default AuthShell

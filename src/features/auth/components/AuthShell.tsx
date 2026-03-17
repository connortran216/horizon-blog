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
    <Container maxW="lg" py={{ base: '12', md: '24' }}>
      <Stack spacing="8">
        <Stack spacing="6" textAlign="center">
          <Heading color="text.primary">{title}</Heading>
          <Text color="text.secondary">{description}</Text>
        </Stack>

        <Box
          py={{ base: '0', sm: '8' }}
          px={{ base: '4', sm: '10' }}
          bg={{ base: 'transparent', sm: 'bg.secondary' }}
          boxShadow={{ base: 'none', sm: 'md' }}
          borderRadius={{ base: 'none', sm: 'xl' }}
          border="1px solid"
          borderColor={{ base: 'transparent', sm: 'border.subtle' }}
        >
          {children}
        </Box>
      </Stack>
    </Container>
  )
}

export const AuthInlineLink = ({ to, children }: { to: string; children: ReactNode }) => (
  <Link as={RouterLink} to={to} color="link.default">
    {children}
  </Link>
)

export default AuthShell

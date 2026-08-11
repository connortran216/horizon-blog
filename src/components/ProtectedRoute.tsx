import { ReactNode } from 'react'
import { Box, Button, Container, Heading, Stack, Text } from '@chakra-ui/react'
import { Link as RouterLink, Navigate, useLocation } from 'react-router-dom'
import { LoadingScreen } from './core/animations/LoadingState'
import { useAuth } from '../context/AuthContext'
import { can, Permission } from '../core/authorization/authorization'

interface ProtectedRouteProps {
  children: ReactNode
  requiredPermission?: Permission
}

const ProtectedRoute = ({ children, requiredPermission }: ProtectedRouteProps) => {
  const { status, user } = useAuth()
  const location = useLocation()

  // Show the shared loading surface while determining auth status
  if (status === 'loading') {
    return (
      <LoadingScreen
        label="Checking your session"
        description="Preparing your protected workspace."
      />
    )
  }

  // Redirect to login if not authenticated, preserving the intended destination
  if (status === 'unauthenticated' || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (requiredPermission && !can(user.authorization, requiredPermission)) {
    return (
      <Container maxW="container.md" py={{ base: 16, md: 24 }}>
        <Box
          bg="bg.secondary"
          border="1px solid"
          borderColor="border.subtle"
          borderRadius="2xl"
          p={8}
        >
          <Stack spacing={4} align="flex-start">
            <Heading size="lg" color="text.primary">
              This workspace is not available to your account
            </Heading>
            <Text color="text.secondary">
              You are still signed in. Ask an administrator if you need access to this area.
            </Text>
            <Button
              as={RouterLink}
              to="/"
              bg="action.primary"
              color="white"
              _hover={{ bg: 'action.hover' }}
            >
              Return home
            </Button>
          </Stack>
        </Box>
      </Container>
    )
  }

  // Render the protected component if authenticated
  return <>{children}</>
}

export default ProtectedRoute

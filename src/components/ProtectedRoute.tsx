import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Spinner, Center } from '@chakra-ui/react'

interface ProtectedRouteProps {
  children: ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { status, user } = useAuth()
  const location = useLocation()

  // Show loading spinner while determining auth status
  if (status === 'loading') {
    return (
      <Center minH="100vh">
        <Spinner size="xl" color="accent.primary" />
      </Center>
    )
  }

  // Redirect to login if not authenticated, preserving the intended destination
  if (status === 'unauthenticated' || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  // Render the protected component if authenticated
  return <>{children}</>
}

export default ProtectedRoute

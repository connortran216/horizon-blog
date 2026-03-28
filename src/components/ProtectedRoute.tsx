import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { LoadingScreen } from './core/animations/LoadingState'
import { useAuth } from '../context/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
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

  // Render the protected component if authenticated
  return <>{children}</>
}

export default ProtectedRoute

import React, { Component, ReactNode } from 'react'
import { Box, Button, Heading, Text, VStack, useToast } from '@chakra-ui/react'
import { logError, getErrorMessage } from '../utils/error.utils'

/**
 * Props for ErrorBoundary component
 */
interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

/**
 * State for ErrorBoundary component
 */
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

/**
 * Error Boundary component to catch JavaScript errors in React component tree
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // Log error for debugging
    logError(error, 'React Error Boundary')

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return <ErrorFallback error={this.state.error} onRetry={this.handleRetry} />
    }

    return this.props.children
  }
}

/**
 * Default error fallback component
 */
interface ErrorFallbackProps {
  error: Error | null
  onRetry: () => void
}

function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  const toast = useToast()

  const handleRetry = () => {
    onRetry()
    toast({
      title: 'Retrying...',
      description: 'Please wait while we reload the component.',
      status: 'info',
      duration: 2000,
      isClosable: true,
    })
  }

  return (
    <Box
      p={8}
      maxW="container.md"
      mx="auto"
      textAlign="center"
      borderRadius="lg"
      bg="red.50"
      border="1px"
      borderColor="red.200"
    >
      <VStack spacing={4}>
        <Heading size="md" color="red.600">
          Oops! Something went wrong
        </Heading>

        <Text color="red.700">
          {error ? getErrorMessage(error) : 'An unexpected error occurred'}
        </Text>

        <Text fontSize="sm" color="red.500">
          If this problem persists, please refresh the page or contact support.
        </Text>

        <Button colorScheme="red" variant="outline" onClick={handleRetry} size="sm">
          Try Again
        </Button>
      </VStack>
    </Box>
  )
}

/**
 * Hook for handling errors in functional components
 */
export function useErrorHandler() {
  const toast = useToast()

  const handleError = (error: unknown, context?: string) => {
    logError(error, context)

    toast({
      title: 'Error',
      description: getErrorMessage(error),
      status: 'error',
      duration: 5000,
      isClosable: true,
    })
  }

  return { handleError }
}

/**
 * Higher-order component for error handling
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>,
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}

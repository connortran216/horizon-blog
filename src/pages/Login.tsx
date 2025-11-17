import { useState } from 'react'
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  useToast,
  Heading,
  Link,
  useColorModeValue,
} from '@chakra-ui/react'
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading } = useAuth()

  // Dark mode color values
  const headingColor = useColorModeValue('gray.900', 'text.primary')
  const textColor = useColorModeValue('gray.600', 'text.secondary')
  const linkColor = useColorModeValue('black', 'link.default')
  const buttonBg = useColorModeValue('black', 'accent.primary')
  const buttonHoverBg = useColorModeValue('gray.800', 'accent.hover')
  const toastBg = useColorModeValue('black', 'bg.elevated')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await login({ email, password })
      toast({
        title: 'Login Successful',
        description: `Welcome back!`,
        position: 'top',
        duration: 3000,
        isClosable: true,
        variant: 'solid',
        render: () => (
          <Box color="white" p={3} bg={toastBg} borderRadius="md" boxShadow="md">
            <Box display="flex" alignItems="center" mb={1}>
              <Box as="span" mr={2}>
                ✓
              </Box>
              <Text fontWeight="bold">Login Successful</Text>
            </Box>
            <Text>Welcome back!</Text>
          </Box>
        ),
      })

      // Redirect to the intended destination or home page
      const destination = location.state?.from || '/'
      navigate(destination, { replace: true })
    } catch {
      toast({
        title: 'Login failed',
        description: 'Please check your credentials and try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  return (
    <Container maxW="lg" py={{ base: '12', md: '24' }}>
      <Stack spacing="8">
        <Stack spacing="6" textAlign="center">
          <Heading color={headingColor}>Log in to your account</Heading>
          <Text color={textColor}>
            Don't have an account?{' '}
            <Link as={RouterLink} to="/register" color={linkColor}>
              Sign up
            </Link>
          </Text>
        </Stack>

        <Box
          py={{ base: '0', sm: '8' }}
          px={{ base: '4', sm: '10' }}
          bg={{ base: 'transparent', sm: 'bg-surface' }}
          boxShadow={{ base: 'none', sm: 'md' }}
          borderRadius={{ base: 'none', sm: 'xl' }}
        >
          <form onSubmit={handleSubmit}>
            <Stack spacing="6">
              <FormControl isRequired>
                <FormLabel htmlFor="email">Email</FormLabel>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel htmlFor="password">Password</FormLabel>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormControl>

              <Button
                type="submit"
                bg={buttonBg}
                color="white"
                _hover={{
                  bg: buttonHoverBg,
                }}
                size="lg"
                fontSize="md"
                isLoading={isLoading}
              >
                Sign in
              </Button>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Container>
  )
}

export default Login

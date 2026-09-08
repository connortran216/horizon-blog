import { useEffect, useState } from 'react'
import {
  Box,
  Container,
  Flex,
  HStack,
  IconButton,
  Stack,
  Button,
  useColorMode,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { CloseIcon, HamburgerIcon, SunIcon, MoonIcon } from '@chakra-ui/icons'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getBlogService, toPublicPostPath } from '../../core'
import { AnimatedPrimaryButton } from '../../components/core/animations/AnimatedButton'
import '../../features/editor/editor.window'
import NavLinkButton from './NavLinkButton'
import UserMenu from './UserMenu'
import { SITE_LINKS } from './nav-links'
import { can } from '../../core/authorization/authorization'

const Navbar = () => {
  const { isOpen, onToggle, onClose } = useDisclosure()
  const { user, logout } = useAuth()
  const { colorMode, toggleColorMode } = useColorMode()
  const navigate = useNavigate()
  const location = useLocation()
  const isEditorPage = location.pathname === '/blog-editor'
  const toast = useToast()
  const [editorState, setEditorState] = useState<{
    title: string
    content_markdown: string
    handlePublish?: () => Promise<boolean>
  }>({ title: '', content_markdown: '' })
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const canWrite = can(user?.authorization, 'content:manage:own')

  useEffect(() => {
    const checkEditorState = () => {
      if (window.editorState) {
        setEditorState(window.editorState)
      }
    }

    checkEditorState()
    const interval = setInterval(checkEditorState, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = async () => {
    if (isLoggingOut) {
      return
    }

    setIsLoggingOut(true)
    try {
      const result = await logout()
      if (!result.serverRevoked) {
        toast({
          title: 'Signed out on this tab',
          description:
            'Server revocation could not be confirmed. Sign in again only after checking your connection.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        })
      }
      navigate('/')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handlePublish = async () => {
    if (editorState.handlePublish) {
      await editorState.handlePublish()
      return
    }

    if (!editorState.title?.trim()) {
      toast({
        title: 'Error',
        description: 'Title is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    try {
      const post = await getBlogService().publishPost(null, {
        title: editorState.title.trim(),
        content_markdown: editorState.content_markdown,
        content_json: '{}',
      })

      toast({
        title: 'Success',
        description: 'Your blog is now live.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      const { particleSystem } = await import('../../components/core/animations/ParticleSystem')
      particleSystem.showSuccessParticles()
      navigate(toPublicPostPath(post.id))
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to publish your story. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  useEffect(() => {
    onClose()
  }, [location.pathname, onClose])

  return (
    <Box
      as="header"
      className="app-navbar"
      mx={{ base: 4, md: 'auto' }}
      mt={4}
      px={{ base: 3, md: 6 }}
      w={{ md: 'calc(100% - 48px)' }}
      maxW="1120px"
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="20px"
      bg="bg.secondary"
      boxShadow="sm"
      position="relative"
      zIndex={1000}
    >
      <Container maxW="full" p={0}>
        <Flex minH={{ base: '64px', md: '72px' }} align="center" gap={{ base: 2, md: 7 }}>
          <Box as={RouterLink} to="/" aria-label="Horizon home" flexShrink={0}>
            <Box
              as="span"
              fontFamily="'Be Vietnam Pro', sans-serif"
              fontSize={{ base: '25px', md: '28px' }}
              fontWeight={700}
              letterSpacing="-1.5px"
              lineHeight={1}
            >
              horizon
              <Box as="span" color="action.primary">
                .
              </Box>
            </Box>
          </Box>
          <HStack
            as="nav"
            aria-label="Main navigation"
            spacing={4}
            display={{ base: 'none', md: 'flex' }}
          >
            {SITE_LINKS.map((link) => (
              <NavLinkButton key={link.path} to={link.path}>
                {link.name}
              </NavLinkButton>
            ))}
          </HStack>
          <Flex ml="auto" align="center" gap={{ base: 1, md: 3 }}>
            <IconButton
              aria-label={colorMode === 'light' ? 'Use dark mode' : 'Use light mode'}
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              variant="ghost"
              size="sm"
            />
            {user && canWrite && !isEditorPage ? (
              <NavLinkButton to="/blog-editor">Write</NavLinkButton>
            ) : null}
            {user && canWrite && isEditorPage ? (
              <AnimatedPrimaryButton onClick={handlePublish}>Publish</AnimatedPrimaryButton>
            ) : null}
            {user ? (
              <UserMenu
                user={user}
                colorMode={colorMode}
                onToggleColorMode={toggleColorMode}
                onLogout={handleLogout}
                isLoggingOut={isLoggingOut}
              />
            ) : (
              <Button as={RouterLink} to="/login" variant="ghost" size="sm">
                Sign in
              </Button>
            )}
            <IconButton
              size="sm"
              icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
              aria-label="Toggle navigation"
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
              display={{ md: 'none' }}
              onClick={onToggle}
              variant="ghost"
            />
          </Flex>
        </Flex>
        {isOpen ? (
          <Stack
            id="mobile-navigation"
            as="nav"
            aria-label="Mobile navigation"
            pb={4}
            spacing={2}
            display={{ md: 'none' }}
          >
            {SITE_LINKS.map((link) => (
              <NavLinkButton key={link.path} to={link.path}>
                {link.name}
              </NavLinkButton>
            ))}
          </Stack>
        ) : null}
      </Container>
    </Box>
  )
}

export default Navbar
